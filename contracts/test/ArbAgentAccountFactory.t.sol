// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

import {AI_GuardrailModule} from "../src/AI_GuardrailModule.sol";
import {ArbAgentAccount} from "../src/ArbAgentAccount.sol";
import {ArbAgentAccountFactory} from "../src/ArbAgentAccountFactory.sol";

/// @title ArbAgentAccountFactoryTest
/// @notice Unit tests for account/guardrail deployment and bootstrap behavior from the factory.
contract ArbAgentAccountFactoryTest is Test {
    address internal entryPoint = makeAddr("entryPoint");
    address internal owner = makeAddr("owner");

    ArbAgentAccountFactory internal factory;

    /// @notice Deploys a fresh factory before each test.
    function setUp() public {
        factory = new ArbAgentAccountFactory(IEntryPoint(entryPoint));
    }

    /// @notice Verifies the factory deploys both account and guardrail and wires them together.
    function test_createAgentAccount_deploysAndBootstrapsGuardrail() public {
        (address accountAddress, address guardrailAddress) = factory.createAgentAccount(owner);

        ArbAgentAccount account = ArbAgentAccount(payable(accountAddress));
        AI_GuardrailModule guardrail = AI_GuardrailModule(guardrailAddress);

        assertEq(account.masterOwner(), owner);
        assertEq(account.deploymentFactory(), address(factory));
        assertEq(address(account.guardrailModule()), guardrailAddress);
        assertEq(guardrail.controller(), accountAddress);
        assertEq(factory.guardrailByAccount(accountAddress), guardrailAddress);

        address[] memory accounts = factory.getAccounts(owner);
        assertEq(accounts.length, 1);
        assertEq(accounts[0], accountAddress);
    }

    /// @notice Verifies a single owner can create multiple independent smart accounts.
    function test_createAgentAccount_supportsMultipleAccountsPerOwner() public {
        (address firstAccount,) = factory.createAgentAccount(owner);
        (address secondAccount,) = factory.createAgentAccount(owner);

        address[] memory accounts = factory.getAccounts(owner);
        assertEq(accounts.length, 2);
        assertEq(accounts[0], firstAccount);
        assertEq(accounts[1], secondAccount);
        assertTrue(firstAccount != secondAccount);
    }

    /// @notice Verifies the bootstrap factory cannot overwrite the guardrail after initial wiring.
    function test_factoryCannotOverwriteGuardrailAfterBootstrap() public {
        (address accountAddress,) = factory.createAgentAccount(owner);
        AI_GuardrailModule replacementGuardrail = new AI_GuardrailModule(accountAddress);

        vm.prank(address(factory));
        vm.expectRevert(ArbAgentAccount.UnauthorizedCaller.selector);
        ArbAgentAccount(payable(accountAddress)).setGuardrailModule(replacementGuardrail);
    }
}
