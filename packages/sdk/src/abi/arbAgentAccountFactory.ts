import type { Abi } from "viem";

export const arbAgentAccountFactoryAbi = [
  {
    type: "function",
    name: "getAccounts",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "accounts", type: "address[]" }],
  },
  {
    type: "function",
    name: "guardrailByAccount",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "createConfiguredAgentAccount",
    stateMutability: "nonpayable",
    inputs: [
      { name: "owner", type: "address" },
      { name: "agentName", type: "string" },
      { name: "sessionSigner", type: "address" },
      { name: "sessionExpiry", type: "uint48" },
      { name: "spendWindowDuration", type: "uint48" },
      { name: "maxDailyLimit", type: "uint256" },
      { name: "whitelistNames", type: "string[]" },
      { name: "whitelistTargets", type: "address[]" },
    ],
    outputs: [
      { name: "account", type: "address" },
      { name: "guardrailModule", type: "address" },
    ],
  },
  {
    type: "event",
    name: "AgentAccountCreated",
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "account", type: "address" },
      { indexed: true, name: "guardrailModule", type: "address" },
      { indexed: false, name: "ownerAccountIndex", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "AgentAccountProvisioned",
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "account", type: "address" },
      { indexed: true, name: "guardrailModule", type: "address" },
      { indexed: false, name: "agentName", type: "string" },
      { indexed: false, name: "sessionSigner", type: "address" },
      { indexed: false, name: "sessionExpiry", type: "uint48" },
      { indexed: false, name: "spendWindowDuration", type: "uint48" },
      { indexed: false, name: "maxDailyLimit", type: "uint256" },
    ],
  },
] as const satisfies Abi;
