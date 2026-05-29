import "dotenv/config";

import { GoogleGenAI, Type } from "@google/genai";
import {
  createArbitrumSepoliaRuntimeClient,
  createArbitrumSepoliaRuntimeConfig,
  readGuardedAccountState,
} from "@phylax/sdk";
import { erc20Abi, encodeFunctionData, parseUnits } from "viem";
import type { Address } from "viem";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type TransferIntent = {
  to: Address;
  amount: string;
  explanation: string;
};

type ParsedIntentResult = {
  intent: TransferIntent;
  source: "gemini" | "fallback";
};

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";
let geminiCooldownUntil = 0;

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  white: "\x1b[97m",
} as const;

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

function truncateAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function printLine(message = "") {
  output.write(`${message}\n`);
}

function printInfo(message: string) {
  printLine(`${ANSI.cyan}[TRADER AGENT]${ANSI.reset} ${message}`);
}

function printSuccess(message: string) {
  printLine(`${ANSI.green}[TRADER AGENT SUCCESS]${ANSI.reset} ${message}`);
}

function printWarning(message: string) {
  printLine(`${ANSI.yellow}[TRADER AGENT WARNING]${ANSI.reset} ${message}`);
}

function printError(message: string) {
  printLine(`${ANSI.red}[TRADER AGENT SECURITY ALERT]${ANSI.reset} ${message}`);
}

function isAddressCandidate(value: string): value is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function extractRevertMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function summarizeGeminiError(error: unknown): string {
  const message = extractRevertMessage(error);

  if (
    message.includes("\"status\":\"RESOURCE_EXHAUSTED\"") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("\"code\":429") ||
    message.toLowerCase().includes("quota")
  ) {
    return "Gemini quota exhausted. Using deterministic fallback parser.";
  }

  if (
    message.includes("\"status\":\"UNAVAILABLE\"") ||
    message.includes("UNAVAILABLE") ||
    message.includes("\"code\":503") ||
    message.toLowerCase().includes("high demand")
  ) {
    return "Gemini is temporarily unavailable. Using deterministic fallback parser.";
  }

  return `Gemini parse failed, using deterministic fallback parser. ${message}`;
}

function normalizeSecurityError(error: unknown): string {
  const message = extractRevertMessage(error);

  if (message.includes("RecipientNotWhitelisted")) {
    return "On-chain transaction blocked: destination wallet is not whitelisted.";
  }
  if (message.includes("0xab0b880c")) {
    return "On-chain transaction blocked: destination wallet is not whitelisted.";
  }
  if (message.includes("TargetNotWhitelisted")) {
    return "On-chain transaction blocked: target contract is not whitelisted.";
  }
  if (message.includes("SpendLimitExceeded")) {
    return "On-chain transaction blocked: spend cap would be exceeded.";
  }
  if (message.includes("SessionExpired")) {
    return "On-chain transaction blocked: delegated session key has expired.";
  }
  if (
    message.includes("pimlico_getUserOperationGasPrice") ||
    (message.includes("Forbidden") && message.includes("api.pimlico.io"))
  ) {
    return "Bundler access denied by Pimlico. Verify the configured Pimlico API key is valid for this Arbitrum Sepolia bundler endpoint.";
  }
  if (message.includes("AA33") || message.includes("paymaster")) {
    return "Execution rejected by bundler/paymaster. Verify the account is registered and the centralized gas tank is funded.";
  }

  return message;
}

function extractTransactionHash(receipt: any): string | undefined {
  return (
    receipt?.receipt?.transactionHash ??
    receipt?.transactionHash ??
    receipt?.userOperationReceipt?.receipt?.transactionHash ??
    receipt?.userOperationReceipt?.transactionHash
  );
}

function buildRuntimeConfig() {
  return createArbitrumSepoliaRuntimeConfig({
    rpcUrl: env("ARBITRUM_SEPOLIA_RPC_URL"),
    smartAccountAddress: env("PHYLAX_SMART_ACCOUNT_ADDRESS") as Address,
    sessionPrivateKey: env("PHYLAX_AI_SESSION_PRIVATE_KEY") as `0x${string}`,
    billingTokenAddress: optionalEnv("USDC_ADDRESS") as Address | undefined,
  });
}

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = optionalEnv("GEMINI_API_KEY");
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

