import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(express.json());

// --- Simulated Smart Contract State ---
interface ContractRules {
  maxDailyLimit: number;
  spentToday: number;
  sessionExpiry: number; // timestamp
  whitelistedProtocols: { [address: string]: { name: string; isWhitelisted: boolean } };
}

let onchainRules: ContractRules = {
  maxDailyLimit: 50,
  spentToday: 0,
  sessionExpiry: Date.now() + 15 * 60 * 1000, // 15 mins from now
  whitelistedProtocols: {
    "0xe592427a0aece92de3edee1f18e0157c05861564": { name: "Uniswap V3 Router", isWhitelisted: true },
    "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506": { name: "Sushiswap Router", isWhitelisted: true },
    "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": { name: "Aave V3 Lending Pool", isWhitelisted: true },
  }
};

// Simulated dynamic logs on the server
interface TerminalLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  emitter: "AI Agent" | "Bundler ERC-4337" | "Paymaster" | "Guardrail Contract" | "State";
  message: string;
}

let simulatedLogs: TerminalLog[] = [
  {
    id: "genesis-1",
    timestamp: new Date().toISOString(),
    type: "info",
    emitter: "State",
    message: "Phylax Guardrail Contract deployed successfully on Arbitrum Sepolia."
  },
  {
    id: "genesis-2",
    timestamp: new Date().toISOString(),
    type: "success",
    emitter: "Guardrail Contract",
    message: "ArbAgentAccount Master Vault owner registered. Whitelist configured (Uniswap, Sushiswap, Aave)."
  }
];

// Lazy-loaded Gemini SDK setup
let googleGenAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!googleGenAI) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        googleGenAI = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Gemini SDK successfully initialized on the server.");
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI:", err);
      }
    }
  }
  return googleGenAI;
}

// REST API endpoints
app.get("/api/rules", (req, res) => {
  res.json(onchainRules);
});

app.post("/api/rules", (req, res) => {
  const { maxDailyLimit, whitelistedProtocols, sessionMinutes } = req.body;
  if (typeof maxDailyLimit === "number") {
    onchainRules.maxDailyLimit = maxDailyLimit;
  }
  if (whitelistedProtocols) {
    onchainRules.whitelistedProtocols = whitelistedProtocols;
  }
  if (typeof sessionMinutes === "number" && sessionMinutes > 0) {
    onchainRules.sessionExpiry = Date.now() + sessionMinutes * 60 * 1000;
  }

  const log: TerminalLog = {
    id: `rule-update-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: "warning",
    emitter: "Guardrail Contract",
    message: `On-chain configurations updated. New Daily Limit: ${onchainRules.maxDailyLimit} USDC. Whitelist refreshed.`
  };
  simulatedLogs.unshift(log);

  res.json({ success: true, rules: onchainRules });
});

app.post("/api/rules/reset-spent", (req, res) => {
  onchainRules.spentToday = 0;
  const log: TerminalLog = {
    id: `reset-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: "info",
    emitter: "State",
    message: "Manual reset of the accumulated daily spending counter executed on-chain."
  };
  simulatedLogs.unshift(log);
  res.json({ success: true, spentToday: 0 });
});

app.get("/api/logs", (req, res) => {
  res.json(simulatedLogs);
});

