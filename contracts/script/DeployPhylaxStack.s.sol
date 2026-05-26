// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {EntryPoint} from "@account-abstraction/contracts/core/EntryPoint.sol";

import {ArbAgentAccountFactory} from "../src/ArbAgentAccountFactory.sol";
import {ArbAgentPaymaster} from "../src/ArbAgentPaymaster.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

/// @notice Deploys the Phylax smart contract stack and optionally funds the paymaster deposit/stake.
contract DeployPhylaxStack is Script {
    /// @notice Deployment-time configuration loaded from environment variables.
    struct DeployConfig {
        address entryPointAddress;
        address billingTokenAddress;
        uint256 tokenPerNativeToken;
        uint16 markupBps;
        uint256 initialPaymasterDeposit;
        uint256 initialPaymasterStake;
        uint32 unstakeDelay;
        address mockMintRecipient;
        uint256 mockMintAmount;
        address paymasterOwner;
    }

    /// @notice Simulates or broadcasts deployment of the Phylax infrastructure stack.
    function run() external {
        DeployConfig memory config = _loadConfig();

        vm.startBroadcast();

        bool deployedEntryPoint;
        IEntryPoint entryPoint;
        if (config.entryPointAddress == address(0)) {
            entryPoint = IEntryPoint(address(new EntryPoint()));
            deployedEntryPoint = true;
        } else {
            entryPoint = IEntryPoint(config.entryPointAddress);
        }

        bool deployedMockUsdc;
        address billingToken;
        if (config.billingTokenAddress == address(0)) {
            MockUSDC mockUsdc = new MockUSDC();
            billingToken = address(mockUsdc);
            deployedMockUsdc = true;

            if (config.mockMintRecipient != address(0) && config.mockMintAmount > 0) {
                mockUsdc.mint(config.mockMintRecipient, config.mockMintAmount);
            }
        } else {
            billingToken = config.billingTokenAddress;
        }

        ArbAgentAccountFactory factory = new ArbAgentAccountFactory(entryPoint);
        ArbAgentPaymaster paymaster =
            new ArbAgentPaymaster(entryPoint, IERC20(billingToken), config.tokenPerNativeToken, config.markupBps);

        if (config.initialPaymasterDeposit > 0) {
            paymaster.deposit{value: config.initialPaymasterDeposit}();
        }

        if (config.initialPaymasterStake > 0) {
            paymaster.addStake{value: config.initialPaymasterStake}(config.unstakeDelay);
        }

        if (config.paymasterOwner != address(0)) {
            paymaster.transferOwnership(config.paymasterOwner);
        }

        vm.stopBroadcast();

        console2.log("Phylax EntryPoint:", address(entryPoint));
        console2.log("Billing Token:", billingToken);
        console2.log("ArbAgentAccountFactory:", address(factory));
        console2.log("ArbAgentPaymaster:", address(paymaster));
        console2.log("Paymaster Owner:", paymaster.owner());
        console2.log("Deployed EntryPoint:", deployedEntryPoint);
        console2.log("Deployed MockUSDC:", deployedMockUsdc);
    }

    /// @notice Loads deployment configuration from environment variables.
    /// @return config Parsed deployment configuration.
    function _loadConfig() internal view returns (DeployConfig memory config) {
        uint256 markupBpsRaw = vm.envOr("MARKUP_BPS", uint256(500));
        uint256 unstakeDelayRaw = vm.envOr("PAYMASTER_UNSTAKE_DELAY", uint256(1 days));

        require(markupBpsRaw <= type(uint16).max, "markup too large");
        require(unstakeDelayRaw <= type(uint32).max, "unstake delay too large");

        config.entryPointAddress = vm.envOr("ENTRY_POINT_ADDRESS", address(0));
        config.billingTokenAddress = vm.envOr("BILLING_TOKEN_ADDRESS", address(0));
        config.tokenPerNativeToken = vm.envOr("TOKEN_PER_NATIVE_TOKEN", uint256(3_000e6));
        // forge-lint: disable-next-line(unsafe-typecast)
        config.markupBps = uint16(markupBpsRaw);
        config.initialPaymasterDeposit = vm.envOr("INITIAL_PAYMASTER_DEPOSIT", uint256(0));
        config.initialPaymasterStake = vm.envOr("INITIAL_PAYMASTER_STAKE", uint256(0));
        // forge-lint: disable-next-line(unsafe-typecast)
        config.unstakeDelay = uint32(unstakeDelayRaw);
        config.mockMintRecipient = vm.envOr("MOCK_USDC_MINT_RECIPIENT", address(0));
        config.mockMintAmount = vm.envOr("INITIAL_MOCK_USDC_MINT", uint256(0));
        config.paymasterOwner = vm.envOr("PAYMASTER_OWNER", address(0));
    }
}
