export type SmartAccountRecord = {
  id: string;
  label: string;
  address: string;
  strategy: string;
  gasTank: string;
  sessionStatus: string;
  sessionExpiry: string;
  policies: string[];
};

export const smartAccounts: SmartAccountRecord[] = [
  {
    id: "sa-trader",
    label: "SA-1 / Trader Agent",
    address: "0x41F7...A93C",
    strategy: "Short-cycle swaps and rebalances",
    gasTank: "184.20 USDC",
    sessionStatus: "Active",
    sessionExpiry: "06h 12m remaining",
    policies: ["Uniswap only", "Max 200 USDC / day", "Session signer rotated today"],
  },
  {
    id: "sa-saver",
    label: "SA-2 / Defi Saving",
    address: "0x8C2E...44B1",
    strategy: "Yield routing into whitelisted pools",
    gasTank: "96.00 USDC",
    sessionStatus: "Review due",
    sessionExpiry: "23h 08m remaining",
    policies: ["Aave + Morpho", "Max 500 USDC / day", "No direct transfers"],
  },
  {
    id: "sa-research",
    label: "SA-3 / Research Sandbox",
    address: "0xB817...9D02",
    strategy: "Low-limit experimentation for new prompts",
    gasTank: "38.75 USDC",
    sessionStatus: "Paused",
    sessionExpiry: "Session revoked",
    policies: ["30 USDC cap", "Single protocol sandbox", "Manual re-enable required"],
  },
];

export const gasEvents = [
  { label: "Top up pending", value: "75 USDC", note: "Queued for the trader agent tank" },
  { label: "Revenue markup", value: "2.5%", note: "Applied above raw settlement cost" },
  { label: "7d spend", value: "61.42 USDC", note: "Across all sponsored user operations" },
] as const;

export const policyTemplates = [
  {
    name: "Trader Envelope",
    detail: "Fast session rotations, protocol whitelist, tighter daily spend ceiling.",
  },
  {
    name: "Defi Saver",
    detail: "Lending and vault actions only, slower cadence, higher balance threshold.",
  },
  {
    name: "Research Sandbox",
    detail: "Single-route experiments with revocable temporary signer access.",
  },
] as const;
