// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC
/// @notice Simple 6-decimal mintable token for local Phylax billing and integration testing.
contract MockUSDC is ERC20 {
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
    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}
