// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

/// @title MockEntryPoint
/// @notice Minimal EntryPoint test double used for local unit tests and dry-run style simulations.
contract MockEntryPoint is ERC165, IEntryPoint {
    mapping(address => uint256) internal deposits;

    /// @notice Reports ERC165 support for the mocked EntryPoint interface.
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IEntryPoint).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice Returns mocked deposit metadata for an account.
    function getDepositInfo(address account) external view returns (DepositInfo memory info) {
        info.deposit = deposits[account];
    }

    /// @notice Returns the mocked deposit balance for an account.
    function balanceOf(address account) external view returns (uint256) {
        return deposits[account];
    }

    /// @notice Adds native-token deposit balance to an account in the mock registry.
    function depositTo(address account) external payable {
        deposits[account] += msg.value;
        emit Deposited(account, deposits[account]);
    }

    /// @notice No-op mock of stake addition.
    function addStake(uint32) external payable {}

    /// @notice No-op mock of stake unlock.
    function unlockStake() external {}

    /// @notice No-op mock of stake withdrawal.
    function withdrawStake(address payable) external {}

    /// @notice Withdraws mocked deposit balance to a receiver.
    function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount) external {
        uint256 deposit = deposits[msg.sender];
        require(deposit >= withdrawAmount, "insufficient deposit");
        deposits[msg.sender] = deposit - withdrawAmount;
        (bool success,) = withdrawAddress.call{value: withdrawAmount}("");
        require(success, "withdraw failed");
        emit Withdrawn(msg.sender, withdrawAddress, withdrawAmount);
    }

    /// @notice Returns a constant zero nonce in the mock implementation.
    function getNonce(address, uint192) external pure returns (uint256 nonce) {
        return 0;
    }

    /// @notice No-op mock of nonce increment.
    function incrementNonce(uint192) external {}

    /// @notice No-op mock of user operation execution.
    function handleOps(PackedUserOperation[] calldata, address payable) external {}

    /// @notice No-op mock of aggregated user operation execution.
    function handleAggregatedOps(UserOpsPerAggregator[] calldata, address payable) external {}

    /// @notice Returns a simplified deterministic hash for a mocked user operation.
    function getUserOpHash(PackedUserOperation calldata userOp) external pure returns (bytes32) {
        return keccak256(abi.encode(userOp.sender, userOp.nonce, userOp.callData));
    }

    /// @notice Reverts with a zero-address sender result in the mock implementation.
    function getSenderAddress(bytes memory) external pure {
        revert SenderAddressResult(address(0));
    }

    /// @notice Reverts with an empty delegate result in the mock implementation.
    function delegateAndRevert(address, bytes calldata) external pure {
        revert DelegateAndRevert(false, "");
    }

    /// @notice Accepts native tokens sent directly to the mock entry point.
    receive() external payable {}
}