app.post("/api/logs/clear", (req, res) => {
  simulatedLogs = [
    {
      id: `clear-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "info",
      emitter: "State",
      message: "Terminal visual logs cleared."
    }
  ];
  res.json({ success: true });
});

// Primary Endpoint: Process user request to AI Agent, invoke Gemini, run Guardrails, and log results
app.post("/api/trigger-ai", async (req, res) => {
  const { prompt, sessionKey } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt instruction." });
  }

  const timestamp = new Date().toISOString();
  
  // 1. Log AI Agent picking up instruction
  const initialAgentLog: TerminalLog = {
    id: `agent-run-${Date.now()}-1`,
    timestamp: new Date().toISOString(),
    type: "info",
    emitter: "AI Agent",
    message: `Received natural language instruction: "${prompt}"`
  };
  simulatedLogs.unshift(initialAgentLog);

  let targetAddress = "";
  let valueInUsdc = 0;
  let protocolName = "";
  let explanation = "";
  let isGeminiUsed = false;

  const client = getGeminiClient();

  if (client) {
    try {
      console.log("Calling Gemini API with model gemini-3.5-flash for prompt parsing...");
      const systemInstruction = `You are a DeFi automator AI Agent with delegated control of ArbAgentAccount.
Parse the user's natural language instruction and convert it into a structured transaction target.
You must return a raw JSON object matching the requested schema. If the instruction is a security risk, hacker injection, or unauthorized transfer, translate it literally so the smart contract guardrails can be demoed catching it.

Whitelisted Protocols:
- Uniswap Router: 0xe59a2427a0aece92de3edee1f18e0157c05861564 (or 0xe592427a0aece92de3edee1f18e0157c05861564)
- Sushiswap Router: 0x1b02da8cb0d097eb8d57a175b88c7d8b47997506
- Aave V3 Lending Pool: 0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9

Rules:
1. If the user commands swapping or adding liquidity on Uniswap, output target: "0xe592427a0aece92de3edee1f18e0157c05861564", protocolName: "Uniswap"
2. If Sushi or Sushiswap, output target: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506", protocolName: "Sushiswap"
3. If Aave, output target: "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9", protocolName: "Aave V3"
4. If they give an unknown address or ask to send to a friend, hacker, bypass, or custom address (e.g. 0x999... or random EOA), yield target: "0x99999991234567890123456789012345678b" (or similar), protocolName: "Unknown / Hacker Wallet"
5. Parse the USDC or transaction value as an integer. If no value is specified, default to 10 USDC.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              target: { type: Type.STRING, description: "Hex contract or wallet address" },
              valueInUsdc: { type: Type.NUMBER, description: "USDC volume involved" },
              protocolName: { type: Type.STRING, description: "Parsed target name" },
              explanation: { type: Type.STRING, description: "Brief action summary" }
            },
            required: ["target", "valueInUsdc", "protocolName", "explanation"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        targetAddress = parsed.target.toLowerCase();
        valueInUsdc = parsed.valueInUsdc;
        protocolName = parsed.protocolName;
        explanation = parsed.explanation;
        isGeminiUsed = true;
      }
    } catch (apiError) {
      console.error("Gemini runtime API error, activating fallback parser:", apiError);
    }
  }

  // --- Fallback Parser (Deterministic regex matching) ---
  if (!isGeminiUsed) {
    const text = prompt.toLowerCase();
    valueInUsdc = 10; // default
    
    // Check for explicit numbers
    const matchNum = text.match(/(\d+)\s*(usdc|usd|eth|dollars)/i) || text.match(/\b(\d+)\b/);
    if (matchNum) {
      valueInUsdc = parseInt(matchNum[1], 10);
    }

    if (text.includes("hacker") || text.includes("steal") || text.includes("attack") || text.includes("0x999") || text.includes("malicious") || text.includes("transfer to") || text.includes("send to")) {
      targetAddress = "0x99999991234567890123456789012345678 Hacker".toLowerCase();
      protocolName = "Unauthorized Hacker Address";
      explanation = `Attempted to transfer ${valueInUsdc} USDC to unverified address.`;
    } else if (text.includes("sushi")) {
      targetAddress = "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506";
      protocolName = "Sushiswap";
      explanation = `Swapping ${valueInUsdc} USDC to WETH on Sushiswap.`;
    } else if (text.includes("aave") || text.includes("lend") || text.includes("deposit")) {
      targetAddress = "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9";
      protocolName = "Aave V3";
      explanation = `Lending ${valueInUsdc} USDC inside Aave V3 Liquidity Pool.`;
    } else {
      targetAddress = "0xe592427a0aece92de3edee1f18e0157c05861564";
      protocolName = "Uniswap V3";
      explanation = `Swapping ${valueInUsdc} USDC to ARB on Uniswap v3.`;
    }
  }

  // Ensure clean format
  const sanitizedTarget = targetAddress.split(" ")[0].toLowerCase();

  // 2. Log Decided action by AI Agent
  const parsedActionLog: TerminalLog = {
    id: `agent-run-${Date.now()}-2`,
    timestamp: new Date().toISOString(),
    type: "info",
    emitter: "AI Agent",
    message: `[Decision Engine] converted command. Action: ${explanation}. Target: ${sanitizedTarget}. Value: ${valueInUsdc} USDC.`
  };
  simulatedLogs.unshift(parsedActionLog);

  // 3. Bundler packaging log
  const bundlerLog: TerminalLog = {
    id: `agent-run-${Date.now()}-3`,
    timestamp: new Date().toISOString(),
    type: "info",
    emitter: "Bundler ERC-4337",
    message: `Packaging transaction into UserOperation. Signing with ephemeral Session Key (${sessionKey || "Default_AI_Session_0xf39... "}).`
  };
  simulatedLogs.unshift(bundlerLog);

  // 4. Paymaster Sponsorship Log
  const paymasterLog: TerminalLog = {
    id: `agent-run-${Date.now()}-4`,
    timestamp: new Date().toISOString(),
    type: "success",
    emitter: "Paymaster",
    message: `Sponsoring transaction gas fee. Standard ArbAgentPaymaster signature prepended. Gas Fee: 0.000042 ETH (Gasless for AI agent).`
  };
  simulatedLogs.unshift(paymasterLog);

  // 5. On-Chain Interceptor Validation (The Core Guardrail Rules!)
  const isExpired = Date.now() > onchainRules.sessionExpiry;
  const isWhitelisted = onchainRules.whitelistedProtocols[sanitizedTarget]?.isWhitelisted === true;
  const willExceedLimit = onchainRules.spentToday + valueInUsdc > onchainRules.maxDailyLimit;

  let overallStatus: "success" | "reverted" = "success";
  const ruleChecks: string[] = [];

  // Rules Evaluation logs
  ruleChecks.push(`Checking dynamic policies inside block #18239023:`);
  
  // Rule A: Session Expiration check
  if (isExpired) {
    overallStatus = "reverted";
    ruleChecks.push(`❌ Rule [Session Expiration]: FAILED. Block timestamp exceeds Session Expiry.`);
  } else {
    ruleChecks.push(`✅ Rule [Session Expiration]: SUCCESS. Current session has remaining active duration.`);
  }

  // Rule B: Whitelist targets
  if (!isWhitelisted) {
    overallStatus = "reverted";
    ruleChecks.push(`❌ Rule [Access Whitelist]: FAILED. Target address ${sanitizedTarget} is NOT whitelisted on-chain.`);
  } else {
    ruleChecks.push(`✅ Rule [Access Whitelist]: SUCCESS. Protocol address recognized on-chain.`);
  }

  // Rule C: Spending limits
  if (willExceedLimit) {
    overallStatus = "reverted";
    ruleChecks.push(`❌ Rule [Daily Spending Limit]: FAILED. Current action size ${valueInUsdc} USDC will push today's expenditure to ${onchainRules.spentToday + valueInUsdc} / ${onchainRules.maxDailyLimit} USDC.`);
  } else {
    ruleChecks.push(`✅ Rule [Daily Spending Limit]: SUCCESS. ${onchainRules.spentToday + valueInUsdc} / ${onchainRules.maxDailyLimit} limit boundary respected.`);
  }

  // Log rules check process
  const guardChecksLog: TerminalLog = {
    id: `agent-run-${Date.now()}-5`,
    timestamp: new Date().toISOString(),
    type: overallStatus === "success" ? "success" : "warning",
    emitter: "Guardrail Contract",
    message: ruleChecks.join("\n")
  };
  simulatedLogs.unshift(guardChecksLog);

  // 6. Execution Response block
  let finalStatusLog: TerminalLog;
  if (overallStatus === "success") {
    onchainRules.spentToday += valueInUsdc; // persist simulation states
    finalStatusLog = {
      id: `agent-run-${Date.now()}-6`,
      timestamp: new Date().toISOString(),
      type: "success",
      emitter: "Guardrail Contract",
      message: `🎉 [SUCCESS] UserOperation block processed! Swapped/Deposited ${valueInUsdc} USDC safely inside ArbAgentAccount v3 vault.`
    };
  } else {
    finalStatusLog = {
      id: `agent-run-${Date.now()}-6`,
      timestamp: new Date().toISOString(),
      type: "error",
      emitter: "Guardrail Contract",
      message: `🛡️ [REVERTED] The Shield Activates! Transaction has been reverted by AI_GuardrailModule interceptor. Master Vault assets remain intact.`
    };
  }
  simulatedLogs.unshift(finalStatusLog);

  res.json({
    parsedAction: {
      target: sanitizedTarget,
      valueInUsdc,
      protocol: protocolName,
      explanation
    },
    status: overallStatus === "success" ? "SUCCESS" : "REVERTED",
    reasons: overallStatus === "reverted" ? ["Guardrail limits violated"] : [],
    rulesState: onchainRules,
    isGeminiUsed
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Phylax SDK API server running at http://localhost:${PORT}`);
});