async function parseIntentWithGemini(
  ai: GoogleGenAI,
  prompt: string,
): Promise<TransferIntent> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction:
        'You are an AI Treasury Agent. Extract only the destination wallet address and the USDC amount from the user message. Return JSON exactly in the schema { "to": "0x...", "amount": "...", "explanation": "..." }. Keep amount as a decimal string in USDC units, for example "5" or "2.5".',
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: Type.OBJECT,
        properties: {
          to: {
            type: Type.STRING,
            description: "Destination wallet address in 0x-prefixed hex format.",
          },
          amount: {
            type: Type.STRING,
            description: "USDC amount as a decimal string.",
          },
          explanation: {
            type: Type.STRING,
            description: "Short one-line execution summary.",
          },
        },
        propertyOrdering: ["to", "amount", "explanation"],
        required: ["to", "amount", "explanation"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = JSON.parse(response.text) as TransferIntent;
  if (!isAddressCandidate(parsed.to)) {
    throw new Error(`Gemini returned an invalid address: ${parsed.to}`);
  }

  return parsed;
}

function parseIntentFallback(prompt: string): TransferIntent {
  const addressMatch = prompt.match(/0x[a-fA-F0-9]{40}/);
  if (!addressMatch) {
    throw new Error("No valid destination wallet address found in prompt.");
  }

  const amountMatch =
    prompt.match(/(\d+(?:\.\d+)?)\s*usdc/i) ?? prompt.match(/\b(\d+(?:\.\d+)?)\b/);
  const amount = amountMatch?.[1] ?? "1";
  const to = addressMatch[0] as Address;

  return {
    to,
    amount,
    explanation: `Sending ${amount} USDC to ${to}.`,
  };
}

async function parseTransferIntent(
  ai: GoogleGenAI | null,
  prompt: string,
): Promise<ParsedIntentResult> {
  if (!ai) {
    printWarning("Gemini is not configured. Using deterministic fallback parser.");
    return {
      intent: parseIntentFallback(prompt),
      source: "fallback",
    };
  }

  if (Date.now() < geminiCooldownUntil) {
    printWarning("Gemini is temporarily cooling down. Using deterministic fallback parser.");
    return {
      intent: parseIntentFallback(prompt),
      source: "fallback",
    };
  }

  printInfo("Gemini is parsing your instruction...");

  try {
    const intent = await parseIntentWithGemini(ai, prompt);
    printInfo("Gemini parsed the intent successfully.");
    return {
      intent,
      source: "gemini",
    };
  } catch (error) {
    const raw = extractRevertMessage(error);
    if (
      raw.includes("RESOURCE_EXHAUSTED") ||
      raw.includes("\"code\":429") ||
      raw.includes("UNAVAILABLE") ||
      raw.includes("\"code\":503")
    ) {
      geminiCooldownUntil = Date.now() + 60_000;
    }
    printWarning(summarizeGeminiError(error));
    return {
      intent: parseIntentFallback(prompt),
      source: "fallback",
    };
  }
}

async function printStatus(runtimeConfig: ReturnType<typeof buildRuntimeConfig>) {
  const runtime = await createArbitrumSepoliaRuntimeClient({
    rpcUrl: runtimeConfig.rpcUrl,
    smartAccountAddress: runtimeConfig.smartAccountAddress,
    sessionPrivateKey: runtimeConfig.sessionPrivateKey,
    billingTokenAddress: runtimeConfig.addresses.billingToken,
    bundlerUrl: runtimeConfig.bundlerUrl,
  });
  const account = await readGuardedAccountState(
    runtime.publicClient as any,
    runtimeConfig.smartAccountAddress,
  );

  printLine();
  printLine(`${ANSI.white}Smart Account:${ANSI.reset} ${account.address}`);
  printLine(`${ANSI.white}Agent Name:${ANSI.reset} ${account.agentName || "Unnamed Agent"}`);
  printLine(`${ANSI.white}Session Status:${ANSI.reset} ${account.status}`);
  printLine(`${ANSI.white}Whitelisted Contracts:${ANSI.reset} ${account.whitelistTargets.length}`);
  printLine(`${ANSI.white}Whitelisted Wallets:${ANSI.reset} ${account.whitelistRecipients.length}`);
  printLine(
    `${ANSI.white}Daily Cap:${ANSI.reset} ${Number(account.maxDailyLimit) / 1_000_000} USDC`,
  );
  printLine();
}

