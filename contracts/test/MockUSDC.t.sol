// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";

import {MockUSDC} from "../src/MockUSDC.sol";

/// @title MockUSDCTest
/// @notice Unit tests for testnet faucet and owner-controlled minting of the Phylax billing token.
contract MockUSDCTest is Test {
    MockUSDC internal token;

    address internal alice = makeAddr("alice");

    /// @notice Deploys a fresh billing token before each test.
    function setUp() public {
        vm.warp(1_000);
        token = new MockUSDC();
    }

    /// @notice Verifies wallets can claim the faucet payout once per configured cooldown window.
    function test_claimTestnetUSDC_mintsFaucetAmount() public {
        vm.prank(alice);
        token.claimTestnetUSDC();

        assertEq(token.balanceOf(alice), token.faucetAmount());
        assertEq(token.lastFaucetClaimAt(alice), block.timestamp);
    }

    /// @notice Verifies repeated faucet claims revert before the configured cooldown elapses.
    function test_claimTestnetUSDC_revertsDuringCooldown() public {
        vm.prank(alice);
        token.claimTestnetUSDC();

        vm.expectRevert(
            abi.encodeWithSelector(
                MockUSDC.FaucetClaimTooSoon.selector,
                uint48(block.timestamp + token.faucetCooldown()),
                uint48(block.timestamp)
            )
        );
        vm.prank(alice);
        token.claimTestnetUSDC();
    }
}
