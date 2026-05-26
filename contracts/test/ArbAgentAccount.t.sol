// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ValidationData, _parseValidationData} from "@account-abstraction/contracts/core/Helpers.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

import {AI_GuardrailModule} from "../src/AI_GuardrailModule.sol";
import {ArbAgentAccount} from "../src/ArbAgentAccount.sol";

/// @title MockExecutionTarget
/// @notice Minimal execution target used to verify account forwarding behavior in tests.
contract MockExecutionTarget {
    uint256 public callCount;
    uint256 public lastValue;

    /// @notice Stores the provided value and returns an incremented result.
    function perform(uint256 newValue) external returns (uint256) {
        callCount += 1;
        lastValue = newValue;
        return newValue + 1;
    }
}

/// @title ArbAgentAccountTest
/// @notice Unit tests for session-signature validation, guarded execution, and owner bypass behavior.
contract ArbAgentAccountTest is Test {
    uint256 internal ownerPrivateKey = 0xA11CE;
    uint256 internal sessionPrivateKey = 0xB0B;

    address internal owner = vm.addr(ownerPrivateKey);
    address internal sessionSigner = vm.addr(sessionPrivateKey);
    address internal entryPoint = makeAddr("entryPoint");

    ArbAgentAccount internal account;
    AI_GuardrailModule internal guardrail;
    MockExecutionTarget internal whitelistedTarget;
    MockExecutionTarget internal blockedTarget;

    /// @notice Deploys a fresh smart account and guardrail setup before each test.
    function setUp() public {
        vm.warp(10_000);

        account = new ArbAgentAccount(IEntryPoint(entryPoint), owner, address(0));
        guardrail = new AI_GuardrailModule(address(account));
        whitelistedTarget = new MockExecutionTarget();
        blockedTarget = new MockExecutionTarget();

        vm.startPrank(owner);
        account.setGuardrailModule(guardrail);
        account.setMaxDailyLimit(50);
        account.setProtocolWhitelist(address(whitelistedTarget), true);
        account.setSessionSigner(sessionSigner, uint48(block.timestamp + 1 hours));
        vm.stopPrank();
    }

    /// @notice Verifies the current delegated session signer is accepted during validation.
    function test_validateUserOp_acceptsCurrentSessionSignature() public {
        bytes32 userOpHash = keccak256("valid-session-user-op");
        PackedUserOperation memory userOp;
        userOp.signature = _signUserOpHash(sessionPrivateKey, userOpHash);

        vm.prank(entryPoint);
        uint256 validationData = account.validateUserOp(userOp, userOpHash, 0);

        ValidationData memory parsed = _parseValidationData(validationData);
        assertEq(parsed.aggregator, address(0));
        assertEq(parsed.validUntil, guardrail.sessionExpiry());
        assertEq(parsed.validAfter, 0);
    }

    /// @notice Verifies an owner signature is rejected when the account expects the delegated session signer.
    function test_validateUserOp_marksOwnerSignatureAsInvalid() public {
        bytes32 userOpHash = keccak256("owner-signed-user-op");
        PackedUserOperation memory userOp;
        userOp.signature = _signUserOpHash(ownerPrivateKey, userOpHash);

        vm.prank(entryPoint);
        uint256 validationData = account.validateUserOp(userOp, userOpHash, 0);

        ValidationData memory parsed = _parseValidationData(validationData);
        assertEq(parsed.aggregator, address(1));
        assertEq(parsed.validUntil, guardrail.sessionExpiry());
    }

    /// @notice Verifies EntryPoint-triggered execution succeeds for whitelisted targets within policy limits.
    function test_execute_fromEntryPoint_callsWhitelistedTargetWithinLimit() public {
        vm.prank(entryPoint);
        account.execute(address(whitelistedTarget), 0, abi.encodeCall(MockExecutionTarget.perform, (123)), 15);

        assertEq(whitelistedTarget.callCount(), 1);
        assertEq(whitelistedTarget.lastValue(), 123);
        assertEq(guardrail.spentToday(), 15);
    }

    /// @notice Verifies the owner can bypass guardrail checks for direct administrative execution.
    function test_execute_fromOwner_bypassesGuardrails() public {
        vm.prank(owner);
        account.execute(address(blockedTarget), 0, abi.encodeCall(MockExecutionTarget.perform, (777)), 99);

        assertEq(blockedTarget.callCount(), 1);
        assertEq(blockedTarget.lastValue(), 777);
        assertEq(guardrail.spentToday(), 0);
    }

    /// @notice Verifies expired sessions cannot execute through the EntryPoint path.
    function test_execute_revertsWhenSessionExpired() public {
        vm.prank(owner);
        account.setSessionSigner(sessionSigner, uint48(block.timestamp + 1));

        vm.warp(block.timestamp + 2);

        vm.prank(entryPoint);
        vm.expectRevert(
            abi.encodeWithSelector(
                AI_GuardrailModule.SessionExpired.selector, uint48(block.timestamp - 1), uint48(block.timestamp)
            )
        );
        account.execute(address(whitelistedTarget), 0, abi.encodeCall(MockExecutionTarget.perform, (1)), 10);
    }

    /// @notice Verifies non-whitelisted execution targets are blocked.
    function test_execute_revertsWhenTargetNotWhitelisted() public {
        vm.prank(entryPoint);
        vm.expectRevert(
            abi.encodeWithSelector(AI_GuardrailModule.TargetNotWhitelisted.selector, address(blockedTarget))
        );
        account.execute(address(blockedTarget), 0, abi.encodeCall(MockExecutionTarget.perform, (1)), 10);
    }

    /// @notice Verifies spend-limit overages are rejected after prior usage is accounted.
    function test_execute_revertsWhenSpendLimitExceeded() public {
        vm.prank(entryPoint);
        account.execute(address(whitelistedTarget), 0, abi.encodeCall(MockExecutionTarget.perform, (123)), 40);

        vm.prank(entryPoint);
        vm.expectRevert(abi.encodeWithSelector(AI_GuardrailModule.SpendLimitExceeded.selector, 60, 50));
        account.execute(address(whitelistedTarget), 0, abi.encodeCall(MockExecutionTarget.perform, (456)), 20);
    }

    /// @notice Verifies revoking the session signer invalidates future user operation validation.
    function test_revokeSessionSigner_invalidatesFutureValidation() public {
        vm.prank(owner);
        account.revokeSessionSigner();

        bytes32 userOpHash = keccak256("revoked-session-user-op");
        PackedUserOperation memory userOp;
        userOp.signature = _signUserOpHash(sessionPrivateKey, userOpHash);

        vm.prank(entryPoint);
        uint256 validationData = account.validateUserOp(userOp, userOpHash, 0);

        ValidationData memory parsed = _parseValidationData(validationData);
        assertEq(parsed.aggregator, address(1));
    }

    /// @notice Signs a user operation hash using an EIP-191 Ethereum signed message prefix.
    /// @param signerPrivateKey The private key used to sign the hash.
    /// @param userOpHash The canonical user operation hash to sign.
    /// @return signature The encoded `r || s || v` signature payload.
    function _signUserOpHash(uint256 signerPrivateKey, bytes32 userOpHash)
        internal
        pure
        returns (bytes memory signature)
    {
        bytes32 digest = ECDSA.toEthSignedMessageHash(userOpHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, digest);
        signature = abi.encodePacked(r, s, v);
    }
}
