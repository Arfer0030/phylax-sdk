"use client";

import {
  claimTestnetUSDC,
  generateSessionKey,
  provisionGuardedAccount,
  readExecutionActivityLogs,
  readGasSettlementLogs,
  readGasTankState,
  readOwnerGuardedAccounts,
  revokeSessionSigner,
  topUpGasTank,
  type GasSettlementLog,
} from "@phylax/sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { phylaxSdkConfig } from "@/lib/phylax";
import {
  activityLogs as mockActivityLogs,
  gasConsumptionHistory as mockGasConsumptionHistory,
  gasTankEntries as mockGasTankEntries,
  guardedAccounts as mockGuardedAccounts,
  type ActivityLog,
  type GasConsumptionLog,
  type GasTankEntry,
  type GuardedAccount,
} from "./dashboard-data";

type ProvisionAgentInput = {
  agentName: string;
  dailyLimit: string;
  durationValue: string;
  durationUnit: "D" | "W" | "M";
  whitelist: { name: string; address: `0x${string}`; type: "Contract" | "Wallet" }[];
};

function formatRelativeTimestampFromSeconds(timestamp: bigint) {
  const now = Math.floor(Date.now() / 1000);
  const target = Number(timestamp);
  const diff = target - now;
  const absoluteSeconds = Math.abs(diff);
  const hours = Math.floor(absoluteSeconds / 3600);
  const minutes = Math.floor((absoluteSeconds % 3600) / 60);

  if (diff >= 0) {
    return `Expires in ${hours}h ${minutes}m`;
  }

  return `Expired ${hours}h ${minutes}m ago`;
}

function durationUnitToSeconds(value: string, unit: "D" | "W" | "M") {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid session duration.");
  }

  if (unit === "D") {
    return amount * 24 * 60 * 60;
  }
  if (unit === "W") {
    return amount * 7 * 24 * 60 * 60;
  }

  return amount * 30 * 24 * 60 * 60;
}

function toUiAccount(
  account: Awaited<ReturnType<typeof readOwnerGuardedAccounts>>[number],
): GuardedAccount {
  const status =
    account.status === "active"
      ? "Active"
      : account.status === "expired"
        ? "Expired"
        : "Paused";

  return {
    id: account.address,
    name: account.agentName || "Unnamed Agent",
    address: account.address,
    dailyUsed: Number(formatUnits(account.effectiveSpentInWindow, 6)),
    dailyLimit: Number(formatUnits(account.maxDailyLimit, 6)),
    whitelist: account.whitelist,
    status,
    expiresIn:
      account.status === "unconfigured"
        ? "Session not configured"
        : formatRelativeTimestampFromSeconds(account.sessionExpiry),
  };
}

