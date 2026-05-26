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

  const codeQuickstart = `import { PhylaxSDK, ArbAgentAccount } from "@phylax/sdk";
import { ethers } from "ethers";

// 1. Load your secure ephemeral session key
const sessionPrivateKey = "0xbf4d28f0de9ca2b8da46e8eb497fae017686901f...";
const agentAccountAddress = "0x82da69db2b0b80b7a3a54c06bdac94a69ddc7a9...";

// 2. Instantiate Phylax Client on Arbitrum Sepolia
const client = await PhylaxSDK.connect({
  sessionKey: sessionPrivateKey,
  account: agentAccountAddress,
  bundlerUrl: "https://api.pimlico.io/v2/arbitrum-sepolia/rpc",
  paymasterUrl: "https://api.pimlico.io/v2/arbitrum-sepolia/paymaster"
});

// 3. Initiate Gasless DeFi Swaps under on-chain guardrails protect
console.log("Submitting safe transaction...");
const txResult = await client.execute({
  target: "0xe592427a0aece92de3edee1f18e0157c05861564", // Uniswap V3 Router
  value: ethers.utils.parseUnits("15", 6), // 15 USDC
  data: "0x..." 
});

console.log(\`Transaction processed successfully: \${txResult.userOpHash}\`);`;

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
        
        // 🛡️ The Shield interceptor checks rules
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
          Integrate the ultimate on-chain shield inside your AI agents
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
            02. Smart Contracts (Solid)
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
                <span className="text-white">Arbitrum Sepolia Devnet</span>
              </div>
              <div>
                <span className="text-[#555] block">AA STANDARD:</span>
                <span className="text-white">ERC-4337 EntryPoint v0.6</span>
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
                  The <code className="text-cyan-400 bg-[#0d0d0d] px-1.5 py-0.5 rounded font-mono">@phylax/sdk</code> library is built on top of Viem and Permissionless.js. It wraps decisions decided by your agent's LLM core and transmits them safely to live bundler networks without exposing EOA main wallets.
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
                    <span className="text-cyan-400">import</span> {"{"} PhylaxSDK, ArbAgentAccount {"}"} <span className="text-cyan-400">from</span> <span className="text-orange-300">"@phylax/sdk"</span>;
                    <br />
                    <span className="text-cyan-400">import</span> {"{"} ethers {"}"} <span className="text-cyan-400">from</span> <span className="text-orange-300">"ethers"</span>;
                    <br />
                    <br />
                    <span className="text-[#555]">// 1. Load secure session configurations</span>
                    <br />
                    <span className="text-cyan-400">const</span> sessionPrivateKey = <span className="text-orange-300">"0xbf4d28f0de9ca2b8da46e8eb497fae017686901f..."</span>;
                    <br />
                    <span className="text-cyan-400">const</span> agentAccountAddress = <span className="text-orange-300">"0x82da69db2b0b8575a175b88c7d8b47997506..."</span>;
                    <br />
                    <br />
                    <span className="text-[#555]">// 2. Connect client and proxy gas fees via Paymaster</span>
                    <br />
                    <span className="text-cyan-400">const</span> client = <span className="text-cyan-400">await</span> PhylaxSDK.<span className="text-purple-400">connect</span>({"{"}
                    <br />
                    {"  "}sessionKey: sessionPrivateKey,
                    <br />
                    {"  "}account: agentAccountAddress,
                    <br />
                    {"  "}bundlerUrl: <span className="text-orange-300">"https://api.pimlico.io/v2/arbitrum-sepolia/rpc"</span>
                    <br />
                    {"}"});
                    <br />
                    <br />
                    <span className="text-[#555]">// 3. Dispatch safe transaction underguard policies</span>
                    <br />
                    <span className="text-cyan-400">const</span> txResult = <span className="text-cyan-400">await</span> client.<span className="text-purple-400">execute</span>({"{"}
                    <br />
                    {"  "}target: <span className="text-orange-300">"0xe592427a0aece92de3edee1f18e0157c05861564"</span>, <span className="text-[#555]">// Uniswap V3</span>
                    <br />
                    {"  "}value: ethers.utils.<span className="text-pink-400">parseUnits</span>(<span className="text-orange-300">"15"</span>, <span className="text-purple-300">6</span>),
                    <br />
                    {"  "}data: <span className="text-orange-300">"0x..."</span>
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
                  The on-chain controller is deployed on Arbitrum Sepolia. The contract relies on account-abstraction standard ERC-4337, routing all critical executions through validation interceptors.
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
                    {"        "}<span className="text-fuchsia-400">// 🛡️ The Shield interceptor prevents exploits!</span>
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
                  The core firewall module validates three critical parameters during every transaction intercept:
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
                    <strong>IMPORTANT SECURITY EXCLUSIVITY:</strong> The master EOA always retains immediate override permission. If the AI agent is frozen or misbehaves, the human owner can manually reset rules instantly.
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
