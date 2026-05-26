// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

import {AI_GuardrailModule} from "./AI_GuardrailModule.sol";
import {ArbAgentAccount} from "./ArbAgentAccount.sol";

/// @title ArbAgentAccountFactory
/// @notice Deploys Phylax smart accounts and their paired guardrail modules for owners managing multiple AI agents.
contract ArbAgentAccountFactory {
    /// @notice Shared ERC-4337 EntryPoint used by every deployed account.
    IEntryPoint public immutable entryPoint;

    /// @notice Registry of every account created for a given owner.
    mapping(address => address[]) private accountsByOwner;
    /// @notice Registry of the guardrail module paired with a deployed smart account.
    mapping(address => address) public guardrailByAccount;

    /// @notice Emitted when a new account and guardrail pair is created for an owner.
    event AgentAccountCreated(
        address indexed owner, address indexed account, address indexed guardrailModule, uint256 ownerAccountIndex
    );
    /// @notice Emitted when a newly created account is fully provisioned with initial metadata and policy.
    event AgentAccountProvisioned(
        address indexed owner,
        address indexed account,
        address indexed guardrailModule,
        string agentName,
        address sessionSigner,
        uint48 sessionExpiry,
        uint48 spendWindowDuration,
        uint256 maxDailyLimit
    );

    error InvalidEntryPoint();
    error InvalidOwner();

    /// @notice Creates a factory bound to a single shared ERC-4337 EntryPoint.
    /// @param entryPoint_ The ERC-4337 EntryPoint shared by every deployed account.
    constructor(IEntryPoint entryPoint_) {
        if (address(entryPoint_) == address(0)) revert InvalidEntryPoint();
        entryPoint = entryPoint_;
    }

    /// @notice Deploys a new AI smart account and bootstraps its dedicated guardrail module.
    /// @param owner The owner who will control session signers and policy updates for the new account.
    /// @return account The deployed smart account address.
    /// @return guardrailModule The deployed guardrail module address linked to the account.
    function createAgentAccount(address owner) external returns (address account, address guardrailModule) {
        return _createAgentAccount(owner);
    }

    /// @notice Deploys a new AI smart account and its guardrail module through the factory's internal flow.
    /// @param owner The owner who will control session signers and policy updates for the new account.
    /// @return account The deployed smart account address.
    /// @return guardrailModule The deployed guardrail module address linked to the account.
    function _createAgentAccount(address owner) internal returns (address account, address guardrailModule) {
        if (owner == address(0)) revert InvalidOwner();

        ArbAgentAccount newAccount = new ArbAgentAccount(entryPoint, owner, address(this));
        AI_GuardrailModule newGuardrail = new AI_GuardrailModule(address(newAccount));

        newAccount.setGuardrailModule(newGuardrail);

        account = address(newAccount);
        guardrailModule = address(newGuardrail);

        guardrailByAccount[account] = guardrailModule;
        accountsByOwner[owner].push(account);

        emit AgentAccountCreated(owner, account, guardrailModule, accountsByOwner[owner].length - 1);
    }

    /// @notice Deploys a new smart account and applies its initial session policy in one transaction.
    /// @param owner The owner who will manage session signers and risk parameters for the new account.
    /// @param sessionSigner The delegated session signer generated for the AI agent.
    /// @param sessionExpiry The unix timestamp until which the delegated session remains valid.
    /// @param maxDailyLimit The initial cumulative spend limit for the active spend window.
    /// @param whitelistTargets The initial set of protocol targets allowed for the delegated AI session.
    /// @return account The deployed smart account address.
    /// @return guardrailModule The deployed guardrail module address linked to the account.
    function createConfiguredAgentAccount(
        address owner,
        string calldata agentName,
        address sessionSigner,
        uint48 sessionExpiry,
        uint48 spendWindowDuration,
        uint256 maxDailyLimit,
        string[] calldata whitelistNames,
        address[] calldata whitelistTargets
    ) external returns (address account, address guardrailModule) {
        (account, guardrailModule) = _createAgentAccount(owner);
        ArbAgentAccount(payable(account))
            .bootstrapInitialPolicy(
                agentName,
                sessionSigner,
                sessionExpiry,
                spendWindowDuration,
                maxDailyLimit,
                whitelistNames,
                whitelistTargets
            );

        emit AgentAccountProvisioned(
            owner, account, guardrailModule, agentName, sessionSigner, sessionExpiry, spendWindowDuration, maxDailyLimit
        );
    }

    /// @notice Returns every smart account created for a given owner.
    /// @param owner The owner whose deployed accounts should be returned.
    /// @return accounts The array of smart account addresses created for the owner.
    function getAccounts(address owner) external view returns (address[] memory accounts) {
        return accountsByOwner[owner];
    }
}
