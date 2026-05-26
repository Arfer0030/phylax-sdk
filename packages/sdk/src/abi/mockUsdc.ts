import type { Abi } from "viem";

export const mockUsdcAbi = [
  {
    type: "function",
    name: "faucetAmount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "faucetCooldown",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint48" }],
  },
  {
    type: "function",
    name: "lastFaucetClaimAt",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint48" }],
  },
  {
    type: "function",
    name: "claimTestnetUSDC",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const satisfies Abi;