function formatActivityTimestamp(seconds: bigint) {
  const date = new Date(Number(seconds) * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

async function mapGasHistoryWithBlockTime(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  settlements: GasSettlementLog[],
  accountNameMap: Map<string, string>,
): Promise<GasConsumptionLog[]> {
  const blockCache = new Map<bigint, bigint>();

  return Promise.all(
    settlements.map(async (settlement) => {
      let timestamp = blockCache.get(settlement.blockNumber);
      if (!timestamp) {
        const block = await publicClient.getBlock({ blockNumber: settlement.blockNumber });
        timestamp = block.timestamp;
        blockCache.set(settlement.blockNumber, timestamp);
      }

      return {
        id: `${settlement.transactionHash}-${settlement.logIndex}`,
        account:
          accountNameMap.get(settlement.account.toLowerCase()) ??
          settlement.account.slice(0, 6),
        gasSpent: `${formatUnits(settlement.totalCharge, 6)} USDC`,
        txType: "Sponsored Execution",
        timestamp: formatActivityTimestamp(timestamp),
      };
    }),
  );
}

export function usePhylaxOwnerDashboard() {
  const queryClient = useQueryClient();
  const { address, isConnected, isReconnecting, status } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const hasSdkConfig = Boolean(phylaxSdkConfig);
  const isCorrectChain = chainId === arbitrumSepolia.id;
  const canReadLive = Boolean(isConnected && address && publicClient && phylaxSdkConfig && isCorrectChain);
  const canWriteLive = Boolean(canReadLive && walletClient);

  const accountsQuery = useQuery({
    queryKey: ["phylax", "accounts", address],
    enabled: canReadLive,
    queryFn: async () => {
      return readOwnerGuardedAccounts(publicClient!, phylaxSdkConfig!, address!);
    },
  });

  const gasTankQuery = useQuery({
    queryKey: ["phylax", "gas-tank", address],
    enabled: canReadLive,
    queryFn: async () => {
      return readGasTankState(publicClient!, phylaxSdkConfig!, address!);
    },
  });

  const gasConsumptionQuery = useQuery({
    queryKey: ["phylax", "gas-consumption", address, accountsQuery.data?.length ?? 0],
    enabled: canReadLive && Boolean(accountsQuery.data),
    queryFn: async () => {
      const accountNameMap = new Map(
        (accountsQuery.data ?? []).map((account) => [
          account.address.toLowerCase(),
          account.agentName || "Unnamed Agent",
        ]),
      );

      const settlements = await readGasSettlementLogs(publicClient!, phylaxSdkConfig!, {
        owner: address!,
      });

      return mapGasHistoryWithBlockTime(publicClient!, settlements, accountNameMap);
    },
  });

  const activityLogsQuery = useQuery({
    queryKey: ["phylax", "activity", address, accountsQuery.data?.length ?? 0],
    enabled: canReadLive && Boolean(accountsQuery.data),
    queryFn: async () => {
      const accounts = accountsQuery.data ?? [];
      const blockCache = new Map<bigint, bigint>();

      const logs = await Promise.all(
        accounts.map(async (account) => {
          const executionLogs = await readExecutionActivityLogs(publicClient!, account.address);

          return Promise.all(
            executionLogs.map(async (log) => {
              let timestamp = blockCache.get(log.blockNumber);
              if (!timestamp) {
                const block = await publicClient!.getBlock({ blockNumber: log.blockNumber });
                timestamp = block.timestamp;
                blockCache.set(log.blockNumber, timestamp);
              }

              return {
                id: `${log.transactionHash}-${log.logIndex}`,
                account: account.agentName || "Unnamed Agent",
                action: log.action || "Session Execution",
                amount: `${formatUnits(log.spendAmount, 6)} USDC`,
                result: "Executed" as const,
                timestamp: formatActivityTimestamp(timestamp),
                note: log.context || "On-chain execution recorded by Phylax.",
              };
            }),
          );
        }),
      );

      return logs.flat().sort((left, right) => right.timestamp.localeCompare(left.timestamp));
    },
  });

  const fallbackAccounts = mockGuardedAccounts;
  const accounts = canReadLive
    ? (accountsQuery.data?.map(toUiAccount) ?? [])
    : fallbackAccounts;

  const activeAccounts = accounts.filter((account) => account.status === "Active");
  const activeAgentCount = activeAccounts.length;
  const totalActiveDailyLimit = activeAccounts.reduce(
    (total, account) => total + account.dailyLimit,
    0,
  );

  const stats = [
    {
      id: "gas-balance",
      label: "Gas Tank Balance",
      value: canReadLive && gasTankQuery.data
        ? `${formatUnits(gasTankQuery.data.gasTankBalance, 6)} USDC`
        : "45.20 USDC",
      helper: "",
    },
    {
      id: "agents",
      label: "Active Agents",
      value: `${activeAgentCount} Accounts`,
      helper: "",
    },
    {
      id: "limits",
      label: "Total Daily Limits",
      value: `${totalActiveDailyLimit.toFixed(2)} USDC`,
      helper: "",
    },
    {
      id: "anomalies",
      label: "Blocked Anomalies",
      value: canReadLive ? "0 Reverted" : "2 Reverted",
      helper: "",
    },
  ];

  const gasTankEntries: GasTankEntry[] =
    canReadLive && gasTankQuery.data
      ? [
          {
            id: "tank-1",
            label: "7D Paymaster Burn",
            value:
              gasConsumptionQuery.data && gasConsumptionQuery.data.length > 0
                ? `${gasConsumptionQuery.data
                    .reduce((total, entry) => {
                      const raw = Number(entry.gasSpent.replace(" USDC", ""));
                      return total + raw;
                    }, 0)
                    .toFixed(2)} USDC`
                : "0.00 USDC",
            note: "Total gas sponsored over the last 7 days.",
          },
          {
            id: "tank-2",
            label: "Active Sponsored Streams",
            value: `${gasTankQuery.data.sponsoredStreamCount.toString()} Smart Accounts`,
            note: "Accounts currently draining gas from this pool.",
          },
        ]
      : mockGasTankEntries;

  const gasConsumptionHistory = canReadLive
    ? (gasConsumptionQuery.data ?? [])
    : mockGasConsumptionHistory;

  const activityLogs: ActivityLog[] = canReadLive
    ? (activityLogsQuery.data ?? [])
    : mockActivityLogs;

  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["phylax", "accounts"] }),
      queryClient.invalidateQueries({ queryKey: ["phylax", "gas-tank"] }),
      queryClient.invalidateQueries({ queryKey: ["phylax", "activity"] }),
      queryClient.invalidateQueries({ queryKey: ["phylax", "gas-consumption"] }),
    ]);
  };

  const provisionNewAgent = async (input: ProvisionAgentInput) => {
    if (!canWriteLive) {
      const session = generateSessionKey();
      return { sessionPrivateKey: session.privateKey };
    }

    const session = generateSessionKey();
    const sessionDuration = durationUnitToSeconds(input.durationValue, input.durationUnit);
    const sessionExpiry = BigInt(Math.floor(Date.now() / 1000) + sessionDuration);

    const result = await provisionGuardedAccount(publicClient!, walletClient!, phylaxSdkConfig!, {
      owner: address!,
      agentName: input.agentName,
      sessionSigner: session.address,
      sessionExpiry,
      spendWindowDuration: BigInt(sessionDuration),
      maxDailyLimit: parseUnits(input.dailyLimit, 6),
      whitelist: input.whitelist.map(({ name, address }) => ({ name, address })),
    });

    await publicClient!.waitForTransactionReceipt({ hash: result.hash });
    await refetchAll();

    return { sessionPrivateKey: session.privateKey };
  };

  const emergencyRevoke = async (accountAddress: `0x${string}`) => {
    if (!canWriteLive) {
      return;
    }

    const result = await revokeSessionSigner(
      publicClient!,
      walletClient!,
      accountAddress,
    );
    await publicClient!.waitForTransactionReceipt({ hash: result.hash });
    await refetchAll();
  };

  const claimFaucet = async () => {
    if (!canWriteLive) {
      return;
    }

    const result = await claimTestnetUSDC(publicClient!, walletClient!, phylaxSdkConfig!);
    await publicClient!.waitForTransactionReceipt({ hash: result.hash });
    await refetchAll();
  };

  const submitTopUpGas = async (amount: string) => {
    if (!canWriteLive) {
      return;
    }

    const result = await topUpGasTank(
      publicClient!,
      walletClient!,
      phylaxSdkConfig!,
      parseUnits(amount, 6),
    );

    if (result.approvalHash) {
      await publicClient!.waitForTransactionReceipt({ hash: result.approvalHash });
    }
    await publicClient!.waitForTransactionReceipt({ hash: result.topUpHash });
    await refetchAll();
  };

  const userUsdcBalance = canReadLive && gasTankQuery.data
    ? `${Number(formatUnits(gasTankQuery.data.billingTokenBalance, 6)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`
    : "1,000.00 USDC";

  return {
    hasSdkConfig,
    isConnected,
    isCorrectChain,
    canReadLive,
    canWriteLive,
    stats,
    accounts,
    activityLogs,
    gasTankEntries,
    gasConsumptionHistory,
    userUsdcBalance,
    isReconnecting,
    status,
    isLoading:
      accountsQuery.isLoading ||
      gasTankQuery.isLoading ||
      gasConsumptionQuery.isLoading ||
      activityLogsQuery.isLoading,
    provisionNewAgent,
    emergencyRevoke,
    claimFaucet,
    submitTopUpGas,
  };
}
