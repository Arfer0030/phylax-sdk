// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {_packValidationData} from "@account-abstraction/contracts/core/Helpers.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {IPaymaster} from "@account-abstraction/contracts/interfaces/IPaymaster.sol";

import {ArbAgentAccount} from "./ArbAgentAccount.sol";

/// @title ArbAgentPaymaster
/// @notice Sponsors ERC-4337 gas from EntryPoint deposit while settling usage against a per-owner ERC20 gas tank.
contract ArbAgentPaymaster is IPaymaster, Ownable {
    using SafeERC20 for IERC20;

    /// @notice Quote basis denominator used to express token-per-native exchange rates with 18 decimals precision.
    uint256 public constant QUOTE_DENOMINATOR = 1e18;
    /// @notice Basis point denominator used for protocol markup calculation.
    uint16 public constant BASIS_POINTS = 10_000;

    /// @notice ERC-4337 EntryPoint this paymaster trusts for validation and post-operation callbacks.
    IEntryPoint public immutable entryPoint;
    /// @notice ERC20 token used to settle gas tank balances and protocol fees.
    IERC20 public immutable billingToken;

    /// @notice Current gas tank balance held on behalf of each sponsoring owner.
    mapping(address => uint256) public gasTankBalance;
    /// @notice Mapping from sponsored smart account to the owner whose gas tank funds it.
    mapping(address => address) public sponsoredAccountOwner;

    /// @notice Exchange rate of billing tokens charged per 1 native token of gas cost, expressed with 1e18 precision.
    uint256 public tokenPerNativeToken;
    /// @notice Protocol markup applied on top of the base gas charge, expressed in basis points.
    uint16 public markupBps;
    /// @notice Accumulated billing-token amount representing recovered raw gas cost.
    uint256 public collectedGasFees;
    /// @notice Accumulated billing-token amount representing markup revenue.
    uint256 public collectedMarkupFees;

    /// @notice Emitted when the paymaster billing quote or markup is updated.
    event BillingConfigUpdated(uint256 tokenPerNativeToken, uint16 markupBps);
    /// @notice Emitted when an owner deposits billing tokens into their gas tank.
    event GasTankToppedUp(address indexed owner, uint256 amount, uint256 newBalance);
    /// @notice Emitted when an owner withdraws unused billing tokens from their gas tank.
    event GasTankWithdrawn(address indexed owner, address indexed receiver, uint256 amount, uint256 newBalance);
    /// @notice Emitted when a smart account is bound to an owner's gas tank sponsorship.
    event SponsoredAccountRegistered(address indexed account, address indexed previousOwner, address indexed newOwner);
    /// @notice Emitted when a smart account is removed from sponsorship.
    event SponsoredAccountRemoved(address indexed account, address indexed owner);
    /// @notice Emitted when a completed sponsored operation is settled against an owner's gas tank.
    event GasChargeSettled(
        address indexed owner,
        address indexed account,
        uint256 actualGasCost,
        uint256 totalCharge,
        uint256 remainingGasTankBalance
    );
    event CollectedFeesWithdrawn(
        address indexed receiver, uint256 gasFeeAmount, uint256 markupFeeAmount, uint256 remainingCollectedGasFees
    );

    error InvalidEntryPoint();
    error InvalidBillingToken();
    error InvalidBillingConfig();
    error InvalidAccount();
    error InvalidReceiver();
    error AccountOwnerMismatch(address expectedOwner, address actualOwner);
    error AccountNotRegistered(address account);
    error InsufficientGasTankBalance(address owner, uint256 available, uint256 required);
    error InsufficientCollectedFees(uint256 requestedGasFees, uint256 requestedMarkupFees);

    /// @notice Creates a paymaster that sponsors gas from EntryPoint deposit and settles usage in an ERC20 billing token.
    /// @param entryPoint_ The ERC-4337 EntryPoint trusted to call paymaster validation and postOp hooks.
    /// @param billingToken_ The ERC20 token used for owner gas tanks and fee collection.
    /// @param tokenPerNativeToken_ Billing-token quote per 1 native token of gas cost, expressed with 1e18 precision.
    /// @param markupBps_ Protocol markup added to the base gas charge, in basis points.
    constructor(IEntryPoint entryPoint_, IERC20 billingToken_, uint256 tokenPerNativeToken_, uint16 markupBps_) {
        if (!IERC165(address(entryPoint_)).supportsInterface(type(IEntryPoint).interfaceId)) {
            revert InvalidEntryPoint();
        }
        if (address(billingToken_) == address(0)) revert InvalidBillingToken();
        if (tokenPerNativeToken_ == 0 || markupBps_ > BASIS_POINTS) revert InvalidBillingConfig();

        entryPoint = entryPoint_;
        billingToken = billingToken_;
        tokenPerNativeToken = tokenPerNativeToken_;
        markupBps = markupBps_;
    }

    /// @notice Updates the native-to-token quote and markup used to settle sponsored gas.
    function setBillingConfig(uint256 newTokenPerNativeToken, uint16 newMarkupBps) external onlyOwner {
        if (newTokenPerNativeToken == 0 || newMarkupBps > BASIS_POINTS) revert InvalidBillingConfig();

        tokenPerNativeToken = newTokenPerNativeToken;
        markupBps = newMarkupBps;

        emit BillingConfigUpdated(newTokenPerNativeToken, newMarkupBps);
    }

    /// @notice Deposits billing tokens into the caller's gas tank balance.
    function topUpGasTank(uint256 amount) external {
        billingToken.safeTransferFrom(msg.sender, address(this), amount);
        gasTankBalance[msg.sender] += amount;

        emit GasTankToppedUp(msg.sender, amount, gasTankBalance[msg.sender]);
    }

    /// @notice Withdraws unused billing tokens from the caller's gas tank balance.
    function withdrawGasTank(address receiver, uint256 amount) external {
        if (receiver == address(0)) revert InvalidReceiver();

        uint256 available = gasTankBalance[msg.sender];
        if (available < amount) revert InsufficientGasTankBalance(msg.sender, available, amount);

        gasTankBalance[msg.sender] = available - amount;
        billingToken.safeTransfer(receiver, amount);

        emit GasTankWithdrawn(msg.sender, receiver, amount, gasTankBalance[msg.sender]);
    }

    /// @notice Registers a Phylax smart account to draw sponsorship from the caller's gas tank.
    function registerSponsoredAccount(address account) external {
        if (account == address(0)) revert InvalidAccount();

        address actualOwner = ArbAgentAccount(payable(account)).masterOwner();
        if (actualOwner != msg.sender) revert AccountOwnerMismatch(msg.sender, actualOwner);

        address previousOwner = sponsoredAccountOwner[account];
        sponsoredAccountOwner[account] = msg.sender;

        emit SponsoredAccountRegistered(account, previousOwner, msg.sender);
    }

    /// @notice Removes an account-to-owner sponsorship mapping when the caller no longer wants to sponsor it.
    function removeSponsoredAccount(address account) external {
        if (sponsoredAccountOwner[account] != msg.sender) revert AccountNotRegistered(account);

        delete sponsoredAccountOwner[account];
        emit SponsoredAccountRemoved(account, msg.sender);
    }

    /// @notice Withdraws fees already charged to owner gas tanks and accrued to the protocol.
    /// @param receiver The destination address receiving withdrawn billing tokens.
    /// @param gasFeeAmount The amount of recovered base gas fees to withdraw.
    /// @param markupFeeAmount The amount of markup fees to withdraw.
    function withdrawCollectedFees(address receiver, uint256 gasFeeAmount, uint256 markupFeeAmount) external onlyOwner {
        if (receiver == address(0)) revert InvalidReceiver();
        if (gasFeeAmount > collectedGasFees || markupFeeAmount > collectedMarkupFees) {
            revert InsufficientCollectedFees(gasFeeAmount, markupFeeAmount);
        }

        collectedGasFees -= gasFeeAmount;
        collectedMarkupFees -= markupFeeAmount;
        billingToken.safeTransfer(receiver, gasFeeAmount + markupFeeAmount);

        emit CollectedFeesWithdrawn(receiver, gasFeeAmount, markupFeeAmount, collectedGasFees);
    }

    /// @notice Quotes the ERC20 charge for a given native gas cost.
    /// @param nativeCost The gas cost denominated in the network's native token wei amount.
    /// @return baseCharge The billing-token amount covering raw gas cost.
    /// @return markupCharge The billing-token amount representing protocol markup.
    /// @return totalCharge The total billing-token amount charged to the owner's gas tank.
    function previewCharge(uint256 nativeCost)
        public
        view
        returns (uint256 baseCharge, uint256 markupCharge, uint256 totalCharge)
    {
        baseCharge = Math.mulDiv(nativeCost, tokenPerNativeToken, QUOTE_DENOMINATOR);
        markupCharge = Math.mulDiv(baseCharge, markupBps, BASIS_POINTS);
        totalCharge = baseCharge + markupCharge;
    }

    /// @notice Validates whether the paymaster will sponsor a user operation and returns postOp context.
    /// @param userOp The packed ERC-4337 user operation requesting sponsorship.
    /// @param maxCost The maximum native-token gas cost that could be charged for the operation.
    /// @return context Encoded owner/account context forwarded into `postOp`.
    /// @return validationData Packed validation metadata for the EntryPoint.
    function validatePaymasterUserOp(PackedUserOperation calldata userOp, bytes32, uint256 maxCost)
        external
        view
        returns (bytes memory context, uint256 validationData)
    {
        _requireFromEntryPoint();

        address gasTankOwner = sponsoredAccountOwner[userOp.sender];
        if (gasTankOwner == address(0)) revert AccountNotRegistered(userOp.sender);

        (,, uint256 requiredCharge) = previewCharge(maxCost);
        uint256 available = gasTankBalance[gasTankOwner];
        if (available < requiredCharge) {
            revert InsufficientGasTankBalance(gasTankOwner, available, requiredCharge);
        }

        context = abi.encode(gasTankOwner, userOp.sender);
        validationData = _packValidationData(false, 0, 0);
    }

    /// @notice Settles actual gas usage against the sponsoring owner's gas tank after execution completes.
    /// @param mode The post-operation mode indicating whether the user operation succeeded or reverted.
    /// @param context Encoded owner/account pair returned by `validatePaymasterUserOp`.
    /// @param actualGasCost The actual native-token gas cost owed by the paymaster.
    /// @param actualUserOpFeePerGas The effective gas price paid by the user operation.
    function postOp(
        IPaymaster.PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost,
        uint256 actualUserOpFeePerGas
    ) external override {
        (mode, actualUserOpFeePerGas);
        _requireFromEntryPoint();

        (address gasTankOwner, address account) = abi.decode(context, (address, address));
        (uint256 baseCharge, uint256 markupCharge, uint256 totalCharge) = previewCharge(actualGasCost);

        uint256 available = gasTankBalance[gasTankOwner];
        if (available < totalCharge) revert InsufficientGasTankBalance(gasTankOwner, available, totalCharge);

        gasTankBalance[gasTankOwner] = available - totalCharge;
        collectedGasFees += baseCharge;
        collectedMarkupFees += markupCharge;

        emit GasChargeSettled(gasTankOwner, account, actualGasCost, totalCharge, gasTankBalance[gasTankOwner]);
    }

    /// @notice Deposits native tokens into the EntryPoint deposit balance for this paymaster.
    function deposit() external payable {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /// @notice Withdraws native-token deposit balance from the EntryPoint to a receiver.
    /// @param withdrawAddress The receiver of withdrawn native tokens.
    /// @param amount The amount of native tokens to withdraw from paymaster deposit.
    function withdrawTo(address payable withdrawAddress, uint256 amount) external onlyOwner {
        entryPoint.withdrawTo(withdrawAddress, amount);
    }

    /// @notice Stakes native tokens for this paymaster in the EntryPoint.
    /// @param unstakeDelaySec The required unstake delay configured in the EntryPoint.
    function addStake(uint32 unstakeDelaySec) external payable onlyOwner {
        entryPoint.addStake{value: msg.value}(unstakeDelaySec);
    }

    /// @notice Returns the current native-token deposit balance of this paymaster in the EntryPoint.
    /// @return The paymaster deposit balance available for sponsorship.
    function getDeposit() external view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }

    /// @notice Unlocks the paymaster stake in the EntryPoint so it can later be withdrawn.
    function unlockStake() external onlyOwner {
        entryPoint.unlockStake();
    }

    /// @notice Withdraws previously unlocked stake from the EntryPoint.
    /// @param withdrawAddress The receiver of the withdrawn stake.
    function withdrawStake(address payable withdrawAddress) external onlyOwner {
        entryPoint.withdrawStake(withdrawAddress);
    }

    /// @notice Ensures the caller is the configured EntryPoint.
    function _requireFromEntryPoint() internal view {
        require(msg.sender == address(entryPoint), "Sender not EntryPoint");
    }
}
