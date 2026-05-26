export type DashboardViewId =
  | "overview"
  | "smart-accounts"
  | "gas-tank"
  | "activity-logs";

export type DashboardNavItem = {
  id: DashboardViewId;
  label: string;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  helper: string;
  helperTone?: "default" | "security";
  actionLabel?: string;
};

export type WhitelistTarget = {
  name: string;
  address: string;
};

export type GuardedAccount = {
  id: string;
  name: string;
  address: string;
  dailyUsed: number;
  dailyLimit: number;
  whitelist: WhitelistTarget[];
  status: "Active" | "Paused" | "Expired";
  expiresIn: string;
};

export type ActivityLog = {
  id: string;
  account: string;
  action: string;
  amount: string;
  result: "Executed" | "Reverted";
  timestamp: string;
  note: string;
};

export type GasTankEntry = {
  id: string;
  label: string;
  value: string;
  note: string;
};

export type GasConsumptionLog = {
  id: string;
  account: string;
  gasSpent: string;
  txType: string;
  timestamp: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "smart-accounts", label: "Smart Accounts" },
  { id: "gas-tank", label: "Gas Tank" },
  { id: "activity-logs", label: "Activity Logs" },
];

export const dashboardStats: DashboardStat[] = [
  {
    id: "gas-balance",
    label: "Gas Tank Balance",
    value: "45.20 USDC",
    helper: "+ Top Up Gas",
    actionLabel: "+ Top Up Gas",
  },
  {
    id: "agents",
    label: "Active Agents",
    value: "3 Accounts",
    helper: "Deployed via Factory",
  },
  {
    id: "limits",
    label: "Total Daily Limits",
    value: "150.00 USDC",
    helper: "Across all active profiles",
  },
  {
    id: "anomalies",
    label: "Blocked Anomalies",
    value: "2 Reverted",
    helper: "Prompt injections intercepted",
    helperTone: "security",
  },
];

export const guardedAccounts: GuardedAccount[] = [
  {
    id: "agent-1",
    name: "Trading",
    address: "0x3a6f8C8Fbc7c2f0b2E1d2a5D18C98952a0ab912f",
    dailyUsed: 20,
    dailyLimit: 50,
    whitelist: [
      {
        name: "Uniswap V3 Router",
        address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      },
    ],
    status: "Active",
    expiresIn: "Expires in 14h 22m",
  },
  {
    id: "agent-2",
    name: "Defi Saving",
    address: "0x7b1c52Ddd41a1f968B2c3Fa6b4D95af81ce688d2",
    dailyUsed: 45,
    dailyLimit: 75,
    whitelist: [
      {
        name: "Aave V3 Pool",
        address: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
      },
      {
        name: "Morpho Blue",
        address: "0xBBBBBbbBBb9cC5e90e3b3af64bdAF62C37EEFFCb",
      },
      {
        name: "USDC Permit2",
        address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
      },
    ],
    status: "Active",
    expiresIn: "Expires in 08h 04m",
  },
  {
    id: "agent-3",
    name: "Treasury Ops",
    address: "0x9fd138f5B6D6ab6f204Ca31A59F80B0aA1F946ac",
    dailyUsed: 10,
    dailyLimit: 25,
    whitelist: [
      {
        name: "Treasury Safe",
        address: "0x42cEDde51198D1773590311E2A340DC06B24cB37",
      },
      {
        name: "USDC Token",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
    ],
    status: "Expired",
    expiresIn: "Expired 02h 11m ago",
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: "log-1",
    account: "Trading",
    action: "Swap USDC -> ETH",
    amount: "12.00 USDC",
    result: "Executed",
    timestamp: "2 min ago",
    note: "Whitelisted path via Uniswap V3",
  },
  {
    id: "log-2",
    account: "Treasury Ops",
    action: "Direct transfer attempt",
    amount: "18.00 USDC",
    result: "Reverted",
    timestamp: "11 min ago",
    note: "Target not present in owner whitelist",
  },
  {
    id: "log-3",
    account: "Defi Saving",
    action: "Supply to Morpho",
    amount: "22.50 USDC",
    result: "Executed",
    timestamp: "28 min ago",
    note: "Session key within daily envelope",
  },
  {
    id: "log-4",
    account: "Trading",
    action: "Oversized rebalance",
    amount: "64.00 USDC",
    result: "Reverted",
    timestamp: "41 min ago",
    note: "Daily spending cap exceeded",
  },
];

export const gasTankEntries: GasTankEntry[] = [
  {
    id: "tank-1",
    label: "7D Paymaster Burn",
    value: "14.82 USDC",
    note: "Total gas sponsored over the last 7 days.",
  },
  {
    id: "tank-2",
    label: "Active Sponsored Streams",
    value: "2 Smart Accounts",
    note: "Accounts currently draining gas from this pool.",
  },
];

export const gasConsumptionHistory: GasConsumptionLog[] = [
  {
    id: "gas-log-1",
    account: "Trading",
    gasSpent: "0.45 USDC",
    txType: "Swap Execution",
    timestamp: "May 23, 10:27",
  },
  {
    id: "gas-log-2",
    account: "Defi Saving",
    gasSpent: "0.12 USDC",
    txType: "Supply Liquidity",
    timestamp: "May 23, 10:24",
  },
  {
    id: "gas-log-3",
    account: "Trading",
    gasSpent: "0.38 USDC",
    txType: "Swap Execution",
    timestamp: "May 22, 04:15",
  },
];
