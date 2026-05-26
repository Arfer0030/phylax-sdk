// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {BaseAccount} from "@account-abstraction/contracts/core/BaseAccount.sol";
import {_packValidationData} from "@account-abstraction/contracts/core/Helpers.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

import {AI_GuardrailModule} from "./AI_GuardrailModule.sol";

/// @title ArbAgentAccount
/// @notice Minimal ERC-4337 smart account that delegates UserOperation signing to a bounded AI session signer.
contract ArbAgentAccount is BaseAccount {
    /// @notice Whitelist target metadata returned to frontends for human-readable protocol labels.
    struct WhitelistTargetMetadata {
        address target;
        string name;
    }

    IEntryPoint private immutable i_entryPoint; // Immutable entry point keeps reads cheap on every validation.

    /// @notice Factory allowed to perform one-time bootstrap wiring of the guardrail module.
    address public immutable deploymentFactory;
    /// @notice Owner with authority to manage session signers, policies, and EntryPoint deposits.
    address public masterOwner;
    /// @notice Pending owner in the two-step ownership handover flow.
    address public pendingMasterOwner;
    /// @notice Delegated session signer allowed to sign UserOperations for the AI agent.
    address public currentSessionKey;
    /// @notice Guardrail module enforcing policy on delegated execution.
    AI_GuardrailModule public guardrailModule;
    /// @notice Whether the deployment factory may still consume its one-time bootstrap privilege.
    bool public factoryBootstrapEnabled;
    /// @notice Human-readable name assigned by the owner for this guarded AI account.
    string public agentName;

    /// @notice Human-readable labels assigned to each currently whitelisted protocol target.
    mapping(address => string) public whitelistTargetName;
    address[] private whitelistTargets;
    mapping(address => uint256) private whitelistTargetIndexPlusOne;

    /// @notice Emitted when a two-step ownership transfer is initiated.
    event MasterOwnershipTransferStarted(address indexed currentOwner, address indexed pendingOwner);
    /// @notice Emitted when ownership is transferred to a new master owner.
    event MasterOwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    /// @notice Emitted when the account is wired to a guardrail module.
    event GuardrailModuleUpdated(address indexed guardrailModule);
    /// @notice Emitted when the delegated session signer is created or rotated.
    event SessionSignerUpdated(address indexed signer, uint48 expiry);
    /// @notice Emitted when the delegated session signer is revoked.
    event SessionSignerRevoked();
    /// @notice Emitted after successful execution through the smart account.
    event Executed(address indexed target, uint256 value, uint256 spendAmount);
    /// @notice Emitted when the one-time factory bootstrap path is consumed or disabled.
    event FactoryBootstrapDisabled();
    /// @notice Emitted when the factory applies the initial session policy during provisioning.
    event FactoryPolicyBootstrapped(address indexed signer, uint48 expiry, uint256 maxDailyLimit);
    /// @notice Emitted when the owner updates the display name used for this guarded account.
    event AgentNameUpdated(string newAgentName);
    /// @notice Emitted when a whitelist target label is added, updated, or removed.
    event WhitelistTargetMetadataUpdated(address indexed target, string targetName, bool isAllowed);
    /// @notice Emitted when an execution succeeds with user-supplied activity metadata for dashboard rendering.
    event ExecutionMetadataLogged(
        address indexed target, uint256 value, uint256 spendAmount, string action, string context, bool ownerBypass
    );

    error InvalidEntryPoint();
    error InvalidOwner();
    error InvalidPendingOwner();
    error InvalidSessionSigner();
    error UnauthorizedCaller();
    error GuardrailModuleNotSet();
    error InvalidGuardrailController();
    error FactoryBootstrapUnavailable();
    error InvalidAgentName();
    error InvalidWhitelistMetadata();
    error MismatchedWhitelistMetadata();

    modifier onlyMasterOwner() {
        if (msg.sender != masterOwner) revert UnauthorizedCaller();
        _;
    }

    /// @notice Creates a Phylax agent account bound to a single ERC-4337 entry point and owner.
    /// @param entryPoint_ The trusted ERC-4337 EntryPoint contract.
    /// @param initialOwner The owner allowed to configure session signers and guardrails.
    /// @param deploymentFactory_ The optional factory allowed to wire the guardrail during deployment bootstrap.
    constructor(IEntryPoint entryPoint_, address initialOwner, address deploymentFactory_) {
        if (address(entryPoint_) == address(0)) revert InvalidEntryPoint();
        if (initialOwner == address(0)) revert InvalidOwner();

        i_entryPoint = entryPoint_;
        deploymentFactory = deploymentFactory_;
        masterOwner = initialOwner;
        factoryBootstrapEnabled = deploymentFactory_ != address(0);

        emit MasterOwnershipTransferred(address(0), initialOwner);
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view override returns (IEntryPoint) {
        return i_entryPoint;
    }

    /// @notice Accepts native token transfers into the smart account.
    receive() external payable {}

    /// @notice Starts a two-step owner transfer for the smart account configuration authority.
    /// @param newOwner The account that will be allowed to accept ownership.
    function transferMasterOwnership(address newOwner) external onlyMasterOwner {
        if (newOwner == address(0)) revert InvalidPendingOwner();
        pendingMasterOwner = newOwner;
        emit MasterOwnershipTransferStarted(masterOwner, newOwner);
    }

    /// @notice Accepts ownership that was initiated by `transferMasterOwnership`.
    function acceptMasterOwnership() external {
        address pendingOwner = pendingMasterOwner;
        if (msg.sender != pendingOwner || pendingOwner == address(0)) revert InvalidPendingOwner();

        address previousOwner = masterOwner;
        masterOwner = pendingOwner;
        pendingMasterOwner = address(0);

        emit MasterOwnershipTransferred(previousOwner, pendingOwner);
    }

    /// @notice Assigns or updates the guardrail module used by this account.
    /// @param module The deployed guardrail module whose controller must be this account.
    function setGuardrailModule(AI_GuardrailModule module) external {
        bool callerIsOwner = msg.sender == masterOwner;
        bool callerIsBootstrapFactory = msg.sender == deploymentFactory && deploymentFactory != address(0)
            && address(guardrailModule) == address(0);
        if (!callerIsOwner && !callerIsBootstrapFactory) revert UnauthorizedCaller();
        if (address(module) == address(0)) revert GuardrailModuleNotSet();
        if (module.controller() != address(this)) revert InvalidGuardrailController();

        guardrailModule = module;
        emit GuardrailModuleUpdated(address(module));
    }

    /// @notice Updates the delegated AI session signer and synchronizes its expiry with the guardrail module.
    /// @param signer The EOA allowed to sign UserOperations for the AI agent.
    /// @param expiry The unix timestamp until which the signer is valid.
    function setSessionSigner(address signer, uint48 expiry) external onlyMasterOwner {
        if (signer == address(0)) revert InvalidSessionSigner();

        _disableFactoryBootstrap();

        AI_GuardrailModule module = _requireGuardrailModule();
        currentSessionKey = signer;
        module.setSessionExpiry(expiry);

        emit SessionSignerUpdated(signer, expiry);
    }

    /// @notice Revokes the delegated AI session signer and expires the active session immediately.
    function revokeSessionSigner() external onlyMasterOwner {
        _disableFactoryBootstrap();

        AI_GuardrailModule module = _requireGuardrailModule();
        currentSessionKey = address(0);
        module.setSessionExpiry(0);

        emit SessionSignerRevoked();
    }

    /// @notice Updates the maximum tracked spend allowed within the guardrail spend window.
    /// @param newLimit The maximum cumulative spend allowed in the active window.
    function setMaxDailyLimit(uint256 newLimit) external onlyMasterOwner {
        _disableFactoryBootstrap();
        _requireGuardrailModule().setMaxDailyLimit(newLimit);
    }

    /// @notice Updates the configured spend-window duration used for rolling cap enforcement.
    /// @param newDuration The duration in seconds for each spend window.
    function setSpendWindowDuration(uint48 newDuration) external onlyMasterOwner {
        _disableFactoryBootstrap();
        _requireGuardrailModule().setSpendWindowDuration(newDuration);
    }

    /// @notice Adds or removes a protocol target from the guardrail whitelist.
    /// @param target The external contract the AI agent may call.
    /// @param isAllowed Whether the target should be whitelisted.
    function setProtocolWhitelist(address target, bool isAllowed) external onlyMasterOwner {
        _disableFactoryBootstrap();
        _setProtocolWhitelist(target, whitelistTargetName[target], isAllowed, false);
    }

    /// @notice Adds or removes a protocol target from the guardrail whitelist while managing its display label.
    /// @param target The external contract the AI agent may call.
    /// @param targetName The human-readable label shown in owner dashboards for this target.
    /// @param isAllowed Whether the target should be whitelisted.
    function setProtocolWhitelist(address target, string calldata targetName, bool isAllowed) external onlyMasterOwner {
        _disableFactoryBootstrap();
        _setProtocolWhitelist(target, targetName, isAllowed, true);
    }

    /// @notice Updates the human-readable name attached to this guarded AI account.
    /// @param newAgentName The owner-defined display name used by frontends and dashboards.
    function setAgentName(string calldata newAgentName) external onlyMasterOwner {
        _disableFactoryBootstrap();
        _setAgentName(newAgentName);
    }

    /// @notice Manually resets the tracked spend window in the guardrail module.
    function resetSpendWindow() external onlyMasterOwner {
        _requireGuardrailModule().resetSpentToday();
    }

    /// @notice Applies the initial session signer, expiry, limit, and whitelist in a single factory-only bootstrap flow.
    /// @param agentName_ The human-readable display name assigned to the new guarded account.
    /// @param signer The delegated session signer generated for the AI agent.
    /// @param expiry The unix timestamp until which the delegated session remains valid.
    /// @param spendWindowDuration_ The rolling spend-window duration in seconds for the guardrail module.
    /// @param maxDailyLimit_ The initial cumulative spending cap for the agent.
    /// @param whitelistTargetNames The human-readable labels attached to each whitelisted protocol target.
    /// @param whitelistTargets_ The initial set of protocol targets allowed for the delegated AI session.
    function bootstrapInitialPolicy(
        string calldata agentName_,
        address signer,
        uint48 expiry,
        uint48 spendWindowDuration_,
        uint256 maxDailyLimit_,
        string[] calldata whitelistTargetNames,
        address[] calldata whitelistTargets_
    ) external {
        if (msg.sender != deploymentFactory || !factoryBootstrapEnabled) {
            revert FactoryBootstrapUnavailable();
        }
        if (signer == address(0)) revert InvalidSessionSigner();
        if (whitelistTargetNames.length != whitelistTargets_.length) revert MismatchedWhitelistMetadata();

        AI_GuardrailModule module = _requireGuardrailModule();
        _setAgentName(agentName_);
        currentSessionKey = signer;
        module.setSessionExpiry(expiry);
        module.setSpendWindowDuration(spendWindowDuration_);
        module.setMaxDailyLimit(maxDailyLimit_);

        uint256 whitelistTargetsLength = whitelistTargets_.length;
        for (uint256 i; i < whitelistTargetsLength; ++i) {
            _setProtocolWhitelist(whitelistTargets_[i], whitelistTargetNames[i], true, true);
        }

        factoryBootstrapEnabled = false;

        emit FactoryPolicyBootstrapped(signer, expiry, maxDailyLimit_);
        emit FactoryBootstrapDisabled();
        emit SessionSignerUpdated(signer, expiry);
    }

    /// @notice Executes a guarded transaction through the smart account.
    /// @param target The destination contract or EOA.
    /// @param value The native token value forwarded with the call.
    /// @param data The calldata executed on the destination target.
    /// @param spendAmount The policy-accounted spend amount associated with this execution.
    /// @return result The raw return data produced by the target call.
    function execute(address target, uint256 value, bytes calldata data, uint256 spendAmount)
        external
        returns (bytes memory result)
    {
        result = _execute(target, value, data, spendAmount, "", "");
    }

    /// @notice Executes a guarded transaction while attaching human-readable activity metadata for dashboards and logs.
    /// @param target The destination contract or EOA.
    /// @param value The native token value forwarded with the call.
    /// @param data The calldata executed on the destination target.
    /// @param spendAmount The policy-accounted spend amount associated with this execution.
    /// @param action The human-readable action label shown in activity logs.
    /// @param context The supporting human-readable note shown in activity logs.
    /// @return result The raw return data produced by the target call.
    function executeWithMetadata(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 spendAmount,
        string calldata action,
        string calldata context
    ) external returns (bytes memory result) {
        result = _execute(target, value, data, spendAmount, action, context);
    }

    /// @notice Returns the current deposit balance of this account inside the EntryPoint.
    /// @return The entry point deposit allocated to this account.
    function getDeposit() external view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /// @notice Returns the currently whitelisted protocol targets along with their owner-defined labels.
    /// @return targets The active whitelist target metadata entries.
    function getWhitelistTargets() external view returns (WhitelistTargetMetadata[] memory targets) {
        uint256 whitelistTargetsLength = whitelistTargets.length;
        targets = new WhitelistTargetMetadata[](whitelistTargetsLength);

        for (uint256 i; i < whitelistTargetsLength; ++i) {
            address target = whitelistTargets[i];
            targets[i] = WhitelistTargetMetadata({target: target, name: whitelistTargetName[target]});
        }
    }

    /// @notice Returns the current guardrail snapshot used by dashboard surfaces.
    /// @return currentAgentName The owner-defined display name for this guarded account.
    /// @return sessionSigner The current delegated session signer.
    /// @return sessionExpiry The unix timestamp until which the session signer remains valid.
    /// @return spendWindowStart The start timestamp of the active spend window.
    /// @return spendWindowDuration The configured duration for each spend window in seconds.
    /// @return maxDailyLimit The configured cumulative spend cap for the active window.
    /// @return spentToday The cumulative spend already tracked in the active window.
    function getDashboardState()
        external
        view
        returns (
            string memory currentAgentName,
            address sessionSigner,
            uint48 sessionExpiry,
            uint48 spendWindowStart,
            uint48 spendWindowDuration,
            uint256 maxDailyLimit,
            uint256 spentToday
        )
    {
        AI_GuardrailModule module = _requireGuardrailModule();

        return (
            agentName,
            currentSessionKey,
            module.sessionExpiry(),
            module.spendWindowStart(),
            module.spendWindowDuration(),
            module.maxDailyLimit(),
            module.spentToday()
        );
    }

    /// @notice Deposits native token into the EntryPoint for future account-prefund usage.
    function addDeposit() external payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /// @notice Withdraws deposited native token from the EntryPoint to a target receiver.
    /// @param withdrawAddress The receiver of withdrawn funds.
    /// @param amount The amount of native token to withdraw.
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) external onlyMasterOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    /// @inheritdoc BaseAccount
    function _validateSignature(PackedUserOperation calldata userOp, bytes32 userOpHash)
        internal
        view
        override
        returns (uint256 validationData)
    {
        address sessionSigner = currentSessionKey;
        uint48 validUntil = _sessionValidUntil();
        if (sessionSigner == address(0)) {
            return _packValidationData(true, validUntil, 0);
        }

        bytes32 digest = ECDSA.toEthSignedMessageHash(userOpHash);
        (address recovered, ECDSA.RecoverError recoverError) = ECDSA.tryRecover(digest, userOp.signature);
        bool sigFailed = recoverError != ECDSA.RecoverError.NoError || recovered != sessionSigner;

        validationData = _packValidationData(sigFailed, validUntil, 0);
    }

    /// @notice Returns the current expiry bound that should be embedded into account validation data.
    /// @return The delegated session expiry, or zero when no guardrail module is configured.
    function _sessionValidUntil() internal view returns (uint48) {
        AI_GuardrailModule module = guardrailModule;
        if (address(module) == address(0)) {
            return 0;
        }

        return module.sessionExpiry();
    }

    /// @notice Loads the configured guardrail module and reverts if the account is not yet initialized.
    /// @return module The configured guardrail module.
    function _requireGuardrailModule() internal view returns (AI_GuardrailModule module) {
        module = guardrailModule;
        if (address(module) == address(0)) revert GuardrailModuleNotSet();
    }

    /// @notice Applies a human-readable display name to the account and emits the corresponding metadata event.
    /// @param newAgentName The owner-defined display name used by frontends.
    function _setAgentName(string memory newAgentName) internal {
        if (bytes(newAgentName).length == 0) revert InvalidAgentName();
        agentName = newAgentName;
        emit AgentNameUpdated(newAgentName);
    }

    /// @notice Permanently disables the factory bootstrap path once the owner begins manual configuration.
    function _disableFactoryBootstrap() internal {
        if (!factoryBootstrapEnabled) {
            return;
        }

        factoryBootstrapEnabled = false;
        emit FactoryBootstrapDisabled();
    }

    /// @notice Applies or removes whitelist metadata while keeping the guardrail module in sync.
    /// @param target The external contract the AI agent may call.
    /// @param targetName The human-readable label attached to the target.
    /// @param isAllowed Whether the target should remain on the whitelist.
    /// @param shouldUpdateName Whether the provided label should overwrite the stored label.
    function _setProtocolWhitelist(address target, string memory targetName, bool isAllowed, bool shouldUpdateName)
        internal
    {
        AI_GuardrailModule module = _requireGuardrailModule();
        module.setTargetWhitelist(target, isAllowed);

        if (isAllowed) {
            string memory nextName = shouldUpdateName ? targetName : whitelistTargetName[target];
            if (bytes(nextName).length == 0) revert InvalidWhitelistMetadata();

            if (whitelistTargetIndexPlusOne[target] == 0) {
                whitelistTargets.push(target);
                whitelistTargetIndexPlusOne[target] = whitelistTargets.length;
            }

            whitelistTargetName[target] = nextName;
            emit WhitelistTargetMetadataUpdated(target, nextName, true);
            return;
        }

        uint256 indexPlusOne = whitelistTargetIndexPlusOne[target];
        if (indexPlusOne != 0) {
            uint256 removeIndex = indexPlusOne - 1;
            uint256 lastIndex = whitelistTargets.length - 1;

            if (removeIndex != lastIndex) {
                address lastTarget = whitelistTargets[lastIndex];
                whitelistTargets[removeIndex] = lastTarget;
                whitelistTargetIndexPlusOne[lastTarget] = indexPlusOne;
            }

            whitelistTargets.pop();
            delete whitelistTargetIndexPlusOne[target];
        }

        delete whitelistTargetName[target];
        emit WhitelistTargetMetadataUpdated(target, "", false);
    }

    /// @notice Executes a low-level call and bubbles up any revert data from the target.
    /// @param target The destination contract or EOA.
    /// @param value The native token amount to forward with the call.
    /// @param data The calldata to send to the target.
    /// @return result Raw returndata from the target call.
    function _call(address target, uint256 value, bytes memory data) internal returns (bytes memory result) {
        (bool success, bytes memory returnData) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(returnData, 32), mload(returnData))
            }
        }

        return returnData;
    }

    /// @notice Shared execution path used by plain and metadata-rich guarded calls.
    /// @param target The destination contract or EOA.
    /// @param value The native token value forwarded with the call.
    /// @param data The calldata executed on the destination target.
    /// @param spendAmount The policy-accounted spend amount associated with this execution.
    /// @param action The human-readable action label shown in activity logs.
    /// @param context The supporting human-readable note shown in activity logs.
    /// @return result The raw return data produced by the target call.
    function _execute(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 spendAmount,
        string memory action,
        string memory context
    ) internal returns (bytes memory result) {
        bool ownerBypass = msg.sender == masterOwner;
        if (ownerBypass) {
            result = _call(target, value, data);
            emit Executed(target, value, spendAmount);
            emit ExecutionMetadataLogged(target, value, spendAmount, action, context, true);
            return result;
        }
        if (msg.sender != address(entryPoint())) revert UnauthorizedCaller();

        _requireGuardrailModule().checkTransaction(target, spendAmount);
        result = _call(target, value, data);

        emit Executed(target, value, spendAmount);
        emit ExecutionMetadataLogged(target, value, spendAmount, action, context, false);
    }
}
