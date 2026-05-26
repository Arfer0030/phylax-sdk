// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {ValidationData, _parseValidationData} from "@account-abstraction/contracts/core/Helpers.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {IPaymaster} from "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

import {ArbAgentAccountFactory} from "../src/ArbAgentAccountFactory.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {ArbAgentPaymaster} from "../src/ArbAgentPaymaster.sol";
import {MockEntryPoint} from "./utils/MockEntryPoint.sol";

/// @title ArbAgentPaymasterTest
/// @notice Unit tests for owner gas tanks, sponsorship validation, and post-operation billing.
contract ArbAgentPaymasterTest is Test {
    uint256 internal constant TOKEN_PER_NATIVE_TOKEN = 3_000e6;
    uint16 internal constant MARKUP_BPS = 500;

    address internal owner = makeAddr("owner");
    address internal otherOwner = makeAddr("otherOwner");
    address internal receiver = makeAddr("receiver");

    MockEntryPoint internal entryPoint;
    MockUSDC internal billingToken;
    ArbAgentAccountFactory internal factory;
    ArbAgentPaymaster internal paymaster;

    address internal ownerAccount;
    address internal secondOwnerAccount;

    /// @notice Deploys a fresh local paymaster stack and seeds owner balances before each test.
    function setUp() public {
        entryPoint = new MockEntryPoint();
        billingToken = new MockUSDC();
        factory = new ArbAgentAccountFactory(IEntryPoint(address(entryPoint)));
        paymaster =
            new ArbAgentPaymaster(IEntryPoint(address(entryPoint)), billingToken, TOKEN_PER_NATIVE_TOKEN, MARKUP_BPS);

        (ownerAccount,) = factory.createAgentAccount(owner);
        (secondOwnerAccount,) = factory.createAgentAccount(otherOwner);

        billingToken.mint(owner, 25_000e6);
        billingToken.mint(otherOwner, 25_000e6);
    }

    /// @notice Verifies owners can top up and withdraw unused gas tank balances.
    function test_topUpAndWithdrawGasTank() public {
        vm.startPrank(owner);
        billingToken.approve(address(paymaster), 2_000e6);
        paymaster.topUpGasTank(2_000e6);
        paymaster.withdrawGasTank(receiver, 750e6);
        vm.stopPrank();

        assertEq(paymaster.gasTankBalance(owner), 1_250e6);
        assertEq(billingToken.balanceOf(receiver), 750e6);
    }

    /// @notice Verifies validation reserves gas tank balance until the user operation settles in postOp.
    function test_validatePaymasterUserOp_reservesChargeUntilSettlement() public {
        _topUpAndRegister(owner, ownerAccount, 10_000e6);

        PackedUserOperation memory userOp;
        userOp.sender = ownerAccount;
        bytes32 userOpHash = keccak256("reserved-user-op");
        uint256 maxCost = 1e14;
        (,, uint256 reservedCharge) = paymaster.previewCharge(maxCost);

        vm.prank(address(entryPoint));
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);

        assertEq(paymaster.reservedGasTankBalance(owner), reservedCharge);
        assertEq(paymaster.availableGasTankBalance(owner), 10_000e6 - reservedCharge);
    }

    /// @notice Verifies owners cannot withdraw the portion of gas tank balance already reserved for unsettled operations.
    function test_withdrawGasTank_revertsWhenRequestedAmountIsReserved() public {
        _topUpAndRegister(owner, ownerAccount, 10_000e6);

        PackedUserOperation memory userOp;
        userOp.sender = ownerAccount;
        bytes32 userOpHash = keccak256("reserved-withdraw-user-op");
        uint256 maxCost = 1e14;
        (,, uint256 reservedCharge) = paymaster.previewCharge(maxCost);

        vm.prank(address(entryPoint));
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);

        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                ArbAgentPaymaster.InsufficientGasTankBalance.selector,
                owner,
                10_000e6 - reservedCharge,
                10_000e6 - reservedCharge + 1
            )
        );
        paymaster.withdrawGasTank(receiver, 10_000e6 - reservedCharge + 1);
    }

    /// @notice Verifies only the actual account owner can bind a smart account to their gas tank.
    function test_registerSponsoredAccount_requiresCurrentSmartAccountOwner() public {
        vm.prank(otherOwner);
        vm.expectRevert(abi.encodeWithSelector(ArbAgentPaymaster.AccountOwnerMismatch.selector, otherOwner, owner));
        paymaster.registerSponsoredAccount(ownerAccount);

        vm.prank(owner);
        paymaster.registerSponsoredAccount(ownerAccount);

        assertEq(paymaster.sponsoredAccountOwner(ownerAccount), owner);
        assertEq(paymaster.sponsoredStreamCount(owner), 1);
    }

    /// @notice Verifies removing sponsorship decrements the active sponsored-stream count and clears the owner mapping.
    function test_removeSponsoredAccount_updatesSponsoredStreamCount() public {
        _topUpAndRegister(owner, ownerAccount, 2_000e6);

        vm.prank(owner);
        paymaster.removeSponsoredAccount(ownerAccount);

        assertEq(paymaster.sponsoredStreamCount(owner), 0);
        assertEq(paymaster.sponsoredAccountOwner(ownerAccount), address(0));
    }

    /// @notice Verifies sponsorship validation fails when the owner's gas tank is underfunded.
    function test_validatePaymasterUserOp_revertsWhenGasTankIsInsufficient() public {
        vm.prank(owner);
        paymaster.registerSponsoredAccount(ownerAccount);

        PackedUserOperation memory userOp;
        userOp.sender = ownerAccount;

        uint256 maxCost = 2e15;
        (,, uint256 requiredCharge) = paymaster.previewCharge(maxCost);

        vm.prank(address(entryPoint));
        vm.expectRevert(
            abi.encodeWithSelector(ArbAgentPaymaster.InsufficientGasTankBalance.selector, owner, 0, requiredCharge)
        );
        paymaster.validatePaymasterUserOp(userOp, bytes32(0), maxCost);
    }

    /// @notice Verifies paymaster validation returns usable context and success metadata.
    function test_validatePaymasterUserOp_returnsContextAndValidity() public {
        _topUpAndRegister(owner, ownerAccount, 10_000e6);

        PackedUserOperation memory userOp;
        userOp.sender = ownerAccount;
        uint256 maxCost = 1e14;

        vm.prank(address(entryPoint));
        (bytes memory context, uint256 validationData) = paymaster.validatePaymasterUserOp(userOp, bytes32(0), maxCost);

        (address contextOwner, address contextAccount) = abi.decode(context, (address, address));
        ValidationData memory parsed = _parseValidationData(validationData);

        assertEq(contextOwner, owner);
        assertEq(contextAccount, ownerAccount);
        assertEq(parsed.aggregator, address(0));
        assertEq(parsed.validAfter, 0);
        assertEq(parsed.validUntil, type(uint48).max);
    }

    /// @notice Verifies postOp deducts owner gas tank balances and accrues protocol fees.
    function test_postOp_deductsGasTankAndAccruesProtocolFees() public {
        _topUpAndRegister(owner, ownerAccount, 10_000e6);

        PackedUserOperation memory userOp;
        userOp.sender = ownerAccount;

        uint256 actualGasCost = 1e14;
        uint256 actualUserOpFeePerGas = 2e9;

        vm.prank(address(entryPoint));
        (bytes memory context,) =
            paymaster.validatePaymasterUserOp(userOp, keccak256("settled-user-op"), actualGasCost * 2);

        (uint256 baseCharge, uint256 markupCharge, uint256 totalCharge) = paymaster.previewCharge(actualGasCost);

        vm.prank(address(entryPoint));
        paymaster.postOp(IPaymaster.PostOpMode.opSucceeded, context, actualGasCost, actualUserOpFeePerGas);

        assertEq(paymaster.gasTankBalance(owner), 10_000e6 - totalCharge);
        assertEq(paymaster.reservedGasTankBalance(owner), 0);
        assertEq(paymaster.collectedGasFees(), baseCharge);
        assertEq(paymaster.collectedMarkupFees(), markupCharge);

        paymaster.withdrawCollectedFees(receiver, baseCharge, markupCharge);

        assertEq(billingToken.balanceOf(receiver), totalCharge);
        assertEq(paymaster.collectedGasFees(), 0);
        assertEq(paymaster.collectedMarkupFees(), 0);
    }

    /// @notice Verifies multiple accounts can share one owner gas tank and be charged independently.
    function test_multipleAccountsCanShareOneOwnerGasTank() public {
        (address secondAccount,) = factory.createAgentAccount(owner);

        _topUpAndRegister(owner, ownerAccount, 15_000e6);

        vm.prank(owner);
        paymaster.registerSponsoredAccount(secondAccount);
        assertEq(paymaster.sponsoredStreamCount(owner), 2);

        bytes memory firstContext = _validateForAccount(ownerAccount, 1e14);
        bytes memory secondContext = _validateForAccount(secondAccount, 2e14);

        (,, uint256 firstCharge) = paymaster.previewCharge(1e14);
        (,, uint256 secondCharge) = paymaster.previewCharge(2e14);

        vm.startPrank(address(entryPoint));
        paymaster.postOp(IPaymaster.PostOpMode.opSucceeded, firstContext, 1e14, 1e9);
        paymaster.postOp(IPaymaster.PostOpMode.opReverted, secondContext, 2e14, 1e9);
        vm.stopPrank();

        assertEq(paymaster.gasTankBalance(owner), 15_000e6 - firstCharge - secondCharge);
    }

    /// @notice Verifies pause mode blocks new sponsorship validations and gas tank deposits until the owner unpauses.
    function test_pause_blocksValidationAndTopUps() public {
        vm.prank(paymaster.owner());
        paymaster.pause();

        vm.startPrank(owner);
        billingToken.approve(address(paymaster), 1_000e6);
        vm.expectRevert("Pausable: paused");
        paymaster.topUpGasTank(1_000e6);
        vm.stopPrank();

        PackedUserOperation memory userOp;
        userOp.sender = ownerAccount;

        vm.prank(address(entryPoint));
        vm.expectRevert("Pausable: paused");
        paymaster.validatePaymasterUserOp(userOp, keccak256("paused-user-op"), 1e14);
    }

    /// @notice Helper that funds an owner's gas tank and registers a sponsored account in one flow.
    /// @param gasTankOwner The owner whose gas tank will be topped up.
    /// @param account The smart account to register for sponsorship.
    /// @param amount The billing-token amount to deposit into the gas tank.
    function _topUpAndRegister(address gasTankOwner, address account, uint256 amount) internal {
        vm.startPrank(gasTankOwner);
        billingToken.approve(address(paymaster), amount);
        paymaster.topUpGasTank(amount);
        paymaster.registerSponsoredAccount(account);
        vm.stopPrank();
    }

    /// @notice Helper that runs paymaster validation for a given account and quoted max cost.
    /// @param account The smart account requesting sponsorship.
    /// @param maxCost The maximum native-token cost quoted for the user operation.
    /// @return context The encoded context returned by paymaster validation.
    function _validateForAccount(address account, uint256 maxCost) internal returns (bytes memory context) {
        PackedUserOperation memory userOp;
        userOp.sender = account;

        vm.prank(address(entryPoint));
        (context,) = paymaster.validatePaymasterUserOp(userOp, keccak256(abi.encode(account, maxCost)), maxCost);
    }
}
