// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @title AI_GuardrailModule
/// @notice Enforces session expiry, protocol whitelist, and spend-window limits for an AI agent account.
contract AI_GuardrailModule {
    /// @notice Duration of each rolling spend window used for daily-limit enforcement.
    uint48 public constant SPEND_WINDOW = 1 days;

    /// @notice Smart account allowed to mutate and consume this guardrail state.
    address public immutable controller; // Immutable controller reduces gas on every guardrail check.

    /// @notice Unix timestamp after which the delegated AI session is no longer valid.
    uint48 public sessionExpiry;
    /// @notice Start timestamp for the active spend window.
    uint48 public spendWindowStart;
    /// @notice Maximum policy-accounted spend allowed during one active spend window.
    uint256 public maxDailyLimit;
    /// @notice Cumulative policy-accounted spend recorded in the active spend window.
    uint256 public spentToday;
    /// @notice Configurable duration of the active spend window, denominated in seconds.
    uint48 public spendWindowDuration;

    /// @notice Whitelist of execution targets the delegated AI session may call.
    mapping(address => bool) public targetWhitelist;

    /// @notice Emitted when the active AI session expiry is updated.
    event SessionExpiryUpdated(uint48 newExpiry);
    /// @notice Emitted when the active spend cap is updated.
    event MaxDailyLimitUpdated(uint256 newLimit);
    /// @notice Emitted when a target is added to or removed from the whitelist.
    event TargetWhitelistUpdated(address indexed target, bool isAllowed);
    /// @notice Emitted whenever the spend window is reset.
    event SpendWindowReset(uint48 indexed newWindowStart);
    /// @notice Emitted whenever the spend window duration is updated.
    event SpendWindowDurationUpdated(uint48 newDuration);
    /// @notice Emitted when a transaction spend amount is accounted against the active window.
    event SpendTracked(address indexed target, uint256 spendAmount, uint256 updatedSpentToday);

    error ControllerOnly();
    error InvalidController();
    error InvalidTarget();
    error SessionExpired(uint48 expiry, uint48 currentTimestamp);
    error TargetNotWhitelisted(address target);
    error SpendLimitExceeded(uint256 attemptedSpend, uint256 maxAllowed);
    error InvalidSpendWindowDuration();

    modifier onlyController() {
        if (msg.sender != controller) revert ControllerOnly();
        _;
    }

    /// @notice Creates a guardrail module owned by a single smart account controller.
    /// @param controller_ The Phylax smart account allowed to mutate and consume guardrail state.
    constructor(address controller_) {
        if (controller_ == address(0)) revert InvalidController();
        controller = controller_;
        spendWindowStart = uint48(block.timestamp);
        spendWindowDuration = SPEND_WINDOW;
    }

    /// @notice Updates the delegated AI session expiry timestamp.
    /// @param newExpiry The unix timestamp until which the delegated session remains valid.
    function setSessionExpiry(uint48 newExpiry) external onlyController {
        sessionExpiry = newExpiry;
        emit SessionExpiryUpdated(newExpiry);
    }

    /// @notice Updates the maximum tracked spend allowed during the current 24h window.
    /// @param newLimit The maximum spend amount accounted by the account during a spend window.
    function setMaxDailyLimit(uint256 newLimit) external onlyController {
        maxDailyLimit = newLimit;
        emit MaxDailyLimitUpdated(newLimit);
    }

    /// @notice Updates the duration used for rolling spend-limit enforcement.
    /// @param newDuration The new spend-window duration denominated in seconds.
    function setSpendWindowDuration(uint48 newDuration) external onlyController {
        if (newDuration == 0) revert InvalidSpendWindowDuration();

        spendWindowDuration = newDuration;
        emit SpendWindowDurationUpdated(newDuration);
    }

    /// @notice Adds or removes a protocol target from the execution whitelist.
    /// @param target The external contract the AI account may call.
    /// @param isAllowed Whether this target should be treated as whitelisted.
    function setTargetWhitelist(address target, bool isAllowed) external onlyController {
        if (target == address(0)) revert InvalidTarget();
        targetWhitelist[target] = isAllowed;
        emit TargetWhitelistUpdated(target, isAllowed);
    }

    /// @notice Resets the spend accumulator and starts a fresh spend window from the current timestamp.
    function resetSpentToday() external onlyController {
        spentToday = 0;
        spendWindowStart = uint48(block.timestamp);
        emit SpendWindowReset(spendWindowStart);
    }

    /// @notice Validates a guarded transaction and accounts its spend against the active window.
    /// @param target The protocol target being called by the AI smart account.
    /// @param spendAmount The policy-accounted spend amount associated with the execution.
    /// @return updatedSpentToday The cumulative spend after accounting for this transaction.
    function checkTransaction(address target, uint256 spendAmount)
        external
        onlyController
        returns (uint256 updatedSpentToday)
    {
        uint48 expiry = sessionExpiry;
        if (expiry == 0 || block.timestamp > expiry) {
            revert SessionExpired(expiry, uint48(block.timestamp));
        }
        if (!targetWhitelist[target]) revert TargetNotWhitelisted(target);

        _rollSpendWindowIfNeeded();

        updatedSpentToday = spentToday + spendAmount;
        if (updatedSpentToday > maxDailyLimit) {
            revert SpendLimitExceeded(updatedSpentToday, maxDailyLimit);
        }

        spentToday = updatedSpentToday;
        emit SpendTracked(target, spendAmount, updatedSpentToday);
    }

    /// @notice Resets the tracked spend when the active window has elapsed.
    function _rollSpendWindowIfNeeded() internal {
        if (block.timestamp < spendWindowStart + spendWindowDuration) {
            return;
        }

        spentToday = 0;
        spendWindowStart = uint48(block.timestamp);
        emit SpendWindowReset(spendWindowStart);
    }
}
