# ⛓️ Phylax Smart Contracts (Solidity Infrastructure)

[![Solidity](https://img.shields.io/badge/Language-Solidity%200.8.23-orange.svg)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Framework-Foundry-red.svg)](https://book.getfoundry.sh/)
[![ERC-4337](https://img.shields.io/badge/Standard-ERC--4337%20v0.7-emerald.svg)](https://eips.ethereum.org/EIPS/eip-4337)
[![Arbitrum Sepolia](https://img.shields.io/badge/Network-Arbitrum%20Sepolia-cyan.svg)](https://sepolia.arbitrum.io/)

This folder contains the core smart contracts for the **Phylax SDK** security stack. These contracts act as the absolute on-chain root of trust, responsible for policy enforcement, gas billing, session verification, and asset protection.

---

## 🏛️ Smart Contract Architecture

The Phylax contract infrastructure is built specifically for **ERC-4337 Account Abstraction (v0.7)**, decoupling cryptographic transaction signing from state verification and execution.

```
                     ┌──────────────────┐
                     │   EntryPoint     │ (EIP-4337 EntryPoint Contract)
                     └────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  GuardedAccount   │ (AI Agent Smart Wallet)
                    └────────┬──────────┘
                             │
                             ├───────────► [ 1. validateUserOp() ]
                             │             Delegates authorization checking to
                             │             the AI_GuardrailModule.
                             │
                             └───────────► [ 2. checkTransaction() ]
                                           Validates calldata target, whitelist,
                                           and spend limits before execution.
```

### 1. `ArbAgentAccount.sol` (The Smart Wallet)
*   **Role**: Represents the AI Agent's on-chain identity. It stores no direct master keys; instead, it delegates autonomous operations to an **Ephemeral Session Key**.
*   **Core External & Public Functions**:
    *   `execute(address target, uint256 value, bytes calldata data, uint256 spendAmount)`: Executes a policy-checked transaction on behalf of the smart account. Can only be called by the EntryPoint or the Master Owner.
    *   `executeWithMetadata(address target, uint256 value, bytes calldata data, uint256 spendAmount, string calldata action, string calldata context)`: Executes a transaction while emitting a detailed event capturing the AI's action and intent for dashboard telemetry.
    *   `setSessionSigner(address signer, uint48 expiry)`: Registers a new delegated session key and its expiry time. Restricted to the Master Owner.
    *   `revokeSessionSigner()`: Emergency kill-switch. Instantly revokes the active session key. Restricted to the Master Owner.
    *   `setGuardrailModule(AI_GuardrailModule module)`: Couples a new modular policy shield to the smart wallet.
    *   `bootstrapInitialPolicy(...)`: Batch configures the initial session signer, whitelist dApps, whitelisted recipients, and limits upon factory deployment.
    *   `getDashboardState()`: A multi-value view function that returns the smart account's complete configuration, active session, spend limits, and remaining balance.
    *   `withdrawDepositTo(address payable withdrawAddress, uint256 amount)`: Withdraws staked ETH from the EntryPoint deposit pool. Restricted to the Master Owner.

### 2. `AI_GuardrailModule.sol` (The Policy Engine)
*   **Role**: The customizable "shield" that guards the wallet against malicious or accidental drains.
*   **Core External & Public Functions**:
    *   `checkTransaction(address target, bytes calldata data, uint256 spendAmount)`: Real-time policy evaluation. Asserts that the target contract is whitelisted, the session key has not expired, and the transaction value does not violate the rolling spend cap. Reverts on any policy breach.
    *   `setSessionExpiry(uint48 newExpiry)`: Sets a new unix timestamp expiration limit for the session key. Restricted to the Smart Wallet controller.
    *   `setMaxDailyLimit(uint256 newLimit)`: Updates the rolling daily spend limit cap. Restricted to the Smart Wallet controller.
    *   `setSpendWindowDuration(uint48 newDuration)`: Sets the duration of the rolling limit window (e.g., 24 hours). Restricted to the Smart Wallet controller.
    *   `setTargetWhitelist(address target, bool isAllowed)`: Enables or disables a dApp contract address on the integration whitelist. Restricted to the Smart Wallet controller.
    *   `setRecipientWhitelist(address recipient, bool isAllowed)`: Enables or disables a destination wallet address for direct token transfers. Restricted to the Smart Wallet controller.
    *   `resetSpentToday()`: Resets the dynamic daily accumulation tracker back to zero. Restricted to the Smart Wallet controller.

### 3. `ArbAgentAccountFactory.sol` (Programmatic Deployer)
*   **Role**: Streamlines onboarding by deploying a new smart wallet and configuring its policies in a single atomic transaction.
*   **Core External & Public Functions**:
    *   `createAgentAccount(address owner)`: Deploys a raw, EIP-4337 compliant `ArbAgentAccount` for a specific owner EOA.
    *   `createConfiguredAgentAccount(...)`: Deploys a smart account, deploys a policy guardrail, and configures the session signer, limits, and whitelist in a single, gas-optimized transaction.
    *   `getAccounts(address owner)`: A utility view function that returns a list of all smart account addresses deployed for a specific owner.

### 4. `ArbAgentPaymaster.sol` (Gas Tank & Paymaster)
*   **Role**: Sponsors the AI Agent's on-chain gas costs gaslessly from the bot's perspective, charging the owner's Centralized Gas Tank in USDC.
*   **Core External & Public Functions**:
    *   `topUpGasTank(address account, uint256 amount)`: Deposits USDC from an owner's wallet into their specific centralized paymaster gas tank.
    *   `withdrawGasTank(uint256 amount)`: Withdraws USDC from the smart account's paymaster gas tank back to the owner.
    *   `registerSponsoredAccount(address account, bool isSponsored)`: Registers or unregisters a smart account for gas tank billing sponsorship.
    *   `readGasTankState(address account)`: A view utility returning the account's total USDC gas tank balance and the amount currently locked/reserved in the bundler validation cycle.
    *   `setBillingConfig(uint256 newTokenPerNativeToken, uint16 newMarkupBps)`: Updates the ETH-to-USDC exchange rate and the safety markup premium. Restricted to the contract owner.
    *   `validatePaymasterUserOp(PackedUserOperation userOp, bytes32 userOpHash, uint256 maxCost)`: EIP-4337 validation callback. Inspects paymaster sponsor status and reserves/locks a cost margin in USDC to prevent frontrunning.
    *   `postOp(PostOpMode mode, bytes context, uint256 actualGasCost)`: EIP-4337 settlement callback. Calculates actual ETH gas spent, converts it to USDC based on the quote + markup, debits the account's gas tank, and releases any unused reserved USDC.

### 5. `MockUSDC.sol` (Billing Token Faucet)
*   **Role**: Implements a standard ERC-20 token with 6 decimal places representing the USDC billing token.
*   **Core External & Public Functions**:
    *   `claimTestnetUSDC()`: Public faucet function allowing developers and users to instantly mint test USDC tokens to their wallets for local dev flows and testnet demonstrations.

---

## 🛠️ Local Development & Testing

Phylax uses **Foundry** for compiling, formatting, and unit testing smart contracts.

### Installation
Ensure you have Foundry installed on your machine. If not, install it by running:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Development Commands
Run these commands inside the `contracts/` directory:

```bash
# 1. Install solidity library dependencies
forge install

# 2. Compile all solidity smart contracts
forge build

# 3. Format the codebase according to style guidelines
forge fmt

# 4. Run the comprehensive unit test suite
forge test

# 5. Check test coverage metrics
forge coverage
```

---

## 🚀 Deployment Lifecycle

Contract deployment is automated via Solidity scripts in `script/DeployPhylaxStack.s.sol`.

### 1. Configure Environment Variables
Copy the template `.env.example` to `.env` inside the `contracts/` directory:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `ENTRY_POINT_ADDRESS` | Address of pre-deployed EIP-4337 EntryPoint. If left empty, a mock EntryPoint will be deployed. |
| `BILLING_TOKEN_ADDRESS` | Address of USDC Billing Token. If left empty, a `MockUSDC` contract is deployed. |
| `TOKEN_PER_NATIVE_TOKEN` | Conversion rate: amount of USDC representing 1 ETH (scaled to 1e18 decimals). |
| `MARKUP_BPS` | Paymaster fee premium in Basis Points (e.g., `500` = 5% extra to cover bundler gas fluctuations). |
| `INITIAL_PAYMASTER_DEPOSIT` | Initial amount of native ETH deposited into the EntryPoint to sponsor bundler fees. |

### 2. Dry-Run Deployment (Simulation)
Test the deployment script locally by dry-running against your target RPC endpoint:
```bash
forge script script/DeployPhylaxStack.s.sol:DeployPhylaxStack \
  --rpc-url <YOUR_RPC_URL> \
  --gas-limit 30000000 \
  -vvvv
```

### 3. Broadcast Live Deployment
To broadcast live transactions and deploy the contracts onto the network, add `--broadcast` and your wallet signers:
```bash
forge script script/DeployPhylaxStack.s.sol:DeployPhylaxStack \
  --rpc-url <YOUR_RPC_URL> \
  --account <YOUR_FOUNDRY_KEYSTORE_NAME> \
  --broadcast \
  --verify
```

---

## 🔒 Technical Nuances & Audit Focus Areas

Auditors and developers should pay close attention to these custom implementation details:

*   **Reserved-Balance Locking**: In EIP-4337, paymasters validate transactions off-chain, then settle fees on-chain. To prevent an owner from draining their USDC Gas Tank right before a transaction completes (frontrunning), `ArbAgentPaymaster` locks a reserved USDC allocation during the `validatePaymasterUserOp` phase. This locked balance is only settled or released during the `postOp` phase.
*   **Static Quote Oracle**: The current version of `ArbAgentPaymaster` relies on a static quote rate set by the contract owner via `tokenPerNativeToken`. In high-volatility mainnet production environments, this should be upgraded to consume a dynamic oracle price feed (e.g., Chainlink ETH/USDC data feed).
*   **EntryPoint Size Limitations**: The official EIP-4337 `EntryPoint` reference contract is exceptionally large and might exceed the EIP-170 contract size limit (24.576 KB) during standard local hardhat or foundry compilation. Ensure you turn on EVM optimizer settings (`optimizer_runs = 200` or higher) in `foundry.toml` or specify a pre-deployed standard `EntryPoint` address.

---

## 📄 License
Licensed under the **MIT License**.