async function runTransferPrompt(
  runtimeConfig: ReturnType<typeof buildRuntimeConfig>,
  ai: GoogleGenAI | null,
  prompt: string,
) {
  const runtime = await createArbitrumSepoliaRuntimeClient({
    rpcUrl: runtimeConfig.rpcUrl,
    smartAccountAddress: runtimeConfig.smartAccountAddress,
    sessionPrivateKey: runtimeConfig.sessionPrivateKey,
    billingTokenAddress: runtimeConfig.addresses.billingToken,
    bundlerUrl: runtimeConfig.bundlerUrl,
  });
  const parsedIntent = await parseTransferIntent(ai, prompt);
  const intent = parsedIntent.intent;
  const amount = parseUnits(intent.amount, 6);
  const normalizedExplanation = `Sending ${intent.amount} USDC to ${intent.to}.`;
  const transferCallData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [intent.to, amount],
  });

  if (parsedIntent.source === "gemini") {
    printInfo(`Gemini reasoning: ${normalizedExplanation}`);
  }
  printInfo(`Intent parsed: ${normalizedExplanation}`);
  printInfo(
    `Submitting guarded execution to ${truncateAddress(intent.to)} for ${intent.amount} USDC...`,
  );

  try {
    const { userOperationHash } = await runtime.sendGuardedExecution({
      target: runtimeConfig.addresses.billingToken,
      value: 0n,
      data: transferCallData,
      spendAmount: amount,
      action: "USDC Transfer",
      context: normalizedExplanation,
    });

    printInfo(`UserOperation submitted: ${userOperationHash}`);
    const receipt = await runtime.waitForUserOperationReceipt(userOperationHash);
    const transactionHash = extractTransactionHash(receipt);

    printSuccess(
      `Transferred ${intent.amount} USDC to ${intent.to}${
        transactionHash ? ` with tx hash ${transactionHash}` : ""
      }`,
    );
  } catch (error) {
    printError(normalizeSecurityError(error));
    printLine(`${ANSI.dim}${extractRevertMessage(error)}${ANSI.reset}`);
  }
}

async function main() {
  const runtimeConfig = buildRuntimeConfig();
  const ai = createGeminiClient();
  const rl = createInterface({ input, output });

  printLine();
  printLine(`${ANSI.white}Trader Agent Interactive CLI${ANSI.reset}`);
  printLine(
    `${ANSI.dim}Enter prompts like: "send 5 usdc to wallet 0x..."${ANSI.reset}`,
  );
  printLine(`${ANSI.dim}Commands: status, help, exit${ANSI.reset}`);
  printLine();

  if (!ai) {
    printWarning("GEMINI_API_KEY not found. Falling back to the local parser.");
  }

  try {
    while (true) {
      const prompt = (await rl.question("prompt > ")).trim();
      if (!prompt) {
        continue;
      }

      if (prompt === "exit" || prompt === "quit") {
        break;
      }

      if (prompt === "help") {
        printLine('Example: "send 5 usdc to wallet 0x1234...abcd"');
        printLine("Commands: status, help, exit");
        continue;
      }

      if (prompt === "status") {
        await printStatus(runtimeConfig);
        continue;
      }

      await runTransferPrompt(runtimeConfig, ai, prompt);
      printLine();
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  printError(extractRevertMessage(error));
  process.exitCode = 1;
});
