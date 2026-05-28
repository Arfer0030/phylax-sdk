# @phylax/sdk

TypeScript SDK awal untuk `Phylax`, dibangun di atas `viem` dan disusun agar bisa dipakai bersama oleh:

- `web/` untuk owner dashboard
- `agent-backend/` untuk mock AI runtime

## Scope Saat Ini

SDK saat ini sudah mencakup:

- ABI Phylax kontrak inti
- public client + local wallet client factory
- read helpers untuk dashboard:
  - owner accounts
  - guarded account state
  - gas tank state
  - execution activity logs
  - gas settlement logs
- owner write helpers:
  - provision guarded account
  - update name/session/limits/whitelist
  - revoke session signer
  - top up gas tank
  - claim testnet USDC
  - register/remove sponsored account
- session helpers:
  - generate session key
  - derive signer dari private key
  - encode `execute` / `executeWithMetadata`
- runtime helpers phase 2:
  - custom `PhylaxRuntimeClient`
  - fallback Pimlico bundler Arbitrum Sepolia
  - local session-key signing untuk UserOperation v0.7
  - custom on-chain paymaster injection untuk `ArbAgentPaymaster`
  - guarded execution submit + wait receipt

## Runtime Flow Phase 2

`PhylaxRuntimeClient` dipakai untuk flow agent-side:

```ts
import { arbitrumSepolia } from "viem/chains";
import { createPhylaxRuntimeClient } from "@phylax/sdk";

const client = await createPhylaxRuntimeClient({
  chain: arbitrumSepolia,
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  smartAccountAddress: "0x...",
  sessionPrivateKey: "0x...",
  addresses: {
    factory: "0x...",
    paymaster: "0x...",
    billingToken: "0x...",
    entryPoint: "0x0000000071727de22e5e9d8baf0edac6f37da032",
  },
});

const { userOperationHash } = await client.sendGuardedExecution({
  target: "0xTarget...",
  value: 0n,
  data: "0x...",
  spendAmount: 1_000_000n,
  action: "Swap Execution",
  context: "AI trader route on Uniswap V3",
});

const receipt = await client.waitForUserOperationReceipt(userOperationHash);
```

## Belum Dicakup

Bagian berikut masih belum final di iterasi ini:

- generic `sendTransaction()` / `writeContract()` ergonomics untuk Phylax runtime
- revert decoding pipeline yang rapi untuk blocked/reverted anomalies dari bundler response
- higher-level AI action builders seperti swap/transfer templates
- refactor `agent-backend/` agar memakai runtime client ini end-to-end

Boundary ini sengaja dipilih supaya:

- `web/` owner dashboard bisa live lebih dulu
- agent runtime sudah punya jalur `UserOperation` nyata
- iterasi berikutnya tinggal fokus ke DX dan error/reporting layer

## Contoh Arah Penggunaan

```ts
import { arbitrumSepolia } from "viem/chains";
import {
  createPhylaxPublicClient,
  readOwnerGuardedAccounts,
  topUpGasTank,
} from "@phylax/sdk";

const config = {
  chain: arbitrumSepolia,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
  addresses: {
    factory: "0x...",
    paymaster: "0x...",
    billingToken: "0x...",
    entryPoint: "0x...",
  },
} as const;

const publicClient = createPhylaxPublicClient(config);
const accounts = await readOwnerGuardedAccounts(publicClient, config, "0x...");
```
