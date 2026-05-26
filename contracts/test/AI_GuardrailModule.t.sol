// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";

import {AI_GuardrailModule} from "../src/AI_GuardrailModule.sol";

/// @title AI_GuardrailModuleTest
/// @notice Unit tests for guardrail session expiry, whitelist, and spend accounting.
contract AI_GuardrailModuleTest is Test {
    AI_GuardrailModule internal guardrail;

    address internal controller = makeAddr("controller");
    address internal whitelistedTarget = makeAddr("whitelistedTarget");
    address internal blockedTarget = makeAddr("blockedTarget");

    /// @notice Deploys and configures a fresh guardrail module before each test.
    function setUp() public {
        vm.warp(1_000);

        guardrail = new AI_GuardrailModule(controller);

        vm.startPrank(controller);
        guardrail.setMaxDailyLimit(50);
        guardrail.setTargetWhitelist(whitelistedTarget, true);
        guardrail.setSessionExpiry(uint48(block.timestamp + 1 hours));
        vm.stopPrank();
    }

    /// @notice Verifies a whitelisted transaction updates the tracked spend amount.
    function test_checkTransaction_updatesSpendForWhitelistedTarget() public {
        vm.prank(controller);
        uint256 updatedSpent = guardrail.checkTransaction(whitelistedTarget, 10);

        assertEq(updatedSpent, 10);
        assertEq(guardrail.spentToday(), 10);
    }

    /// @notice Verifies the rolling spend window resets after one day elapses.
    function test_checkTransaction_resetsSpendWindowAfterOneDay() public {
        vm.prank(controller);
        guardrail.checkTransaction(whitelistedTarget, 15);

        vm.warp(block.timestamp + guardrail.SPEND_WINDOW() + 1);
        vm.prank(controller);
        guardrail.setSessionExpiry(uint48(block.timestamp + 1 hours));

        vm.prank(controller);
        uint256 updatedSpent = guardrail.checkTransaction(whitelistedTarget, 5);

        assertEq(updatedSpent, 5);
        assertEq(guardrail.spentToday(), 5);
    }

    /// @notice Verifies non-controller callers cannot validate transactions.
    function test_checkTransaction_revertsWhenCallerIsNotController() public {
        vm.expectRevert(AI_GuardrailModule.ControllerOnly.selector);
        guardrail.checkTransaction(whitelistedTarget, 10);
    }

    /// @notice Verifies expired sessions are rejected by the guardrail.
    function test_checkTransaction_revertsWhenSessionExpired() public {
        vm.prank(controller);
        guardrail.setSessionExpiry(uint48(block.timestamp - 1));

        vm.prank(controller);
        vm.expectRevert(
            abi.encodeWithSelector(
                AI_GuardrailModule.SessionExpired.selector, uint48(block.timestamp - 1), uint48(block.timestamp)
            )
        );
        guardrail.checkTransaction(whitelistedTarget, 10);
    }

    /// @notice Verifies blocked targets cannot pass whitelist checks.
    function test_checkTransaction_revertsWhenTargetNotWhitelisted() public {
        vm.prank(controller);
        vm.expectRevert(abi.encodeWithSelector(AI_GuardrailModule.TargetNotWhitelisted.selector, blockedTarget));
        guardrail.checkTransaction(blockedTarget, 10);
    }

    /// @notice Verifies transactions exceeding the spend cap are rejected.
    function test_checkTransaction_revertsWhenSpendLimitExceeded() public {
        vm.prank(controller);
        vm.expectRevert(abi.encodeWithSelector(AI_GuardrailModule.SpendLimitExceeded.selector, 51, 50));
        guardrail.checkTransaction(whitelistedTarget, 51);
    }
}
