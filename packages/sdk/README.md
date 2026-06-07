# Package @phylax-sdk/sdk (Core TypeScript SDK Reference)

[![npm version](https://img.shields.io/npm/v/@phylax-sdk/sdk.svg)](https://www.npmjs.com/package/@phylax-sdk/sdk)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.8-blue.svg)](https://www.typescriptlang.org/)
[![Viem](https://img.shields.io/badge/Library-Viem%202.x-emerald.svg)](https://viem.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The **Phylax TypeScript SDK** is the core programmatic integration engine of the Phylax transaction protection framework. Built on top of **Viem**, it abstracts the complexities of EIP-4337 Account Abstraction, off-chain session key signing, programmatic wallet provisioning, and real-time gas sponsorship monitoring into a set of strongly-typed TypeScript primitives.

---

## ⚙️ Installation

```sh
npm install @phylax-sdk/sdk
```

---

## 🏛️ SDK Module Architecture

The SDK codebase is organized into highly modular, decoupled sub-packages to isolate different developer roles (Master Owner, AI Agent, Frontend Developer, Backend Operator):

```
                       @phylax-sdk/sdk (Unified Entrypoint)
                                    │
       ┌──────────────────┬─────────┴─────────┬──────────────────┐
       ▼                  ▼                   ▼                  ▼
  [ clients/ ]        [ read/ ]           [ write/ ]        [ runtime/ ]
Client Factories    Dashboard Queries   Owner Policies   AI Agent Client
  (Viem Primitives)   (Read States)     (Write Actions)   (EIP-4337 Runtime)
```

1. **`clients/` (Client Factories)**: Standardizes Web3 RPC connection clients for public nodes and EOA local wallets, injecting correct chain parameters.
2. **`read/` (Dashboard Read Helpers)**: High-speed view utilities designed for dashboards to fetch gas tank balances, account policies, and active event feeds.
3. **`write/` (Owner Write Helpers)**: Programmatic administrative actions allowing owners or backend scripts to deploy accounts, deposit gas, and edit policies.
4. **`session/` (Session & Signer Utilities)**: Cryptographic primitives for client-side ephemeral key generation, signing, and calldata encoding.
5. **`runtime/` (AI Agent Runtime)**: The autonomous client execution engine that generates, signs, and executes EIP-4337 UserOperations gaslessly.

---

## 📚 Complete API Reference & Exports

The SDK exports the following core primitives from `index.ts`:

### 1. Client Factories (`clients/`)
*   `createPhylaxPublicClient(config: PhylaxSdkConfig): PhylaxPublicClient`
    Instantiates a high-performance Viem public client tailored for the Arbitrum Sepolia network.
*   `createPhylaxLocalWalletClient(config: PhylaxSdkConfig, privateKey: Hex): PhylaxWalletClient`
    Instantiates a local-signer wallet client using a private key to authorize owner administrative transactions.

### 2. Dashboard Read Helpers (`read/`)
*   `readOwnerGuardedAccounts(client: PhylaxPublicClient, config: PhylaxSdkConfig, owner: Address): Promise<Address[]>`
    Retrieves all smart wallet contract addresses deployed for a specific owner.
*   `readGuardedAccountState(client: PhylaxPublicClient, account: Address): Promise<GuardedAccountState>`
    Queries the complete state of a smart wallet, including the active session signer, expiry time, daily spend limit, rolling window, and spent amount.
*   `readGasTankState(client: PhylaxPublicClient, config: PhylaxSdkConfig, account: Address): Promise<GasTankState>`
    Queries the USDC gas tank balance and the amount currently locked/reserved in the bundler validation cycle.
*   `readExecutionActivityLogs(client: PhylaxPublicClient, account: Address): Promise<ExecutionActivityLog[]>`
    Fetches the live history of all execution activity events emitted by a smart account, feeding dashboard telemetry.
*   `readGasSettlementLogs(client: PhylaxPublicClient, config: PhylaxSdkConfig, account: Address): Promise<GasSettlementLog[]>`
    Fetches the history of gas settlement charges deducted in USDC from the account's paymaster gas tank.

### 3. Owner Write Helpers (`write/`)
*   `provisionGuardedAccount(publicClient: PhylaxPublicClient, walletClient: PhylaxWalletClient, config: PhylaxSdkConfig, params: ProvisionGuardedAccountParams): Promise<ContractWriteResult>`
    Deploys a new `ArbAgentAccount` and pairs it with an configured `AI_GuardrailModule` in a single transaction.
*   `topUpGasTank(publicClient: PhylaxPublicClient, walletClient: PhylaxWalletClient, config: PhylaxSdkConfig, amount: bigint): Promise<Hex>`
    Deposits USDC into the Paymaster Gas Tank on behalf of the smart account. It automatically handles the ERC-20 token approval to the paymaster if needed.
*   `revokeSessionSigner(publicClient: PhylaxPublicClient, walletClient: PhylaxWalletClient, account: Address): Promise<Hex>`
    Triggers an emergency on-chain revocation of the active delegated session key.
*   `setAgentName(publicClient: PhylaxPublicClient, walletClient: PhylaxWalletClient, account: Address, name: string): Promise<Hex>`
    Updates the program name registered on-chain for the smart account.
*   `setMaxDailyLimit(publicClient: PhylaxPublicClient, walletClient: PhylaxWalletClient, account: Address, newLimit: bigint): Promise<Hex>`
    Updates the rolling daily USDC spending cap.
*   `setWhitelistTarget(publicClient: PhylaxPublicClient, walletClient: PhylaxWalletClient, account: Address, target: Address, name: string, isAllowed: boolean): Promise<Hex>`
    Registers or unregisters an external dApp smart contract address on the allowed target whitelist.
*   `setWhitelistRecipient(publicClient: PhylaxPublicClient, walletClient: PhylaxWalletClient, account: Address, recipient: Address, name: string, isAllowed: boolean): Promise<Hex>`
    Registers or unregisters an external destination wallet address on the allowed transfer recipient whitelist.

### 4. Session Primitives (`session/`)
*   `generateSessionKey(): SessionKeyMaterial`
    Generates a secure, cryptographically random Ephemeral EOA keypair client-side.
*   `sessionAccountFromPrivateKey(privateKey: Hex): LocalAccount`
    Derives a Viem LocalAccount signer from an ephemeral private key to authorize UserOperations.
*   `encodeExecuteCall(target: Address, value: bigint, data: Hex, spendAmount: bigint): Hex`
    Encodes standard transaction execution parameters into `execute` calldata.
*   `encodeExecuteWithMetadataCall(target: Address, value: bigint, data: Hex, spendAmount: bigint, action: string, context: string): Hex`
    Encodes execution parameters along with extra telemetry strings ("action", "context") for dashboard activity logs.

### 5. AI Agent Runtime (`runtime/`)
*   `createArbitrumSepoliaRuntimeClient(config: PhylaxArbitrumSepoliaRuntimeConfigInput): Promise<PhylaxRuntimeClient>`
    Instantiates the live EIP-4337 runtime client using Arbitrum Sepolia pre-set contract configurations.
*   `PhylaxRuntimeClient` (Class)
    The client engine that manages transaction packaging.
    *   `sendGuardedExecution(params: PhylaxGuardedExecutionParams): Promise<{ userOperationHash: Hex }>`
        Estimates, builds, signs, and dispatches a secure EIP-4337 UserOperation for execution.
    *   `waitForUserOperationReceipt(hash: Hex): Promise<UserOperationReceipt>`
        A promise wrapper that polls and awaits bundler verification and on-chain block mining.

---

## 💾 Core TypeScript Types & Schemas

The SDK is written with strict type safety. Here are the core data schemas you will interact with:

### `PhylaxSdkConfig`
Defines the client-side configuration parameters to initialize connection modules:
```typescript
interface PhylaxSdkConfig {
  chain: Chain; // e.g. arbitrumSepolia
  rpcUrl: string; // Arbitrum Sepolia public/private RPC endpoint
  addresses: {
    factory: Address; // ArbAgentAccountFactory deployment
    paymaster: Address; // ArbAgentPaymaster deployment
    billingToken: Address; // MockUSDC / USDC Token deployment
    entryPoint: Address; // EIP-4337 EntryPoint (v0.7) deployment
  };
}
```

### `ProvisionGuardedAccountParams`
The configuration schema passed when deploying a new policy-bounded wallet:
```typescript
interface ProvisionGuardedAccountParams {
  owner: Address; // The Master Owner EOA that retains full custody control
  agentName: string; // User-facing name of the AI Agent (e.g. "Yield Bot Alpha")
  sessionSigner: Address; // The public key of the delegated Ephemeral Session Key
  sessionExpiry: number; // Unix timestamp specifying session expiration
  maxDailyLimit: bigint; // Dynamic rolling daily spending cap in USDC (decimals: 6)
  spendWindowDuration: number; // Duration of rolling limit window in seconds (e.g., 86400 for 24h)
  whitelist: Array<{
    name: string; // Human-readable label (e.g. "Uniswap V3 Router")
    address: Address; // Contract or wallet address
    type: "contract" | "wallet"; // Category for whitelisting rules
  }>;
}
```

### `GuardedAccountState`
The detailed state returned when reading a smart wallet's administrative details:
```typescript
interface GuardedAccountState {
  agentName: string; // The registered agent name
  owner: Address; // The Master Owner's address
  sessionSigner: Address; // Active session key signer (returns address(0) if revoked/expired)
  sessionValidUntil: number; // Expiration timestamp of active session
  maxDailyLimit: bigint; // Configured daily spend cap
  spendWindowDuration: number; // Spend window size in seconds
  spentInWindow: bigint; // Total USDC spent in the active rolling window
  windowStart: number; // Start timestamp of the current rolling window
}
```

### `GasTankState`
The billing balance returned when querying the paymaster:
```typescript
interface GasTankState {
  balance: bigint; // USDC currently available to spend on gas fees (decimals: 6)
  reserved: bigint; // USDC currently locked to secure pending bundler transactions
}
```

---

## 🚀 Advanced Under-The-Hood Execution Flow

When an AI Agent triggers `runtime.sendGuardedExecution()`, the `PhylaxRuntimeClient` executes a complex EIP-4337 Account Abstraction lifecycle under the hood:

```
    sendGuardedExecution() called on runtime
                     │
                     ▼
  1. Build Call Data using encodeExecuteWithMetadata
                     │
                     ▼
  2. Fetch Gas Estimates & Nonces from EntryPoint
                     │
                     ▼
  3. Construct EIP-4337 UserOperation (UserOp v0.7)
                     │
                     ▼
  4. Inject Paymaster Sponsorship Data (paymasterAndData)
     - Maps to ArbAgentPaymaster
                     │
                     ▼
  5. Sign UserOp Hash locally with Ephemeral Session Key
                     │
                     ▼
  6. Dispatch Signed UserOp to the Pimlico Bundler
```

1. **Craft Calldata**: The SDK packs the execution parameters (target, value, and calldata) into a single, structured payload utilizing `executeWithMetadata` so that detailed telemetries are emitted on-chain.
2. **Fetch Nonces & Gas Limits**: The SDK queries the standard EIP-4337 `EntryPoint` to fetch the account's active sequential nonce and makes call estimations to obtain gas parameters (`preVerificationGas`, `verificationGasLimit`, `callGasLimit`).
3. **Build UserOperation**: The client constructs a standard `PackedUserOperation` containing all gas caps and prices.
4. **Gas Tank Settlement Injections**: The SDK configures the `paymasterAndData` field targeting the `ArbAgentPaymaster` address. This tells the bundler that gas fees are sponsored and sponsored deductions will be settled in USDC.
5. **Session Key Signature**: The SDK hashes the UserOperation according to the EIP-4337 standard (combining the EntryPoint address and Chain ID) and signs the hash locally using the agent's **Session Private Key**. This signature is appended to the `signature` field of the UserOp.
6. **Bundler Dispatch**: The completed, signed UserOperation is submitted to the **Pimlico Bundler** JSON-RPC endpoint. The bundler validates the signature, submits it to the decentralized mempool, and mines the transaction on Arbitrum Sepolia.

---

## 📄 License
Licensed under the **MIT License**.


