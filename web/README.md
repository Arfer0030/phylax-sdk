# 💻 Phylax Web Application (Landing Page, Owner Dashboard & Docs)

[![Framework: Next.js 16](https://img.shields.io/badge/Framework-Next.js%2016-black.svg)](https://nextjs.org/)
[![React: 19](https://img.shields.io/badge/Library-React%2019-blue.svg)](https://react.dev/)
[![TailwindCSS: 4](https://img.shields.io/badge/Styling-TailwindCSS%204-cyan.svg)](https://tailwindcss.com/)
[![Web3: RainbowKit / Wagmi](https://img.shields.io/badge/Web3-RainbowKit%20%2F%20Wagmi-purple.svg)](https://www.rainbowkit.com/)

This folder contains the **Phylax Web Portal**—the central user experience hub of the Phylax SDK ecosystem. It hosts the beautiful marketing landing page, the developer documentation center, and the administrative owner dashboard.

---

## 🎯 Application Hubs

The web portal is divided into three core functional spaces, designed with a premium, state-of-the-art dark theme to match our cyber-security brand identity:

### 1. 🌌 Onboarding Landing Page (`/`)
*   **Purpose**: Introduces users, treasury managers, and developers to Phylax SDK.
*   **Key Features**:
    *   Sleek dark-mode aesthetic with interactive hover micro-animations and glowing ambient gradients.
    *   Highlighting critical AI agent security problems (Prompt Injection, Nonce sync collision, gas starvation) and showing the exact Phylax solutions.
    *   Quick navigation buttons for the Docs Hub and the Owner Dashboard.

### 2. 📝 Developer Documentation Hub (`/docs`)
*   **Purpose**: A clean, spacious, high-fidelity technical guide for developers integrating the `@phylax-sdk/sdk`.
*   **Key Features**:
    *   **VS Code Theme Code Blocks**: High-contrast, non-recursive, lexical code token highlighter for Solidity, TypeScript, Bash, and Environment configurations.
    *   **Table of Contents**: A responsive, collapsible, multi-category left sidebar grouping guides from "Getting Started" to "Emergency Recovery".
    *   **Mobile-Friendly HUD**: A slick mobile bar displaying active chapter categories and dynamic page tracking.
    *   **Spacious Readability**: Tailored `max-w-[1440px]` typography spacing and custom fonts (Inter & JetBrains Mono) without distracting slants or generic color saturations.

### 3. 📊 Owner Dashboard (`/dashboard`)
*   **Purpose**: The central command tower where owners programmatically manage and sponsor their autonomous AI agent's wallets.
*   **Key Features**:
    *   **Guarded Account Provisioning**: Programmatically deploy new policy-bounded wallets with customized configurations.
    *   **Policy & Whitelist Control**: Manage recipient address whitelists, rolling spend limits, session expiries, and session key revocations.
    *   **Centralized Gas Tank**: Real-time gas cost sponsoring monitoring, billing settlement activity feeds, and instant USDC tank top-ups.
    *   **Live Activity Feed**: Interactive logs capturing user operation hashes, confirmed gas fees, and block confirmations.

---

## ⚙️ Environment Variables Setup

Before running the web app, you must configure the environment variables:

1. Copy the `.env.example` template to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the required addresses and parameters:

```env
# 1. WalletConnect Project ID for Web3 Wallet Connections (RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"

# 2. Public site URL used for metadata / Open Graph image resolution
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 3. Arbitrum Sepolia RPC Endpoint (System public node)
NEXT_PUBLIC_PHYLAX_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"

# 4. Pre-deployed Contract Addresses on Arbitrum Sepolia
NEXT_PUBLIC_PHYLAX_FACTORY_ADDRESS="0x4d76A69109f8700eF5A2c1aE4eA9fcF8Add62599"
NEXT_PUBLIC_PHYLAX_PAYMASTER_ADDRESS="0xf3207d9556aa8ED9E4ddf610BfCeFE7EA4d88932"
NEXT_PUBLIC_PHYLAX_BILLING_TOKEN_ADDRESS="0x95074947def59a6860486437B62E1795cC105fDa"
NEXT_PUBLIC_PHYLAX_ENTRYPOINT_ADDRESS="0x0000000071727de22e5e9d8baf0edac6f37da032"
```

---

## ⚡ Development & Scripts

To run the web application locally:

### 1. From the Monorepo Root (Recommended)
You can start the frontend application from the root of the project using pnpm workspaces:
```bash
# Compile SDK and spin up Next.js dev server concurrently
pnpm dev:web
```

### 2. From the `web/` Directory Directly
If you want to run scripts directly in this folder:
```bash
cd web

# Installs dependencies if not already done
pnpm install

# Build the local @phylax-sdk/sdk dependency and start next.js
pnpm run dev
```

The application will be live at [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Technology Stack & Web Standards

*   **Framework**: Next.js `16.x` using the **App Router** for fast page loading and optimized static file generation.
*   **Web3 Engine**: Wagmi `2.x`, RainbowKit `2.x`, and Viem `2.x` for robust EIP-1193 wallet management and gasless transaction payloads.
*   **Styling**: TailwindCSS `4.x` utilizing CSS variables for theme token management, smooth transitions, and premium responsive breakpoints.
*   **Icons**: Lucide Icons for consistent, modern visual queues.

---

## 📄 License
Licensed under the **MIT License**.

