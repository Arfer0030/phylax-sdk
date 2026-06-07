# 🛡️ Phylax SDK: On-Chain Security Guardrails for AI Agents

![Phylax Banner](./web/public/images/og-banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Arbitrum Sepolia](https://img.shields.io/badge/Network-Arbitrum%20Sepolia-cyan.svg)](https://sepolia.arbitrum.io/)
[![ERC-4337](https://img.shields.io/badge/Standard-ERC--4337%20v0.7-emerald.svg)](https://eips.ethereum.org/EIPS/eip-4337)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.8-blue.svg)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Contracts-Solidity%200.8.23-orange.svg)](https://soliditylang.org/)

**Phylax SDK** is a premium, developer-first, on-chain security toolkit designed specifically for **AI Agents** operating autonomously in Decentralized Finance (DeFi). By leveraging **ERC-4337 Account Abstraction (AA)**, **Ephemeral Session Keys**, and **Programmable Smart Guardrails**, Phylax bridges the gap between trustless automation and full-custody safety.

AI Agents are intrinsically susceptible to *prompt injection exploits*, semantic bugs, and hallucination loops. Traditional private key delegation exposes the user's entire EOA wallet to malicious draining. **Phylax** shifts the authority envelope to the blockchain: even if the AI host is completely compromised, the agent's actions are strictly bounded by rules enforced natively at the smart contract level.

---

## ⚙️ Installation

```sh
npm install @phylax-sdk/sdk
```

---

## 🔑 Core Security Pillars

Phylax operates on three foundational security components:

```
                  ┌───────────────────────────────┐
                  │      1. EPHEMERAL KEYS        │
                  │   Restricted, temporary EOA   │
                  │   session key given to bot.   │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │      2. CENTRALIZED GAS       │
                  │   Paymaster converts fee to   │
                  │   USDC. Bot holds zero ETH.   │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │     3. ON-CHAIN SHIELD        │
                  │  Contract asserts Whitelist,  │
                  │  daily caps & spend window.   │
                  └───────────────────────────────┘
```

1. **Ephemeral Session Keys (Delegated Execution)**
   Instead of delegating master private keys (EOA) to your host servers, the Master Owner generates a temporary operational session key inside the dashboard. This key has limited lifespan, gas allowances, and restricted call capabilities.
2. **Centralized Gas Tank (USDC Gas Sponsorship)**
   AI bots operate asynchronously and shouldn't hold raw gas tokens (ETH). Phylax employs a centralized USDC Gas Tank. The custom `ArbAgentPaymaster` intercepts the fee, converts it, and sponsors the transactions gaslessly from the AI Agent's perspective.
3. **On-Chain Programmable Guardrails (Strict Enforcement)**
   All transaction parameters (daily spend limits, whitelisted smart contracts, permitted interaction types) are parsed and evaluated in real-time by on-chain smart contract policies during the `validateUserOp` execution phase.

---

## 📁 Monorepo Workspace Architecture

Phylax is organized as a unified, high-performance `pnpm workspace` to streamline development across smart contracts, the SDK, and frontend/backend services:

```text
phylax-sdk/
├── contracts/             # Core Smart Contracts (Solidity & Foundry)
├── packages/
│   └── sdk/               # Core TypeScript SDK (@phylax-sdk/sdk)
├── web/                   # Next.js Web App (Dashboard, Docs, Landing Page)
└── agent-backend/         # Node.js Agent Host Service (Mock AI Runtime)
```

### 1. [contracts/](phylax-sdk/contracts) (Core Solidity Infrastructure)
*   **Core Role**: The absolute root of trust for policy validation and gas settlement.
*   **Key Components**:
    *   `GuardedAccount.sol`: An ERC-4337 compliant smart contract wallet representing the AI Agent's identity, owned by the Master Owner.
    *   `ArbAgentPaymaster.sol`: A custom on-chain paymaster that sponsors the agent's gas operations and automatically debits USDC from the Centralized Gas Tank.
    *   `AI_GuardrailModule.sol`: Extensible modular policy engine that evaluates whitelists, spend windows, and daily allocation limits.
*   **Technology Stack**: Solidity `0.8.23`, Foundry (compilation, testing, and deployment scripts).

### 2. [packages/sdk/](phylax-sdk/packages/sdk) (TypeScript Integration Layer)
*   **Core Role**: The unified SDK exposed to frontend dashboards and autonomous backend agent scripts.
*   **Key Components**:
    *   `PhylaxRuntimeClient`: The client-side runtime that abstracts ERC-4337 UserOperation packaging, gas estimations, local session-key signing, and bundler interactions.
    *   `Write Actions`: Programmatic administrative tools (`provisionGuardedAccount`, `topUpGasTank`, `updateWhitelist`).
    *   `Read Actions`: Programmatic analytics and metrics queries (`readOwnerGuardedAccounts`, `readGasTankState`).
*   **Technology Stack**: TypeScript `5.8`, Viem `2.x`, ESModules bundler.

### 3. [web/](phylax-sdk/web) (Interactive Dashboard & Docs)
*   **Core Role**: The visual control tower for Master Owners and the primary documentation hub for developers.
*   **Key Components**:
    *   `Landing Page`: Sleek, dark-themed introduction showcasing Phylax's technical value proposition.
    *   `Developer Documentation Hub` (`/docs`): Extremely premium, VS Code-themed code playground, guides, API references, and troubleshooting recipes.
    *   `Owner Dashboard`: Administrative portal for deploying smart accounts, configuring spending policies, reviewing live activity logs, and funding gas tanks.
*   **Technology Stack**: Next.js `16.x` (App Router), React `19.0`, TailwindCSS `4.x`, Lucide Icons.

### 4. [agent-backend/](phylax-sdk/agent-backend) (AI Agent Environment)
*   **Core Role**: Simulates an active, host-server environment running an AI Agent executing autonomous operations.
*   **Key Components**:
    *   `Mock AI / LLM Tool-Calling`: Translates user text queries ("Rebalance 15 USDC to safety vault") into structured web3 transactional payload calls using LLM structured outputs.
    *   `Autonomous Host`: Plugs directly into the `@phylax-sdk/sdk` using the session key to submit on-chain execution payloads gaslessly.
*   **Technology Stack**: Node.js, Express, TypeScript, Google GenAI SDK.

---

## ⚡ Developer Workspace Quickstart

Get the entire monorepo development environment running locally on your system in minutes.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or later)
*   [PNPM](https://pnpm.io/) (v8.x or later)
*   [Foundry](https://book.getfoundry.sh/getting-started/installation) (for smart contract work)

### 1. Install Workspace Dependencies
Run the installation command in the root folder of the monorepo. This installs all package dependencies for the contracts, SDK, web frontend, and backend agents simultaneously using symbolic linking:
```bash
pnpm install
```

### 2. Compile Smart Contracts
Navigate to the `contracts/` directory and compile the solidity files:
```bash
cd contracts
forge build
```

### 3. Run Local Development Servers
To start the developer environment, you can run targeted commands directly from the root workspace:

```bash
# Start both the Web Dashboard and Agent Backend concurrently
pnpm dev

# Start ONLY the Next.js Frontend Dashboard (Docs, Dashboard, Landing Page)
pnpm dev:web

# Start ONLY the Node.js Agent Host Backend
pnpm dev:backend
```

*   **Next.js Frontend**: Accessible on [http://localhost:3000](http://localhost:3000)

---

## 🚀 Autonomous Execution Lifecycle

This is the end-to-end path of a single transaction executed by an AI Agent under Phylax security protection:

```
 ┌──────────┐      1. User Intent       ┌───────────────┐
 │   USER   ├──────────────────────────►│   AI AGENT    │
 └──────────┘                           └───────┬───────┘
                                                │ 2. Tool-Calling & Build Payload
                                                ▼
 ┌──────────┐      4. UserOp Signed     ┌───────────────┐
 │ BUNDLER  │◄──────────────────────────┤  PHYLAX SDK   │
 └────┬─────┘     (Session Private Key) └───────────────┘
      │
      │ 5. validateUserOp()
      ▼
 ┌──────────────────────────────────────────────────────┐
 │               ARBITRUM SEPOLIA CHAIN                 │
 │                                                      │
 │  ┌───────────────────────┐   Yes   ┌──────────────┐  │
 │  │   GuardedAccount      ├────────►│  Paymaster   │  │
 │  │ (Policy Verification) │         │ (Gas Sponsored) │
 │  └──────────┬────────────┘         └──────┬───────┘  │
 │             │                             │          │
 │             │ 6. checkTransaction()       │          │
 │             ▼                             │          │
 │  ┌───────────────────────┐                │          │
 │  │  AI_GuardrailModule   │                │          │
 │  │  (Whitelist Check)    │                │          │
 │  └──────────┬────────────┘                │          │
 │             │ Yes                         │          │
 │             ▼                             ▼          │
 │  ┌────────────────────────────────────────────────┐  │
 │  │             Target Contract Executed           │  │
 │  │            (e.g., Transfer 15 USDC)            │  │
 │  └────────────────────────────────────────────────┘  │
 └──────────────────────────────────────────────────────┘
```

1. **Natural Language Input**: The user tells their AI assistant: *"Move 15 USDC to safety vault."*
2. **Intent Parsing**: The AI Agent's LLM interprets the instruction and structures a contract call targeting the ERC-20 transfer function of the USDC contract.
3. **Payload Construction**: The AI Agent passes this call payload to `@phylax-sdk/sdk`'s `PhylaxRuntimeClient`.
4. **Local Signing**: The SDK structures a standard **ERC-4337 UserOperation (UserOp)**, signs it locally with the delegated **Session Key**, and forwards it to an ERC-4337 Bundler queue.
5. **On-Chain Policy Validation**: 
   *   The `EntryPoint` contract triggers `validateUserOp` on the agent's `GuardedAccount`.
   *   The account delegates verification to the `AI_GuardrailModule`. It checks that the target contract is whitelisted, the expiry has not elapsed, and the transfer amount is within the daily spend limits.
6. **Gas Sponsorship**: The `ArbAgentPaymaster` verifies that the owner's USDC Gas Tank has a sufficient balance, sponsors the gas (ETH), and charges the tank in USDC.
7. **Execution**: The transaction is mined on-chain, and the agent's `waitForUserOperationReceipt` promise resolves with confirmed block metrics.

---

## 📄 License
This repository is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

