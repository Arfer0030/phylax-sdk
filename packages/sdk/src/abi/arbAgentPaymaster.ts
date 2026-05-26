import type { Abi } from "viem";

export const arbAgentPaymasterAbi = [
  {
    type: "function",
    name: "gasTankBalance",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "availableGasTankBalance",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "availableBalance", type: "uint256" }],
  },
  {
    type: "function",
    name: "sponsoredStreamCount",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "billingToken",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "topUpGasTank",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawGasTank",
    stateMutability: "nonpayable",
    inputs: [
      { name: "receiver", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "registerSponsoredAccount",
    stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "removeSponsoredAccount",
    stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "previewCharge",
    stateMutability: "view",
    inputs: [{ name: "nativeCost", type: "uint256" }],
    outputs: [
      { name: "baseCharge", type: "uint256" },
      { name: "markupCharge", type: "uint256" },
      { name: "totalCharge", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "GasChargeSettled",
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "account", type: "address" },
      { indexed: false, name: "actualGasCost", type: "uint256" },
      { indexed: false, name: "totalCharge", type: "uint256" },
      { indexed: false, name: "remainingGasTankBalance", type: "uint256" },
    ],
  },
] as const satisfies Abi;
