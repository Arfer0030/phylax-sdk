"use client";

import {
  Code2,
  BookOpen,
  FileCode,
  Shield,
  Key,
  AlertTriangle,
  Copy,
  Terminal,
  Server,
  Layers,
  Settings,
  HelpCircle,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  User,
  Cpu,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type DocTopic =
  | "intro"
  | "why-phylax"
  | "install"
  | "env"
  | "concept-keys"
  | "concept-gas"
  | "concept-guardrail"
  | "arch-flow"
  | "api-runtime"
  | "api-write"
  | "api-read"
  | "recipe-ai"
  | "recipe-emergency"
  | "security"
  | "errors"
  | "faq";

export default function DocsPage() {
  const [activeTopic, setActiveTopic] = useState<DocTopic>("intro");
  const [copiedText, setCopiedText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const topics = [
    { id: "intro", label: "01. Introduction", category: "Getting Started", icon: BookOpen },
    { id: "why-phylax", label: "02. Why Phylax?", category: "Getting Started", icon: Sparkles },
    { id: "install", label: "03. Getting Started Workflow", category: "Getting Started", icon: Terminal },
    { id: "env", label: "04. Env Configuration", category: "Getting Started", icon: Settings },
    
    { id: "concept-keys", label: "05. Ephemeral Session Keys", category: "Core Concepts", icon: Key },
    { id: "concept-gas", label: "06. Centralized Gas Tank", category: "Core Concepts", icon: Server },
    { id: "concept-guardrail", label: "07. Guardrail Interception", category: "Core Concepts", icon: Shield },
    { id: "arch-flow", label: "08. Architecture & Flow", category: "Core Concepts", icon: Layers },
    
    { id: "api-runtime", label: "09. AI SDK Reference", category: "API Reference", icon: Code2 },
    { id: "api-write", label: "10. Owner Write Actions", category: "API Reference", icon: FileCode },
    { id: "api-read", label: "11. Owner Read Actions", category: "API Reference", icon: Layers },
    
    { id: "recipe-ai", label: "12. AI Tool-Calling Integration", category: "Guides & Recipes", icon: Code2 },
    { id: "recipe-emergency", label: "13. Emergency Recovery", category: "Guides & Recipes", icon: AlertTriangle },
    
    { id: "security", label: "14. Audit & Security", category: "Security & Trust", icon: Shield },
    
    { id: "errors", label: "15. Errors & Troubleshooting", category: "Troubleshooting", icon: HelpCircle },
    { id: "faq", label: "16. Common FAQ", category: "Troubleshooting", icon: HelpCircle },
  ] as const;

  const getActiveTopicDetail = () => {
    return topics.find((t) => t.id === activeTopic);
  };

  // Code Block Snippets (Using literal system contracts & clean placeholders)
  const codeInstall = `# Install using pnpm (Recommended)
pnpm add @phylax/sdk viem

# Install using npm
npm install @phylax/sdk viem

# Install using yarn
yarn add @phylax/sdk viem`;

  const codeEnv = `# 1. Guarded Smart Account created through the Owner Dashboard
PHYLAX_SMART_ACCOUNT_ADDRESS="<YOUR_PHYLAX_SMART_ACCOUNT_ADDRESS>"

# 2. Secure AI session private key (Generated dynamically in dashboard)
PHYLAX_AI_SESSION_PRIVATE_KEY="<YOUR_PHYLAX_AI_SESSION_PRIVATE_KEY>"

# 3. Arbitrum Sepolia RPC Endpoint (System public node)
ARBITRUM_SEPOLIA_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"

# 4. Target USDC Billing Token Address on Arbitrum Sepolia
USDC_ADDRESS="0x95074947def59a6860486437B62E1795cC105fDa"

# 5. Secure LLM api key (Can be Gemini, OpenAI, Claude, etc.)
AI_API_KEY="<YOUR_AI_API_KEY>"`;

  const codeRuntime = `import { createArbitrumSepoliaRuntimeClient } from "@phylax/sdk";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";

// Initialize the live runtime environment for Arbitrum Sepolia
const runtime = await createArbitrumSepoliaRuntimeClient({
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  smartAccountAddress: process.env.PHYLAX_SMART_ACCOUNT_ADDRESS! as \`0x\${string}\`,
  sessionPrivateKey: process.env.PHYLAX_AI_SESSION_PRIVATE_KEY! as \`0x\${string}\`,
  billingTokenAddress: "0x95074947def59a6860486437B62E1795cC105fDa", // System USDC
});

// 1. Prepare target ERC-20 transfer calldata (USDC Target Contract)
const amount = parseUnits("15.00", 6); // 15.00 USDC
const transferCalldata = encodeFunctionData({
  abi: erc20Abi,
  functionName: "transfer",
  args: ["<RECIPIENT_WALLET_ADDRESS>", amount],
});

// 2. Submit execution gaslessly via centralized paymaster
const { userOperationHash } = await runtime.sendGuardedExecution({
  target: "0x95074947def59a6860486437B62E1795cC105fDa",
  value: 0n,
  data: transferCalldata,
  spendAmount: amount, // tracked by guardrails
  action: "USDC Allocation",
  context: "Rebalancing yields to strategy vault.",
});

console.log(\`UserOperation submitted: \${userOperationHash}\`);

// 3. Wait for on-chain receipt confirmation
const receipt = await runtime.waitForUserOperationReceipt(userOperationHash);
console.log(\`Confirmed on-chain in transaction: \${receipt.receipt.transactionHash}\`);`;

  const codeOwnerWrite = `import { provisionGuardedAccount, topUpGasTank } from "@phylax/sdk";
import { parseUnits } from "viem";

const sdkConfig = {
  chain: arbitrumSepolia,
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  addresses: {
    factory: "0x4d76A69109f8700eF5A2c1aE4eA9fcF8Add62599",
    paymaster: "0xf3207d9556aa8ED9E4ddf610BfCeFE7EA4d88932",
    billingToken: "0x95074947def59a6860486437B62E1795cC105fDa",
    entryPoint: "0x0000000071727de22e5e9d8baf0edac6f37da032"
  }
};

// 1. Deploy a new smart account with initial rules
const provisionResult = await provisionGuardedAccount(
  publicClient,
  walletClient,
  sdkConfig,
  {
    owner: "<OWNER_EOA_ADDRESS>",
    agentName: "Yield Agent Alpha",
    sessionSigner: "<SESSION_PUBLIC_KEY>",
    sessionExpiry: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    spendWindowDuration: 24 * 60 * 60, // 24 hours rolling limit
    maxDailyLimit: parseUnits("100", 6), // 100 USDC daily cap
    whitelist: [
      { name: "Uniswap V3 Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", type: "contract" },
      { name: "Backup Multi-sig Vault", address: "<BACKUP_VAULT_ADDRESS>", type: "wallet" }
    ]
  }
);
console.log("Account Deployed. Transaction Hash:", provisionResult.hash);

// 2. Fund the Centralized Gas Tank in USDC (auto-approves Paymaster)
const topUpResult = await topUpGasTank(
  publicClient,
  walletClient,
  sdkConfig,
  parseUnits("25", 6) // Top up 25 USDC worth of gas sponsor tank
);
console.log("Gas Tank Funded. Approval Tx:", topUpResult.approvalHash, "TopUp Tx:", topUpResult.topUpHash);`;

  const codeOwnerRead = `import { readGuardedAccountState, readGasTankState } from "@phylax/sdk";

const sdkConfig = {
  chain: arbitrumSepolia,
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  addresses: {
    factory: "0x4d76A69109f8700eF5A2c1aE4eA9fcF8Add62599",
    paymaster: "0xf3207d9556aa8ED9E4ddf610BfCeFE7EA4d88932",
    billingToken: "0x95074947def59a6860486437B62E1795cC105fDa",
    entryPoint: "0x0000000071727de22e5e9d8baf0edac6f37da032"
  }
};

// 1. Fetch live metadata, limit trackers, and whitelist entries
const accountState = await readGuardedAccountState(
  publicClient,
  "<YOUR_PHYLAX_SMART_ACCOUNT_ADDRESS>"
);

console.log("Agent Name:", accountState.agentName);
console.log("Session Status:", accountState.status); // "active" | "expired" | "unconfigured"
console.log("Daily Spending Limit:", accountState.maxDailyLimit);
console.log("USDC Spent Today:", accountState.spentInWindow);
console.log("Whitelisted Destinations:", accountState.whitelist);

// 2. Fetch live gas tank sponsorship metrics
const gasTankState = await readGasTankState(
  publicClient,
  sdkConfig,
  "<OWNER_EOA_ADDRESS>"
);

console.log("Total Gas Balance:", gasTankState.gasTankBalance);
console.log("Available Balance (Unlocked):", gasTankState.availableGasTankBalance);
console.log("Active Sponsored Streams:", gasTankState.sponsoredStreamCount);`;

  const codeRecipeAI = `import { GoogleGenAI, Type } from "@google/genai";
import { createArbitrumSepoliaRuntimeClient } from "@phylax/sdk";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
const runtime = await createArbitrumSepoliaRuntimeClient({ ... });

// 1. AI analyzes text instructions to extract intent
const prompt = "Please transfer 15 USDC to wallet address <RECIPIENT_WALLET_ADDRESS>";

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    systemInstruction: "Extract the USDC amount and destination address. Return as JSON schema.",
    responseMimeType: "application/json",
    responseJsonSchema: {
      type: Type.OBJECT,
      properties: {
        to: { type: Type.STRING },
        amount: { type: Type.STRING },
        explanation: { type: Type.STRING }
      },
      required: ["to", "amount", "explanation"]
    }
  }
});

const intent = JSON.parse(response.text);
const amount = parseUnits(intent.amount, 6);

// 2. Execute on-chain transaction otonomously
const { userOperationHash } = await runtime.sendGuardedExecution({
  target: "0x95074947def59a6860486437B62E1795cC105fDa",
  value: 0n,
  data: encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [intent.to, amount]
  }),
  spendAmount: amount,
  action: "Otonom Transfer",
  context: intent.explanation
});`;

  const codeRecipeEmergency = `import { revokeSessionSigner } from "@phylax/sdk";

// If you detect suspicious activity on your AI agent host server,
// issue an immediate revocation call on-chain using your Owner Wallet.
const result = await revokeSessionSigner(
  publicClient,
  walletClient,
  "<YOUR_PHYLAX_SMART_ACCOUNT_ADDRESS>"
);

console.log("Session signer key successfully invalidated on-chain.");
console.log("Transaction Hash:", result.hash);`;

  const codeSolidity = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@account-abstraction/contracts/core/BaseAccount.sol";
import "./AI_GuardrailModule.sol";

contract ArbAgentAccount is BaseAccount {
    address public masterOwner;
    address public currentSessionKey;
    AI_GuardrailModule public guardrailModule;

    modifier onlyMasterOwner() {
        if (msg.sender != masterOwner) revert UnauthorizedCaller();
        _;
    }

    function setSessionSigner(address signer, uint48 expiry) external onlyMasterOwner {
        currentSessionKey = signer;
        guardrailModule.setSessionExpiry(expiry);
    }

    function _execute(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 spendAmount
    ) internal returns (bytes memory result) {
        // Guardrail checks are actively executed before any low-level call
        guardrailModule.checkTransaction(target, data, spendAmount);
        
        (bool success, bytes memory returnData) = target.call{value: value}(data);
        if (!success) revert ExecutionReverted();
        return returnData;
    }
}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 relative font-sans">
      {/* Decorative Neon Blur Glows */}
      <div className="absolute top-10 right-20 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/6 pb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.4em] text-cyan-400 font-mono font-semibold block mb-2">
            DEVELOPER DOCUMENTATION HUB
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
            PHYLAX SDK
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 animate-pulse">
              _
            </span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-450 max-w-3xl mt-4 leading-relaxed">
            Integrate policy-bounded smart accounts into your AI agent applications. Prevent prompt-injection exploits, automate gas sponsorships, and execute on-chain operations autonomously.
          </p>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center gap-2 px-5 py-3 border border-white/10 bg-[#0c0c0c] text-white text-xs font-mono font-bold uppercase transition hover:bg-zinc-900 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          Table of Contents
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Menu (Desktop) */}
        <div className={`md:col-span-3 space-y-6 ${mobileMenuOpen ? "block" : "hidden md:block"}`}>
          {/* Group topics by category */}
          {["Getting Started", "Core Concepts", "API Reference", "Guides & Recipes", "Security & Trust", "Troubleshooting"].map((category) => {
            const categoryTopics = topics.filter((t) => t.category === category);
            return (
              <div key={category} className="space-y-1">
                <span className="block text-xs uppercase tracking-widest text-[#555] px-4 py-1.5 font-mono font-bold">
                  {category}
                </span>
                <div className="space-y-[3px]">
                  {categoryTopics.map((topic) => {
                    const Icon = topic.icon;
                    const isActive = activeTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => {
                          setActiveTopic(topic.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-mono font-semibold transition-all border cursor-pointer flex items-center gap-2.5 ${
                          isActive
                            ? "bg-white/[0.03] text-cyan-400 border-white/10 border-l-2 border-l-cyan-400"
                            : "text-[#888] border-transparent hover:text-white hover:bg-white/[0.01]"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-[#555]"}`} />
                        <span className="truncate">{topic.label.substring(4)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="pt-6 border-t border-white/6 font-mono text-xs text-[#555] space-y-3 px-4">
            <div className="flex justify-between">
              <span>TARGET CHAIN:</span>
              <span className="text-zinc-400 font-bold">Arbitrum Sepolia</span>
            </div>
            <div className="flex justify-between">
              <span>AA FLOW:</span>
              <span className="text-zinc-400">ERC-4337 v0.7</span>
            </div>
            <div className="flex justify-between">
              <span>COMPILER:</span>
              <span className="text-zinc-400">Solidity 0.8.23</span>
            </div>
          </div>
        </div>

        {/* Right Content Display */}
        <div className="md:col-span-9 space-y-6 min-w-0">
          <div className="bg-[#050505] border border-white/6 p-6 sm:p-10 rounded-none relative overflow-hidden">
            {/* Header Gradient Stripe */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500"></div>

            <div className="flex items-center gap-4 mb-8">
              <span className="p-3 border border-white/10 bg-white/[0.02] text-cyan-400">
                {(() => {
                  const activeT = getActiveTopicDetail();
                  if (!activeT) return null;
                  const Icon = activeT.icon;
                  return <Icon className="w-6 h-6" />;
                })()}
              </span>
              <div>
                <span className="text-sm font-mono text-[#555] uppercase tracking-widest block">
                  {getActiveTopicDetail()?.category}
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">
                  {getActiveTopicDetail()?.label.substring(4)}
                </h3>
              </div>
            </div>

            {/* Content Switcher (All font sizes in main doc panel enlarged to text-base / text-lg) */}
            <div className="space-y-8">
              
              {/* INTRODUCTION */}
              {activeTopic === "intro" && (
                <div className="space-y-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
                  <p>
                    <strong className="text-white">Phylax SDK</strong> is a premium, developer-first on-chain security toolkit designed specifically for AI Agents operating on-chain in decentralized finance.
                  </p>
                  <p>
                    AI Agents are intrinsically susceptible to <strong className="text-white">prompt injection exploits</strong>, semantic bugs, and hallucination loops. Traditional private key delegation exposes the user's entire EOA wallet to malicious draining. Phylax bridges the gap between trustless automation and full-custody safety by intercepting transaction requests natively at the blockchain smart contract level.
                  </p>

                  <div className="pt-6 flex flex-wrap gap-4">
                    <button
                      onClick={() => setActiveTopic("why-phylax")}
                      className="inline-flex items-center gap-2.5 bg-white px-6 py-3.5 text-sm font-mono font-bold text-black hover:bg-zinc-200 transition cursor-pointer"
                    >
                      Why Phylax? <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTopic("install")}
                      className="inline-flex items-center gap-2.5 border border-white/10 bg-white/[0.02] px-6 py-3.5 text-sm font-mono font-bold text-white hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Getting Started Workflow <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* WHY PHYLAX? */}
              {activeTopic === "why-phylax" && (
                <div className="space-y-8 text-base sm:text-lg text-zinc-300 leading-relaxed">
                  <p>
                    Phylax addresses three critical bottlenecks that prevent autonomous AI integration in the Web3 space today:
                  </p>

                  {/* Problem & Solution Card Grid */}
                  <div className="space-y-6 pt-2">
                    <div className="border border-white/6 p-6 sm:p-8 bg-white/[0.01] grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-xs font-mono text-red-400 uppercase tracking-widest block mb-2 font-black">PROBLEM: THE EXTREME RISK</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-3">Exposing EOA Private Keys</h5>
                        <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case">
                          Placing a master EOA wallet private key inside an AI host server is an invite for catastrophic drainage. If the AI is compromised via prompt injection, there is zero protection.
                        </p>
                      </div>
                      <div className="border-t md:border-t-0 md:border-l border-white/6 pt-6 md:pt-0 md:pl-8">
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2 font-black">PHYLAX SOLUTION: THE SHIELD</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-3">On-Chain Programmable Guardrails</h5>
                        <p className="text-sm sm:text-base text-zinc-455 leading-relaxed font-sans normal-case">
                          Phylax shifts the authority envelope to the blockchain. All transaction constraints (spend cap, token receivers, whitelisted dApps) are strictly evaluated by smart contracts in real-time.
                        </p>
                      </div>
                    </div>

                    <div className="border border-white/6 p-6 sm:p-8 bg-white/[0.01] grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-xs font-mono text-red-400 uppercase tracking-widest block mb-2 font-black">PROBLEM: THE UX FRICTION</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-3">Gas Balance Starvation</h5>
                        <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case">
                          AI bots must continuously hold raw gas tokens (ETH) to operate, adding overhead to Treasury teams who must constantly track and replenish multiple addresses.
                        </p>
                      </div>
                      <div className="border-t md:border-t-0 md:border-l border-white/6 pt-6 md:pt-0 md:pl-8">
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2 font-black">PHYLAX SOLUTION: THE SPONSOR</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-3">USDC Centralized Gas Tank</h5>
                        <p className="text-sm sm:text-base text-zinc-455 leading-relaxed font-sans normal-case">
                          Transactions are executed gaslessly from the AI's perspective. The Custom Paymaster settles gas costs by converting the network fee to USDC and debiting the owner's central pool.
                        </p>
                      </div>
                    </div>

                    <div className="border border-white/6 p-6 sm:p-8 bg-white/[0.01] grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-xs font-mono text-red-400 uppercase tracking-widest block mb-2 font-black">PROBLEM: CONCURRENCY ERROR</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-3">Nonce Sync Conflicts</h5>
                        <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case">
                          AI agents operate asynchronously. Traditional EOA execution causes severe nonce collision bugs and failed transactions when bot threads execute simultaneously.
                        </p>
                      </div>
                      <div className="border-t md:border-t-0 md:border-l border-white/6 pt-6 md:pt-0 md:pl-8">
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2 font-black">PHYLAX SOLUTION: AA FLOW</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-3">ERC-4337 Account Abstraction</h5>
                        <p className="text-sm sm:text-base text-zinc-455 leading-relaxed font-sans normal-case">
                          By routing decisions through standard ERC-4337 UserOperations and bundler queues, Phylax handles async multi-threading flawlessly without raw nonce collision issues.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={() => setActiveTopic("install")}
                      className="inline-flex items-center gap-2.5 bg-white px-5 py-3 text-sm font-mono font-bold text-black hover:bg-zinc-200 transition cursor-pointer"
                    >
                      View Getting Started Workflow <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* GETTING STARTED WORKFLOW (Stacked Layout & Large Text Sizes) */}
              {activeTopic === "install" && (
                <div className="space-y-8 text-base sm:text-lg text-zinc-300 leading-relaxed">
                  <p>
                    Integrating Phylax involves two main roles: the **Master Owner (User)** setting up policies via the dashboard, and the **AI Developer** integrating the autonomous runtime via the SDK.
                  </p>

                  <div className="space-y-10 pt-2 font-mono text-xs">
                    
                    {/* Phase 1: Owner Setup (Stacked) */}
                    <div className="space-y-6 border border-white/6 p-6 sm:p-8 bg-[#080808]/50 relative">
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-sm">
                        <User className="w-4 h-4" /> Phase 1: Owner Dashboard Setup
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
                          Owner Dashboard Flow
                        </h4>
                        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl font-sans normal-case leading-relaxed">
                          The Master Owner configures AI spend restrictions, allowlists target DeFi contracts, and deposits gas tank funds directly from the web interface.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 sm:p-6 bg-black border border-white/6 rounded flex flex-col justify-between">
                          <div>
                            <span className="text-cyan-400 font-bold block mb-2 text-sm sm:text-base">01. AUTHENTICATE WALLET</span>
                            <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case">
                              Connect your EOA wallet (MetaMask/RainbowKit) to the dashboard on Arbitrum Sepolia.
                            </p>
                          </div>
                          <div className="pt-4">
                            <Link
                              href="/dashboard"
                              className="inline-flex items-center gap-1.5 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-black hover:bg-zinc-200 transition cursor-pointer"
                            >
                              Go to Dashboard <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                        
                        <div className="p-5 sm:p-6 bg-black border border-white/6 rounded flex flex-col justify-between">
                          <div>
                            <span className="text-cyan-400 font-bold block mb-2 text-sm sm:text-base">02. FUND THE GAS TANK</span>
                            <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case">
                              Claim testnet USDC using the faucet tab, then deposit USDC to fund your Centralized Gas Tank and sponsor transactions.
                            </p>
                          </div>
                          <div className="pt-4">
                            <Link
                              href="/dashboard"
                              className="inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.02] px-4 py-3 text-xs sm:text-sm font-bold text-white hover:bg-zinc-900 transition cursor-pointer"
                            >
                              Go to Gas Tank <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>

                        <div className="p-5 sm:p-6 bg-black border border-white/6 rounded">
                          <span className="text-cyan-400 font-bold block mb-2 text-sm sm:text-base">03. PROVISION SMART ACCOUNT</span>
                          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans normal-case mb-4">
                            Configure your custom guardrail envelopes before deploying the smart account on-chain:
                          </p>
                          <ul className="list-disc pl-5 text-xs sm:text-sm text-zinc-500 space-y-2 font-sans normal-case leading-relaxed">
                            <li><strong className="text-white">USDC Daily Cap</strong>: The maximum cumulative USDC value allowed in a single rolling window.</li>
                            <li><strong className="text-white">Session Duration</strong>: The absolute validity bounds for the ephemeral keys (denominated in days/weeks/months).</li>
                            <li><strong className="text-white">Target Whitelist</strong>: Verified external smart contract addresses (e.g. Uniswap Router) the AI may invoke.</li>
                            <li><strong className="text-white">Recipient Whitelist</strong>: Whitelisted EOA/wallet addresses permitted to receive ERC-20 token transfers.</li>
                          </ul>
                        </div>

                        <div className="p-5 sm:p-6 bg-black border border-white/6 rounded flex flex-col justify-between">
                          <div>
                            <span className="text-cyan-400 font-bold block mb-2 text-sm sm:text-base">04. SECURE THE SESSION KEY</span>
                            <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case">
                              The dashboard generates the key-pair, registers the public key on-chain, and reveals the private key once. Securely copy it for your AI host `.env`.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Phase 2: AI Developer Setup (Stacked) */}
                    <div className="space-y-6 border border-white/6 p-6 sm:p-8 bg-[#080808]/50 relative">
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-1.5 text-purple-400 font-bold uppercase tracking-wider text-sm">
                        <Cpu className="w-4 h-4" /> Phase 2: AI Developer SDK Setup
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
                          AI Developer Flow
                        </h4>
                        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl font-sans normal-case leading-relaxed">
                          Integrate the SDK directly into your trading engine or AI agent host backend using the credentials supplied by the owner.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 sm:p-6 bg-black border border-white/6 rounded flex flex-col justify-between">
                          <div>
                            <span className="text-purple-400 font-bold block mb-3 text-sm sm:text-base">01. LIBRARY INSTALLATION</span>
                            <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case mb-4">
                              Add the Phylax SDK package and the core Viem library to your Node.js or TypeScript host repository.
                            </p>
                          </div>
                          <div className="bg-black/50 border border-white/10 p-4 rounded text-sm text-zinc-400 overflow-x-auto">
                            pnpm add @phylax/sdk viem
                          </div>
                        </div>
                        
                        <div className="p-5 sm:p-6 bg-black border border-white/6 rounded flex flex-col justify-between">
                          <div>
                            <span className="text-purple-400 font-bold block mb-3 text-sm sm:text-base">02. COMPILE ENV CREDENTIALS</span>
                            <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case mb-4">
                              Create a local configuration with the Owner's Smart Account address and the secure Session Private Key.
                            </p>
                          </div>
                          <div>
                            <button
                              onClick={() => setActiveTopic("env")}
                              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-fuchsia-400 hover:text-white cursor-pointer font-bold"
                            >
                              View Env Variables Setup <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-5 sm:p-6 bg-black border border-white/6 rounded flex flex-col justify-between">
                          <div>
                            <span className="text-purple-400 font-bold block mb-2 text-sm sm:text-base">03. CLIENT INITIALIZATION</span>
                            <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case mb-4">
                              Initialize the autonomous runtime client on your host using the env settings.
                            </p>
                          </div>
                          <div>
                            <button
                              onClick={() => setActiveTopic("api-runtime")}
                              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-cyan-400 hover:text-white cursor-pointer font-bold"
                            >
                              View SDK API Reference <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-5 sm:p-6 bg-black border border-white/6 rounded flex flex-col justify-between">
                          <div>
                            <span className="text-purple-400 font-bold block mb-2 text-sm sm:text-base">04. SUBMIT TRANSACTION INTENTS</span>
                            <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case">
                              Submit guarded calls gaslessly via the centralized paymaster, actively protected by the Solidity guardrail engine.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ENV CONFIGURATION */}
              {activeTopic === "env" && (
                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                    To start integrating the SDK on your AI host backend, add these settings to your local configuration parameters or <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> file. Note that system variables like RPC nodes and ERC-20 contract addresses are populated using our active project parameters on Arbitrum Sepolia.
                  </p>

                  <div className="relative bg-black border border-white/6 p-6 font-mono text-sm overflow-x-auto text-zinc-300 rounded">
                    <div className="absolute right-3 top-3">
                      <button
                        onClick={() => handleCopy(codeEnv, "env")}
                        className="p-1.5 border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white rounded transition text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        {copiedText === "env" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="leading-relaxed text-zinc-400">{codeEnv}</pre>
                  </div>
                </div>
              )}

              {/* EPHEMERAL SESSION KEYS */}
              {activeTopic === "concept-keys" && (
                <div className="space-y-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
                  <p>
                    <strong className="text-white">Ephemeral Session Keys</strong> are independent, throwaway keys generated client-side inside the Phylax dashboard. They act as the primary operational keys delegated to the AI Agent.
                  </p>
                  
                  <div className="border-l-2 border-cyan-400/40 bg-cyan-950/5 p-6 space-y-3">
                    <h5 className="font-bold text-white font-mono text-base uppercase tracking-wide flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-cyan-400" /> Key Features
                    </h5>
                    <ul className="list-disc pl-5 text-sm sm:text-base text-zinc-500 space-y-2">
                      <li><strong className="text-zinc-400">Owner Isolation</strong>: The master owner's private key never leaves the owner's hardware wallet/browser EOA environment.</li>
                      <li><strong className="text-zinc-400">On-Chain Mapping</strong>: Kunci sesi dipetakan secara on-chain di kontrak <code className="text-xs font-mono text-cyan-400 bg-white/5 px-1">ArbAgentAccount</code> milik agen.</li>
                      <li><strong className="text-zinc-400">Temporal Expiry</strong>: Every session requires an absolute expiration timestamp (`sessionExpiry`). Once elapsed, the Smart Account rejects signatures automatically without active revoking.</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTopic("api-write")}
                      className="inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-cyan-400 hover:bg-zinc-900 transition cursor-pointer"
                    >
                      View `setSessionSigner` API Reference <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CENTRALIZED GAS TANK */}
              {activeTopic === "concept-gas" && (
                <div className="space-y-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
                  <p>
                    AI Agents are otonomous and trigger transactions asynchronously, which makes managing gas fees complicated. Phylax solves this by employing a <strong className="text-white">Centralized Gas Tank</strong> mechanism inside the custom <code className="text-xs font-mono text-cyan-400 bg-white/5 px-1">ArbAgentPaymaster</code>.
                  </p>

                  <div className="border-l-2 border-purple-400/40 bg-purple-950/5 p-6 space-y-3">
                    <h5 className="font-bold text-white font-mono text-base uppercase tracking-wide flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-purple-400" /> Gas abstraction workflow
                    </h5>
                    <ol className="list-decimal pl-5 text-sm sm:text-base text-zinc-500 space-y-2">
                      <li><strong className="text-zinc-400">Owner Top-Up</strong>: Owner menyetorkan saldo USDC ke kontrak Paymaster, mencatat saldo di <code className="text-xs font-mono text-purple-400 bg-white/5 px-1">gasTankBalance[owner]</code>.</li>
                      <li><strong className="text-zinc-400">Gas Lock</strong>: During the validation step of a UserOperation, the paymaster estimates the maximum gas costs (`maxCost`) and locks it in the reservation mapping to prevent withdrawals or double-spend racing.</li>
                      <li><strong className="text-zinc-400">Post-Execution Settlement</strong>: Setelah transaksi sukses dieksekusi on-chain, paymaster menerima laporan pengeluaran gas aktual dari EntryPoint. Paymaster mengonversi gas fee ETH riil ke USDC dan mendebet langsung dari tangki gas owner, serta membuka kunci sisa dana reservasi.</li>
                    </ol>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTopic("api-write")}
                      className="inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-cyan-400 hover:bg-zinc-900 transition cursor-pointer"
                    >
                      View `topUpGasTank` API Reference <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* GUARDRAIL INTERCEPTION */}
              {activeTopic === "concept-guardrail" && (
                <div className="space-y-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
                  <p>
                    The <strong className="text-white">AI_GuardrailModule</strong> is an immutable smart contract deployed alongside the agent's smart account. It intercepts every execution call at the blockchain runtime layer.
                  </p>

                  <div className="border-l-2 border-fuchsia-400/40 bg-fuchsia-950/5 p-6 space-y-3">
                    <h5 className="font-bold text-white font-mono text-base uppercase tracking-wide flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-fuchsia-400" /> On-chain policy rules
                    </h5>
                    <ul className="list-disc pl-5 text-sm sm:text-base text-zinc-500 space-y-2">
                      <li><strong className="text-zinc-400">Target Whitelists</strong>: The agent smart account can only execute external call targets (DEX router, lending pool) explicitly permitted in the `targetWhitelist`.</li>
                      <li><strong className="text-zinc-400">Recipient Whitelists</strong>: Modul mengekstrak calldata dari selektor ERC-20 transfer. Jika transfer dipicu, modul menguji apakah penerima terdaftar di `recipientWhitelist`, mencegah pengurasan dana ke alamat penyerang.</li>
                      <li><strong className="text-zinc-400">Daily Accumulating Cap</strong>: Tracks spend velocity. The accumulated value `spentToday` must never exceed the `maxDailyLimit`. If it does, the EVM rolls back the entire state immediately.</li>
                    </ul>
                  </div>

                  <div className="relative bg-black border border-white/6 p-6 font-mono text-sm overflow-x-auto text-zinc-300 rounded mt-4">
                    <span className="block text-xs font-mono text-[#555] uppercase tracking-wider mb-2">ArbAgentAccount.sol Interception Outline</span>
                    <pre className="leading-relaxed text-[#666]">{codeSolidity}</pre>
                  </div>
                </div>
              )}

              {/* ARCHITECTURE & FLOW */}
              {activeTopic === "arch-flow" && (
                <div className="space-y-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
                  <p>
                    Phylax abstracts ERC-4337 Account Abstraction and policy enforcement into a unified flow. This sequence illustrates how an AI Agent's intent translates safely into an on-chain transaction:
                  </p>

                  <div className="space-y-4 pt-4">
                    {/* Step 1 */}
                    <div className="border border-white/6 p-5 sm:p-6 bg-white/[0.01] flex gap-4 items-start relative">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <span className="text-xs font-mono text-[#555] uppercase tracking-widest block mb-1">AI AGENT LAYER (OFF-CHAIN)</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-2">Intent Extraction & Signature</h5>
                        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans normal-case">
                          The AI Agent parses user instructions (e.g., "Yield strategy allocation"). It signs the corresponding calldata parameters using its <strong className="text-cyan-400">Session Private Key</strong> (never the Master EOA key).
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center my-1 text-[#444] font-mono text-xs">▼ SDK BUNDLING & GAS PREPARATION</div>

                    {/* Step 2 */}
                    <div className="border border-white/6 p-5 sm:p-6 bg-white/[0.01] flex gap-4 items-start relative">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-400 text-purple-400 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <span className="text-xs font-mono text-[#555] uppercase tracking-widest block mb-1">PHYLAX RUNTIME SDK (OFF-CHAIN)</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-2">UserOperation Creation & Dispatch</h5>
                        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans normal-case">
                          The SDK wraps the signature and calldata into a standard <strong className="text-purple-400">ERC-4337 UserOperation</strong>. It transmits the package to the <strong className="text-white">Bundler RPC</strong> on Arbitrum Sepolia.
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center my-1 text-[#444] font-mono text-xs">▼ VALIDATION & SPONSORSHIP CHECK</div>

                    {/* Step 3 */}
                    <div className="border border-white/6 p-5 sm:p-6 bg-white/[0.01] flex gap-4 items-start relative">
                      <div className="w-8 h-8 rounded-full bg-fuchsia-500/10 border border-fuchsia-400 text-fuchsia-400 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <span className="text-xs font-mono text-[#555] uppercase tracking-widest block mb-1">PAYMASTER ENGINE (ON-CHAIN)</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-2">USDC Gas Sponsorship Validation</h5>
                        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans normal-case">
                          The <strong className="text-fuchsia-400">ArbAgentPaymaster</strong> contract estimates maximum gas costs, checks that the Master Owner's Central Gas Tank has sufficient USDC reserve, locks the gas funds, and approves the transaction for gasless routing.
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center my-1 text-[#444] font-mono text-xs">▼ POLICY CHECK & INTERCEPTION</div>

                    {/* Step 4 */}
                    <div className="border border-white/6 p-5 sm:p-6 bg-white/[0.01] flex gap-4 items-start relative">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        <span className="text-xs font-mono text-[#555] uppercase tracking-widest block mb-1">SMART ACCOUNT & GUARDRAILS (ON-CHAIN)</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-2">Solidity Guardrail Interception</h5>
                        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans normal-case">
                          Before executing the calldata, <strong className="text-white">AI_GuardrailModule</strong> performs three strict EVM assertions:
                        </p>
                        <ul className="list-disc pl-5 text-sm text-zinc-500 mt-2 space-y-1 font-sans">
                          <li>Is the target contract/method whitelisted?</li>
                          <li>If ERC-20 transfer, is the recipient EOA whitelisted?</li>
                          <li>Will this cumulative spend exceed the roll-over daily cap?</li>
                        </ul>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center my-1 text-[#444] font-mono text-xs">▼ SETTLEMENT & BILLING</div>

                    {/* Step 5 */}
                    <div className="border border-white/6 p-5 sm:p-6 bg-white/[0.01] flex gap-4 items-start relative">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-400 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                        5
                      </div>
                      <div>
                        <span className="text-xs font-mono text-[#555] uppercase tracking-widest block mb-1">EVM EXECUTION & SETTLEMENT</span>
                        <h5 className="font-bold text-white text-base sm:text-lg mb-2">Safe Execution & Gas Billing</h5>
                        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans normal-case">
                          If all assertions pass, the target is called successfully. The Paymaster calculates actual gas spent, converts it to USDC, debits the Central Gas Tank, and unlocks the leftover USDC reserve.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI SDK REFERENCE */}
              {activeTopic === "api-runtime" && (
                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                    The AI Agent relies on the <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">PhylaxRuntimeClient</code> to bundle call intents, fetch gas prices from bundlers, sign payloads with the session key, and submit executions. System addresses like USDC token contract and RPC variables use active project endpoints.
                  </p>

                  <div className="relative bg-black border border-white/6 p-6 font-mono text-sm overflow-x-auto text-zinc-350 rounded">
                    <div className="absolute right-3 top-3">
                      <button
                        onClick={() => handleCopy(codeRuntime, "runtime")}
                        className="p-1.5 border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white rounded transition text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        {copiedText === "runtime" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="leading-relaxed text-zinc-400">{codeRuntime}</pre>
                  </div>
                </div>
              )}

              {/* OWNER WRITE ACTIONS */}
              {activeTopic === "api-write" && (
                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                    Owner Write Actions allow owner wallets (via EOA/Wagmi) to deploy accounts, set up session rules, rotatate signers, adjust daily limits, and fund gas tanks.
                  </p>

                  <div className="relative bg-black border border-white/6 p-6 font-mono text-sm overflow-x-auto text-zinc-300 rounded">
                    <div className="absolute right-3 top-3">
                      <button
                        onClick={() => handleCopy(codeOwnerWrite, "ownerwrite")}
                        className="p-1.5 border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white rounded transition text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-purple-400" />
                        {copiedText === "ownerwrite" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="leading-relaxed text-zinc-400">{codeOwnerWrite}</pre>
                  </div>
                </div>
              )}

              {/* OWNER READ ACTIONS */}
              {activeTopic === "api-read" && (
                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                    Owner Read Actions use multicall aggregates to efficiently fetch policy values, spend status, whitelists, and paymaster gas tank records from the blockchain.
                  </p>

                  <div className="relative bg-black border border-white/6 p-6 font-mono text-sm overflow-x-auto text-zinc-300 rounded">
                    <div className="absolute right-3 top-3">
                      <button
                        onClick={() => handleCopy(codeOwnerRead, "ownerread")}
                        className="p-1.5 border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white rounded transition text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-fuchsia-400" />
                        {copiedText === "ownerread" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="leading-relaxed text-zinc-400">{codeOwnerRead}</pre>
                  </div>
                </div>
              )}

              {/* AI TOOL-CALLING INTEGRATION */}
              {activeTopic === "recipe-ai" && (
                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                    This recipe demonstrates how to combine LLM structured output parsing (to extract intent) with the Phylax SDK (to execute on-chain otonomously). The LLM API key uses a generic placeholder.
                  </p>

                  <div className="relative bg-black border border-white/6 p-6 font-mono text-sm overflow-x-auto text-zinc-300 rounded">
                    <div className="absolute right-3 top-3">
                      <button
                        onClick={() => handleCopy(codeRecipeAI, "recipeai")}
                        className="p-1.5 border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white rounded transition text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        {copiedText === "recipeai" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="leading-relaxed text-zinc-450">{codeRecipeAI}</pre>
                  </div>
                </div>
              )}

              {/* EMERGENCY CIRCUIRT BREAKER */}
              {activeTopic === "recipe-emergency" && (
                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                    If you detect an off-chain server breach on your AI host, instantly invalidate the session signer on-chain using your Owner Wallet.
                  </p>

                  <div className="relative bg-black border border-white/6 p-6 font-mono text-sm overflow-x-auto text-zinc-300 rounded">
                    <div className="absolute right-3 top-3">
                      <button
                        onClick={() => handleCopy(codeRecipeEmergency, "recipeemerg")}
                        className="p-1.5 border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white rounded transition text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-purple-400" />
                        {copiedText === "recipeemerg" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="leading-relaxed text-zinc-400">{codeRecipeEmergency}</pre>
                  </div>
                </div>
              )}

              {/* AUDIT & SECURITY */}
              {activeTopic === "security" && (
                <div className="space-y-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
                  <p>
                    Phylax is built with a security-first design principle. Moving the trust envelope from the host server to the blockchain guarantees that the AI Agent can only perform actions that the Master Owner explicitly allowed.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Key Guarantees */}
                    <div className="border border-white/6 p-6 sm:p-8 bg-white/[0.01] space-y-4">
                      <h5 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-cyan-400" />
                        Security Guarantees
                      </h5>
                      <div className="space-y-3 font-sans text-sm sm:text-base text-zinc-400">
                        <p>
                          <strong className="text-white">EOA Master Key Isolation</strong>: The Master Owner's primary EOA private key never leaves the owner's local wallet environment. It is never transmitted to the SDK or stored on the AI server.
                        </p>
                        <p>
                          <strong className="text-white">Session Key Contained Access</strong>: If the AI server is completely compromised via prompt injection or direct OS breach, the attacker cannot steal the funds in the smart account or EOA. They can only execute transactions that strictly comply with the whitelist and daily spend limit.
                        </p>
                        <p>
                          <strong className="text-white">Immutability of Rules</strong>: The session limits, whitelists, and session key mappings are stored directly in EVM storage. The AI Agent does not have write access to these configuration variables.
                        </p>
                      </div>
                    </div>

                    {/* Threat Model */}
                    <div className="border border-white/6 p-6 sm:p-8 bg-white/[0.01] space-y-4">
                      <h5 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-purple-400" />
                        Threat Vector Mitigation
                      </h5>
                      <div className="space-y-3 font-sans text-sm sm:text-base text-zinc-450">
                        <p>
                          <strong className="text-white">Threat: Host Server Hack</strong><br />
                          An attacker hacks the AI host backend, extracts the active session private key, and tries to drain all funds.
                        </p>
                        <p className="text-xs text-cyan-400 font-mono">
                          🛡️ Mitigation: The smart account immediately rejects any calls to non-whitelisted addresses or transfers exceeding the daily cap. The Master Owner instantly executes `revokeSessionSigner` to terminate session access.
                        </p>
                        <hr className="border-white/5 my-2" />
                        <p>
                          <strong className="text-white">Threat: AI Prompt Injection</strong><br />
                          A malicious prompt forces the LLM to generate calldata transferring funds to an attacker's wallet.
                        </p>
                        <p className="text-xs text-cyan-400 font-mono">
                          🛡️ Mitigation: The `AI_GuardrailModule` detects that the attacker's wallet is not on the `recipientWhitelist` and reverts the transaction during on-chain validation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ERRORS & TROUBLESHOOTING */}
              {activeTopic === "errors" && (
                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                    Phylax smart contracts revert transactions with explicit solidity errors when a policy is violated. Catching these errors helps AI agents report security issues.
                  </p>

                  <div className="border border-white/6 overflow-hidden">
                    <div className="overflow-x-auto font-sans">
                      <table className="w-full text-left border-collapse text-sm sm:text-base">
                        <thead>
                          <tr className="bg-white/[0.02] border-b border-white/6 text-zinc-400 uppercase tracking-wider font-mono font-bold">
                            <th className="p-4">On-Chain Error Signature</th>
                            <th className="p-4">Trigger Cause</th>
                            <th className="p-4">Corrective Resolution</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/6 text-zinc-400 font-sans">
                          <tr>
                            <td className="p-4 font-semibold text-white font-mono text-xs sm:text-sm">SessionExpired(expiry, current)</td>
                            <td className="p-4">AI session key's timestamp is less than the block timestamp.</td>
                            <td className="p-4 text-cyan-400 font-mono text-xs sm:text-sm">Issue a new session key and renew rules from Owner Dashboard.</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-semibold text-white font-mono text-xs sm:text-sm">TargetNotWhitelisted(target)</td>
                            <td className="p-4">The destination contract address is not in the whitelist mappings.</td>
                            <td className="p-4 text-purple-400 font-mono text-xs sm:text-sm">Add the target contract address to the allowed list in settings.</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-semibold text-white font-mono text-xs sm:text-sm">RecipientNotWhitelisted(recipient)</td>
                            <td className="p-4">ERC-20 transfer receiver EOA/wallet address is not whitelisted.</td>
                            <td className="p-4 text-fuchsia-400 font-mono text-xs sm:text-sm">Register the payout EOA address in the allowed wallet recipients list.</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-semibold text-white font-mono text-xs sm:text-sm">SpendLimitExceeded(attempted, limit)</td>
                            <td className="p-4">The transaction spend volume pushes `spentToday` past `maxDailyLimit`.</td>
                            <td className="p-4 text-zinc-300 font-mono text-xs sm:text-sm">Wait for the rolling spend window duration to reset or increase daily cap.</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-semibold text-white font-mono text-xs sm:text-sm">AA33 / Paymaster balance low</td>
                            <td className="p-4">The centralized gas tank has insufficient USDC to cover validation prefunds.</td>
                            <td className="p-4 text-amber-400 font-mono text-xs sm:text-sm">Top up the Owner's Gas Tank inside the paymaster portal.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMON FAQ */}
              {activeTopic === "faq" && (
                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-zinc-350 leading-relaxed mb-6">
                    Find answers to common questions about Phylax SDK, security guarantees, paymaster gas tank economics, and AI operations.
                  </p>

                  <div className="space-y-6 divide-y divide-white/6">
                    {/* Q1 */}
                    <div className="pt-4 first:pt-0 space-y-2">
                      <h5 className="font-bold text-white text-base sm:text-lg">
                        Can the AI agent modify its own whitelisted targets or daily budget?
                      </h5>
                      <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case">
                        <strong className="text-cyan-400">No.</strong> The AI Agent's active authorization is bound exclusively to its Session Key. The session key is flagged as a restricted caller in the smart account contract. Only the <strong className="text-white">Master Owner (EOA)</strong> has authorization to call configuration methods (such as `setSessionSigner`, `addToWhitelist`, or `setDailyLimit`).
                      </p>
                    </div>

                    {/* Q2 */}
                    <div className="pt-6 space-y-2">
                      <h5 className="font-bold text-white text-base sm:text-lg">
                        What happens if the AI agent's session key is leaked or stolen?
                      </h5>
                      <p className="text-sm sm:text-base text-zinc-450 leading-relaxed font-sans normal-case">
                        If the key is stolen, the attacker can only trigger calls that are whitelisted by the owner and within the daily USDC budget. They cannot drain the entire wallet. Additionally, the Master Owner can immediately revoke the compromised key on-chain by clicking <strong className="text-white">"Revoke Session Key"</strong> in the Owner Dashboard, which voids the key instantly.
                      </p>
                    </div>

                    {/* Q3 */}
                    <div className="pt-6 space-y-2">
                      <h5 className="font-bold text-white text-base sm:text-lg">
                        How does the Centralized Gas Tank calculate and convert USDC into gas?
                      </h5>
                      <p className="text-sm sm:text-base text-zinc-455 leading-relaxed font-sans normal-case">
                        The custom paymaster interceptor (`ArbAgentPaymaster`) calculates the on-chain execution cost (Gas × gasPrice) and converts this ETH value to USDC. The calculated USDC amount is then debited directly from the Owner's Gas Tank balance on-chain. This keeps transaction management gasless for the AI agent itself.
                      </p>
                    </div>

                    {/* Q4 */}
                    <div className="pt-6 space-y-2">
                      <h5 className="font-bold text-white text-base sm:text-lg">
                        Does the AI Agent need to hold raw Ether (ETH) in its smart account?
                      </h5>
                      <p className="text-sm sm:text-base text-zinc-455 leading-relaxed font-sans normal-case">
                        <strong className="text-cyan-400">No.</strong> Because all UserOperations are sponsored gaslessly by the custom paymaster, the smart account does not need to hold any raw gas tokens (ETH). It only holds the billing/trading tokens (like USDC) that it needs for its automated DeFi activities.
                      </p>
                    </div>

                    {/* Q5 */}
                    <div className="pt-6 space-y-2">
                      <h5 className="font-bold text-white text-base sm:text-lg">
                        What happens if the Arbitrum Sepolia RPC node or bundler network goes down?
                      </h5>
                      <p className="text-sm sm:text-base text-zinc-455 leading-relaxed font-sans normal-case">
                        Because ERC-4337 is highly modular, developers can change the RPC URL parameter in `createArbitrumSepoliaRuntimeClient` to point to any alternative reliable Arbitrum Sepolia node or bundler provider (such as Alchemy, QuickNode, or Infura) without modifying smart contracts.
                      </p>
                    </div>

                    {/* Q6 */}
                    <div className="pt-6 space-y-2">
                      <h5 className="font-bold text-white text-base sm:text-lg">
                        What happens when a daily limit is reached mid-transaction?
                      </h5>
                      <p className="text-sm sm:text-base text-zinc-455 leading-relaxed font-sans normal-case">
                        The transaction will revert during the execution phase on-chain. The solidity code throws a `SpendLimitExceeded` error, preventing the transfer. The agent's backend code will receive this revert error, allowing it to alert the host server or wait until the daily rolling window resets.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
