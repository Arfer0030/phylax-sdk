// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC
/// @notice Simple 6-decimal mintable token for local Phylax billing and integration testing.
contract MockUSDC is ERC20, Ownable2Step {
    /// @notice Default faucet payout used by the dashboard claim flow.
    uint256 public faucetAmount = 100e6;
    /// @notice Minimum cooldown between faucet claims for the same wallet.
    uint48 public faucetCooldown = 1 days;

    /// @notice Timestamp of the last successful faucet claim per wallet.
    mapping(address => uint48) public lastFaucetClaimAt;

    /// @notice Emitted when the testnet faucet payout configuration changes.
    event FaucetConfigUpdated(uint256 faucetAmount, uint48 faucetCooldown);
    /// @notice Emitted when a wallet claims mock USDC from the faucet.
    event FaucetClaimed(address indexed account, uint256 amount, uint48 nextClaimAt);

    error FaucetClaimTooSoon(uint48 nextClaimAt, uint48 currentTimestamp);
    error InvalidFaucetConfig();

    /// @notice Creates the local/dev billing token used by Phylax dry runs and tests.
    constructor() ERC20("Mock USD Coin", "mUSDC") {}

    /// @notice Returns the display decimals used by the mock token.
    /// @return The number of decimals, fixed to 6 to mimic USDC-style assets.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mints mock billing tokens to a receiver for local testing and dry-run setup.
    /// @param account The receiver of the minted mock tokens.
    /// @param amount The amount of mock tokens to mint.
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    /// @notice Claims the dashboard faucet payout for the caller, subject to a per-wallet cooldown.
    function claimTestnetUSDC() external {
        uint48 nextClaimAt = lastFaucetClaimAt[msg.sender] + faucetCooldown;
        if (lastFaucetClaimAt[msg.sender] != 0 && block.timestamp < nextClaimAt) {
            revert FaucetClaimTooSoon(nextClaimAt, uint48(block.timestamp));
        }

        lastFaucetClaimAt[msg.sender] = uint48(block.timestamp);
        _mint(msg.sender, faucetAmount);

        emit FaucetClaimed(msg.sender, faucetAmount, uint48(block.timestamp + faucetCooldown));
    }

    /// @notice Updates faucet payout size and cooldown for testnet demos.
    /// @param newFaucetAmount The new faucet payout amount denominated in 6-decimal token units.
    /// @param newFaucetCooldown The minimum cooldown between faucet claims for the same wallet.
    function setFaucetConfig(uint256 newFaucetAmount, uint48 newFaucetCooldown) external onlyOwner {
        if (newFaucetAmount == 0 || newFaucetCooldown == 0) revert InvalidFaucetConfig();

        faucetAmount = newFaucetAmount;
        faucetCooldown = newFaucetCooldown;

        emit FaucetConfigUpdated(newFaucetAmount, newFaucetCooldown);
    }
}
