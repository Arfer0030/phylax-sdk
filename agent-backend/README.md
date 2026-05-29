# 🤖 Phylax Agent Backend (Mock AI Host Environment)

[![Node: 18+](https://img.shields.io/badge/Node-v18%2B-green.svg)](https://nodejs.org/)
[![TypeScript: 5.8](https://img.shields.io/badge/Language-TypeScript%205.8-blue.svg)](https://www.typescriptlang.org/)
[![LLM: Google GenAI](https://img.shields.io/badge/AI%20SDK-Google%20GenAI-violet.svg)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Server-Express%204.x-lightgrey.svg)](https://expressjs.com/)

This folder contains the **Phylax Agent Backend**—a simulated server-side runtime environment representing an autonomous **AI Agent** executing web3 operations. It acts as the live testing environment for our policy-bounded SDK client.

---

## 🧠 Core Architecture & AI Capabilities

The backend serves as a mock autonomous workspace that showcases how on-chain security guardrails safely restrict LLMs. It features:

### 1. 🔍 Natural Language Intent Interpreter
*   **Role**: Converts human instructions ("Rebalance 15 USDC to safety vault") into structured blockchain transactional calls.
*   **Core Logic**: Uses **Google Gemini API** with structured schema generation (`GoogleGenAI`) to safely parse text inputs into formal execution payloads (target, value, transfer calldata) without risk of string manipulation or semantic hallucinations.

### 2. 🛡️ Delegated Session Execution (Phylax SDK Integration)
*   **Role**: Submits execution payloads to the blockchain safely and gaslessly from the host server.
*   **Core Logic**: 
    *   Initializes the `@phylax/sdk` `PhylaxRuntimeClient` using a delegated **Ephemeral Session Private Key** (no master owner credentials).
    *   Wraps the transaction parameters inside an EIP-4337 UserOperation.
    *   Signs the payload locally and dispatches it via public bundlers.

### 3. 🚦 Guardrail Interception & Error Catching
*   **Role**: Gracefully captures policy violations to report back to the AI.
*   **Core Logic**: If the AI attempts to execute an operation that violates configured policies (e.g., transfers to a non-whitelisted address or exceeds the 24-hour daily spend cap), the on-chain contracts revert the transaction. The SDK catches these specific solidity reverts (like `DailyLimitExceeded` or `TargetNotWhitelisted`) and maps them to descriptive logs so the AI can correct its behavior.

---

## ⚙️ Environment Variables Configuration

Copy the `.env.example` template to `.env` inside the `agent-backend/` directory:
```bash
cp .env.example .env
```

Set the following variables before running:

```env
# 1. API key for Google Gemini model processing (Generates structured tool-calling payloads)
GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>"

# 2. Arbitrum Sepolia RPC Endpoint (System public node)
ARBITRUM_SEPOLIA_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"

# 3. Guarded Account address representing the agent's smart wallet identity
PHYLAX_SMART_ACCOUNT_ADDRESS="0x..."

# 4. Ephemeral session private key delegated to this agent instance (Used to sign user ops)
PHYLAX_AI_SESSION_PRIVATE_KEY="0x..."

# 5. USDC ERC-20 token billing contract on Arbitrum Sepolia
USDC_ADDRESS="0x95074947def59a6860486437B62E1795cC105fDa"
```

---

## ⚡ Development & Scripts

To start the backend environment locally:

### 1. From the Monorepo Root (Recommended)
Launch the backend developer task directly from the monorepo root:
```bash
# Starts ONLY the express backend server on port 3001
pnpm dev:backend
```

### 2. From the `agent-backend/` Directory Directly
Or, navigate and run local scripts inside this package:
```bash
cd agent-backend

# Install dependencies if not already done
pnpm install

# Start compilation and run server via ts-node
pnpm run dev
```

The backend API server will start up on [http://localhost:3001](http://localhost:3001).

---

## 📄 License
Licensed under the **MIT License**.
