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

## Belum Dicakup

Bagian berikut sengaja belum dimasukkan pada iterasi ini:

- smart-account client ERC-4337 penuh untuk custom `ArbAgentAccount`
- bundler + custom paymaster integration end-to-end
- revert decoding pipeline untuk transaksi yang gagal

Boundary ini sengaja dipilih supaya `web/` bisa mulai wiring owner flow sekarang, sementara flow AI agent + bundler bisa ditambahkan setelah deployment testnet siap.

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
