"use client";

import { Code2, BookOpen, FileCode, CheckCircle, Shield, Key, AlertTriangle, ArrowRight, Copy } from "lucide-react";
import { useState } from "react";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"quickstart" | "solidity" | "paymaster">("quickstart");
  const [copiedText, setCopiedText] = useState("");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const codeQuickstart = `import { PhylaxClient } from "@phylax/sdk";

// 1. Load owner-issued AI session credentials
const client = await PhylaxClient.fromEnv({
  smartAccountAddress: process.env.PHYLAX_SMART_ACCOUNT_ADDRESS!,
  sessionPrivateKey: process.env.PHYLAX_AI_SESSION_PRIVATE_KEY!,
  network: process.env.PHYLAX_NETWORK ?? "arbitrum-sepolia",
});

// 2. Build a guarded action
const txResult = await client.execute({
  kind: "swap",
  protocol: "uniswap-v3",
  tokenIn: "USDC",
  tokenOut: "ARB",
  amount: "15",
});

console.log("UserOperation submitted:", txResult.userOpHash);`;

  const codeSolidity = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@account-abstraction/contracts/core/BaseAccount.sol";
import "./AI_GuardrailModule.sol";

contract ArbAgentAccount is BaseAccount {
    address public masterOwner;
    address public currentSessionKey;
    AI_GuardrailModule public guardrail;

    modifier onlyMaster() {
        require(msg.sender == masterOwner, "Only Master Owner");
        _;
    }

    function setSessionKey(address _key, uint256 _expiry) external onlyMaster {
        currentSessionKey = _key;
        guardrail.setSessionExpiry(_expiry);
    }

    function execute(address target, uint256 value, bytes calldata data) external {
        // Enforce Guardrail policies before executing any external call
        require(msg.sender == address(entryPoint) || msg.sender == masterOwner, "Unauthorized");
        
        // Guardrail checks run before any external call
        guardrail.checkRules(target, value);
        
        (bool success, ) = target.call{value: value}(data);
        require(success, "Execution reverted");
    }
}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 relative">
      {/* Decorative Blur Glows */}
      <div className="absolute top-0 right-10 w-[200px] h-[200px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Title */}
      <div className="mb-12">
        <h2 className="text-5xl font-black tracking-tighter uppercase italic text-white flex items-center gap-1">
          DEVELOPER <br />
          DOCUMENTATION
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 animate-pulse">_</span>
        </h2>
        <p className="text-xs uppercase tracking-[0.3em] text-[#555] font-semibold mt-2">
          Integrate policy-bounded execution into your AI agents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Sidebar Menu */}
        <div className="md:col-span-3 space-y-2">
          <span className="block text-[10px] uppercase tracking-widest text-[#555] mb-4 font-mono">
            SDK ARCHITECTURE
          </span>
          <button
            onClick={() => setActiveTab("quickstart")}
            className={`w-full text-left px-4 py-3 text-xs font-mono font-bold uppercase transition-all tracking-wider border cursor-pointer border-r-0 ${
              activeTab === "quickstart"
                ? "bg-[#0F0F0F] text-cyan-400 border-slate-900 border-l-2 border-l-cyan-400"
                : "text-[#888] border-transparent hover:text-white"
            }`}
          >
            01. Quickstart SDK
          </button>
          
          <button
            onClick={() => setActiveTab("solidity")}
            className={`w-full text-left px-4 py-3 text-xs font-mono font-bold uppercase transition-all tracking-wider border cursor-pointer border-r-0 ${
              activeTab === "solidity"
                ? "bg-[#0F0F0F] text-purple-400 border-slate-900 border-l-2 border-l-purple-400"
                : "text-[#888] border-transparent hover:text-white"
            }`}
          >
            02. Smart Contracts
          </button>
          
          <button
            onClick={() => setActiveTab("paymaster")}
            className={`w-full text-left px-4 py-3 text-xs font-mono font-bold uppercase transition-all tracking-wider border cursor-pointer border-r-0 ${
              activeTab === "paymaster"
                ? "bg-[#0F0F0F] text-fuchsia-400 border-slate-900 border-l-2 border-l-fuchsia-400"
                : "text-[#888] border-transparent hover:text-white"
            }`}
          >
            03. Secure Guardrails
          </button>

          <div className="pt-8 block">
            <span className="block text-[10px] uppercase tracking-widest text-[#555] mb-2 font-mono">
              TARGET INFRASTRUCTURE
            </span>
            <div className="bg-[#0F0F0F] border border-slate-900 p-4 text-xs space-y-3 font-mono">
              <div>
                <span className="text-[#555] block">NETWORK ID:</span>
                <span className="text-white">Arbitrum Sepolia Testnet</span>
              </div>
              <div>
                <span className="text-[#555] block">AA STANDARD:</span>
                <span className="text-white">ERC-4337 EntryPoint v0.7</span>
              </div>
              <div>
                <span className="text-[#555] block">COMPILER:</span>
                <span className="text-white">Solidity ^0.8.20 + Foundry</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Code and Explain Area */}
        <div className="md:col-span-9 space-y-6">
          {activeTab === "quickstart" && (
            <div className="space-y-6">
              <div className="bg-[#080808] border border-slate-900 p-6 rounded-none relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500 to-transparent"></div>
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-black tracking-tight text-white uppercase italic">
                    TypeScript SDK Integration
                  </h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  The <code className="text-cyan-400 bg-[#0d0d0d] px-1.5 py-0.5 rounded font-mono">@phylax/sdk</code> library is intended to wrap ERC-4337 execution details behind a small agent-facing API. The example below reflects the target MVP integration shape, not a final published API contract.
                </p>

                {/* Code Window */}
                <div className="relative bg-black rounded-none border border-slate-900 p-4 font-mono text-xs overflow-x-auto text-gray-300">
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      onClick={() => handleCopy(codeQuickstart, "qs")}
                      className="p-1.5 bg-[#111] hover:bg-[#222] text-[#888] hover:text-white rounded border border-slate-900 transition-all cursor-pointer text-[11px] font-mono flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3 text-cyan-400" />
                      {copiedText === "qs" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="text-left text-[#888] leading-relaxed">
                    <span className="text-cyan-400">import</span> {"{"} PhylaxClient {"}"} <span className="text-cyan-400">from</span> <span className="text-orange-300">"@phylax/sdk"</span>;
                    <br />
                    <br />
                    <span className="text-[#555]">// 1. Load owner-issued AI session credentials</span>
                    <br />
                    <span className="text-cyan-400">const</span> client = <span className="text-cyan-400">await</span> PhylaxClient.<span className="text-purple-400">fromEnv</span>({"{"}
                    <br />
                    {"  "}smartAccountAddress: process.env.<span className="text-cyan-400">PHYLAX_SMART_ACCOUNT_ADDRESS</span>!,
                    <br />
                    {"  "}sessionPrivateKey: process.env.<span className="text-cyan-400">PHYLAX_AI_SESSION_PRIVATE_KEY</span>!,
                    <br />
                    {"  "}network: process.env.<span className="text-cyan-400">PHYLAX_NETWORK</span> ?? <span className="text-orange-300">"arbitrum-sepolia"</span>,
                    <br />
                    {"}"});
                    <br />
                    <br />
                    <span className="text-[#555]">// 2. Dispatch a guarded transaction intent</span>
                    <br />
                    <span className="text-cyan-400">const</span> txResult = <span className="text-cyan-400">await</span> client.<span className="text-purple-400">execute</span>({"{"}
                    <br />
                    {"  "}kind: <span className="text-orange-300">"swap"</span>,
                    <br />
                    {"  "}protocol: <span className="text-orange-300">"uniswap-v3"</span>,
                    <br />
                    {"  "}tokenIn: <span className="text-orange-300">"USDC"</span>,
                    <br />
                    {"  "}tokenOut: <span className="text-orange-300">"ARB"</span>,
                    <br />
                    {"  "}amount: <span className="text-orange-300">"15"</span>,
                    <br />
                    {"}"});
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "solidity" && (
            <div className="space-y-6">
              <div className="bg-[#080808] border border-slate-900 p-6 rounded-none relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 to-transparent"></div>
                <div className="flex items-center gap-2 mb-3">
                  <FileCode className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-black tracking-tight text-white uppercase italic">
                    ArbAgentAccount.sol (Smart Contract)
                  </h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  The on-chain controller is deployed on Arbitrum Sepolia. The smart account validates a delegated AI session signer and routes critical executions through guardrail checks before any external call is made.
                </p>

                {/* Code Window */}
                <div className="relative bg-black rounded-none border border-slate-900 p-4 font-mono text-xs overflow-x-auto text-gray-300">
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      onClick={() => handleCopy(codeSolidity, "sol")}
                      className="p-1.5 bg-[#111] hover:bg-[#222] text-[#888] hover:text-white rounded border border-slate-900 transition-all cursor-pointer text-[11px] font-mono flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3 text-purple-400" />
                      {copiedText === "sol" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="text-left leading-relaxed text-[#555]">
                    <span className="text-cyan-400">contract</span> <span className="text-white font-bold">ArbAgentAccount</span> <span className="text-cyan-400">is</span> BaseAccount {"{"}
                    <br />
                    {"    "}address <span className="text-cyan-400">public</span> masterOwner;
                    <br />
                    {"    "}AI_GuardrailModule <span className="text-cyan-400">public</span> guardrail;
                    <br />
                    <br />
                    {"    "}<span className="text-cyan-400">function</span> <span className="text-purple-400">setSessionKey</span>(address _key, uint256 _expiry) external {"{"}
                    <br />
                    {"        "}require(msg.sender == masterOwner, <span className="text-orange-300">"Only Master Owner"</span>);
                    <br />
                    {"        "}currentSessionKey = _key;
                    <br />
                    {"        "}guardrail.setSessionExpiry(_expiry);
                    <br />
                    {"    "}{"}"}
                    <br />
                    <br />
                    {"    "}<span className="text-cyan-400">function</span> <span className="text-purple-400">execute</span>(address target, uint256 value, bytes calldata data) external {"{"}
                    <br />
                    {"        "}<span className="text-fuchsia-400">// Guardrail checks run before any external call</span>
                    <br />
                    {"        "}guardrail.<span className="text-pink-300">checkRules</span>(target, value);
                    <br />
                    {"        "}(bool success, ) = target.call{"{"}value: value{"}"}(data);
                    <br />
                    {"        "}require(success, <span className="text-orange-300">"Execution reverted"</span>);
                    <br />
                    {"    "}{"}"}
                    <br />
                    {"}"}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "paymaster" && (
            <div className="space-y-6">
              <div className="bg-[#080808] border border-slate-900 p-6 rounded-none relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-fuchsia-500 to-transparent"></div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-fuchsia-400" />
                  <h3 className="text-lg font-black tracking-tight text-white uppercase italic">
                    On-Chain Programmable Interceptor
                  </h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  The guardrail module validates three critical parameters during every transaction intercept:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-black border border-slate-800">
                    <span className="text-cyan-400 font-mono text-xl font-bold block mb-1">01</span>
                    <strong className="text-white font-mono text-xs uppercase block mb-1">Temporal Session expiry</strong>
                    <p className="text-xs text-gray-500">
                      Transactions executed outside the session parameter window will be instantly reverted.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-black border border-slate-800">
                    <span className="text-purple-400 font-mono text-xl font-bold block mb-1">02</span>
                    <strong className="text-white font-mono text-xs uppercase block mb-1">Protocol whitelist mapping</strong>
                    <p className="text-xs text-gray-500">
                      Prevents prompt-injection routing assets to arbitrary EOAs, malicious addresses, or unwhitelisted addresses.
                    </p>
                  </div>

                  <div className="p-4 bg-black border border-slate-800">
                    <span className="text-fuchsia-400 font-mono text-xl font-bold block mb-1">03</span>
                    <strong className="text-white font-mono text-xs uppercase block mb-1">Daily Accumulator Limits</strong>
                    <p className="text-xs text-gray-500">
                      Restricts extreme capital drains. If any single txn volume violates limits, the smart contract intercepts and terminates.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-950/20 border-l-2 border-purple-500 text-xs text-purple-300 font-mono flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-purple-450" />
                  <div>
                    <strong>IMPORTANT MVP NOTE:</strong> Session keys are delegated by the owner and can be rotated or revoked without exposing the owner EOA private key to the AI environment.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

