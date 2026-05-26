export const operatingProfiles = [
  { name: "Trading agents", icon: "trend" },
  { name: "Treasury copilots", icon: "stack" },
  { name: "DeFi automation", icon: "flow" },
  { name: "Execution bots", icon: "route" },
  { name: "Risk engines", icon: "shield" },
  { name: "Vault operators", icon: "vault" },
  { name: "Payment orchestrators", icon: "rails" },
  { name: "Portfolio rebalancers", icon: "pie" },
  { name: "Yield allocators", icon: "nodes" },
] as const;

export type OperatingProfileIcon = (typeof operatingProfiles)[number]["icon"];

export const stackProducts = [
  {
    name: "Session Keys",
    description:
      "Issue temporary, delegated credentials directly from your dashboard. Empower your AI agents to sign fast transactions without ever exposing your master private key.",
  },
  {
    name: "On-Chain Guardrails",
    description:
      "Enforce strict programmatic limits natively on Arbitrum. Automatically intercept transactions to block unapproved protocols and freeze anomalous spending caps.",
  },
  {
    name: "Centralized Gas Tanks",
    description:
      "Isolate operational gas from your agent's core capital. Top up a single pool in USDC to seamlessly sponsor gasless executions across multiple smart accounts.",
  },
] as const;

export const integrationStack = [
  { tag: "CORE STANDARD", title: "ERC-4337" },
  { tag: "L2 EXECUTION", title: "Arbitrum Sepolia" },
  { tag: "AA INFRASTRUCTURE", title: "Pimlico Bundler" },
  { tag: "CLIENT LIBRARY", title: "Viem & Permissionless" },
  { tag: "DEVELOPMENT SUITE", title: "Foundry Toolchain" },
  { tag: "SMART CONTRACT", title: "Smart Accounts" },
  { tag: "DELEGATED SECURITY", title: "Session Keys" },
  { tag: "CUSTOM GAS PAYMASTER", title: "Centralized Gas Tanks" },
  { tag: "ACCOUNT DEPLOYER", title: "Account Factories" },
  { tag: "ON-CHAIN ENFORCEMENT", title: "Guardrail Policies" },
] as const;

export const whyPhylax = [
  {
    title: "Isolated Agent Runtimes",
    description:
      "Never expose your master private key to the AI environment. Provision temporary session keys with strict programmatic boundaries directly from your dashboard.",
  },
  {
    title: "Separated Gas & Capital",
    description:
      "Fuel your centralized gas tank independently. AI agents spend raw USDC capital exactly as allocated, with zero hidden gas deductions from their working balances.",
  },
  {
    title: "On-Chain Policy, Not Prompts",
    description:
      "Prompt injections, hallucinations, or backend exploits hit an immutable contract boundary. Malicious transactions revert instantly at the blockchain level.",
  },
] as const;

export const sponsorGroups = {
  collaborator: ["Arbitrum", "Pimlico"],
  infrastructure: ["Viem", "Permissionless"],
  ecosystem: [
    "OpenZeppelin",
    "Foundry",
    "Safe",
    "Uniswap",
    "Aave",
    "Alchemy",
    "WalletConnect",
    "Etherscan",
    "Chainlink",
    "CoinGecko",
  ],
} as const;
