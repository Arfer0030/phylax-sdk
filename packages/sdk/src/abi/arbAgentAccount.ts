import type { Abi } from "viem";

export const arbAgentAccountAbi = [
  {
    type: "function",
    name: "masterOwner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "getDashboardState",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "currentAgentName", type: "string" },
      { name: "sessionSigner", type: "address" },
      { name: "sessionExpiry", type: "uint48" },
      { name: "spendWindowStart", type: "uint48" },
      { name: "spendWindowDuration", type: "uint48" },
      { name: "maxDailyLimit", type: "uint256" },
      { name: "spentToday", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getWhitelistTargets",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "targets",
        type: "tuple[]",
        components: [
          { name: "target", type: "address" },
          { name: "name", type: "string" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getWhitelistRecipients",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "recipients",
        type: "tuple[]",
        components: [
          { name: "recipient", type: "address" },
          { name: "name", type: "string" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "setAgentName",
    stateMutability: "nonpayable",
    inputs: [{ name: "newAgentName", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setSessionSigner",
    stateMutability: "nonpayable",
    inputs: [
      { name: "signer", type: "address" },
      { name: "expiry", type: "uint48" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "revokeSessionSigner",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "setMaxDailyLimit",
    stateMutability: "nonpayable",
    inputs: [{ name: "newLimit", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setSpendWindowDuration",
    stateMutability: "nonpayable",
    inputs: [{ name: "newDuration", type: "uint48" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setProtocolWhitelist",
    stateMutability: "nonpayable",
    inputs: [
      { name: "target", type: "address" },
      { name: "targetName", type: "string" },
      { name: "isAllowed", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setRecipientWhitelist",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "recipientName", type: "string" },
      { name: "isAllowed", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "execute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "target", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "spendAmount", type: "uint256" },
    ],
    outputs: [{ name: "result", type: "bytes" }],
  },
  {
    type: "function",
    name: "executeWithMetadata",
    stateMutability: "nonpayable",
    inputs: [
      { name: "target", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "spendAmount", type: "uint256" },
      { name: "action", type: "string" },
      { name: "context", type: "string" },
    ],
    outputs: [{ name: "result", type: "bytes" }],
  },
  {
    type: "event",
    name: "ExecutionMetadataLogged",
    anonymous: false,
    inputs: [
      { indexed: true, name: "target", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
      { indexed: false, name: "spendAmount", type: "uint256" },
      { indexed: false, name: "action", type: "string" },
      { indexed: false, name: "context", type: "string" },
      { indexed: false, name: "ownerBypass", type: "bool" },
    ],
  },
] as const satisfies Abi;
