# Phylax Contracts

Smart contract layer untuk MVP `Phylax SDK`.

Kontrak inti:
- `ArbAgentAccount.sol`: smart account ERC-4337 untuk AI agent
- `AI_GuardrailModule.sol`: expiry, spend limit, dan whitelist target
- `ArbAgentAccountFactory.sol`: deploy `account + guardrail`
- `ArbAgentPaymaster.sol`: sponsor gas via EntryPoint deposit, billing ke `gas tank` owner
- `MockUSDC.sol`: token billing 6 desimal untuk local/dev flow

Kapabilitas dashboard yang sudah dicakup kontrak:
- provision agent satu kali via `createConfiguredAgentAccount(...)`
- `agentName` on-chain per smart account
- whitelist target dengan `name + address`
- session expiry + configurable spend-window duration berbasis detik
- daily-limit tracking via guardrail
- paymaster gas tank top up + reserved-balance accounting
- faucet publik `claimTestnetUSDC()` untuk flow testnet/demo
- execution metadata event untuk feed activity log

## Development

```bash
forge fmt
forge test
```

## Deploy Flow

Script deploy yang dipakai:

1. `script/DeployPhylaxStack.s.sol`
   - deploy `EntryPoint` jika belum ada
   - deploy `MockUSDC` jika belum ada billing token
   - deploy `ArbAgentAccountFactory`
   - deploy `ArbAgentPaymaster`
   - optional fund deposit/stake paymaster
   - optional transfer ownership paymaster

Sesudah infra terdeploy, owner onboarding dilakukan lewat `web/dashboard`:
- create smart account
- generate/register session signer
- set spend limit
- set spend window duration
- set whitelist target
- top up gas tank
- register smart account ke paymaster

## Dry Run

Dry run deploy infra:

```bash
forge script script/DeployPhylaxStack.s.sol:DeployPhylaxStack \
  --rpc-url <RPC_URL> \
  --gas-limit 30000000 \
  -vvvv
```

Untuk broadcast, tambahkan:

```bash
--account <KEYSTORE_NAME> --broadcast
```

## Env: DeployPhylaxStack

Template:

```bash
contracts/.env.example
```

Opsional:

```bash
ENTRY_POINT_ADDRESS=0x...          # kalau kosong, deploy EntryPoint baru
BILLING_TOKEN_ADDRESS=0x...        # kalau kosong, deploy MockUSDC baru
TOKEN_PER_NATIVE_TOKEN=3000000000  # contoh quote billing token per 1 native token (1e18 basis)
MARKUP_BPS=500                     # 5%
INITIAL_PAYMASTER_DEPOSIT=100000000000000000
INITIAL_PAYMASTER_STAKE=100000000000000000
PAYMASTER_UNSTAKE_DELAY=86400
PAYMASTER_OWNER=0x...
MOCK_USDC_MINT_RECIPIENT=0x...
INITIAL_MOCK_USDC_MINT=1000000000000
```

## Catatan

- jalur utama sesudah deploy adalah lewat `web/dashboard`, bukan lewat script bootstrap tambahan.
- `ArbAgentPaymaster` saat ini memakai model quote statis `tokenPerNativeToken + markupBps`, belum oracle-based.
- `ArbAgentPaymaster` sudah memakai reserved-balance settlement agar owner tidak bisa menarik saldo yang sedang dipakai user operation yang sudah tervalidasi.
- untuk local/anvil testing, `MockUSDC` dipakai sebagai billing token, memiliki owner mint, dan menyediakan faucet publik untuk testnet/demo.
- `EntryPoint` dari reference `account-abstraction` melebihi EIP-170 contract size limit saat disimulasikan bila dideploy dari script. Untuk deployment nyata sebaiknya pakai EntryPoint standar yang memang sudah tersedia di network target, lalu isi `ENTRY_POINT_ADDRESS`.
