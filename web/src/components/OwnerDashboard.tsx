"use client";

import { useState, useEffect } from "react";
import LandingFooter from "./landing/LandingFooter";
import ActivityLogsTable from "./dashboard/ActivityLogsTable";
import DashboardSidebar from "./dashboard/DashboardSidebar";
import DashboardStatsGrid from "./dashboard/DashboardStatsGrid";
import GasTankWorkspace from "./dashboard/GasTankWorkspace";
import GuardedAccountsTable from "./dashboard/GuardedAccountsTable";
import ProvisionAgentModal from "./dashboard/ProvisionAgentModal";
import { usePhylaxOwnerDashboard } from "./dashboard/usePhylaxOwnerDashboard";
import {
  dashboardNavItems,
  type DashboardViewId,
} from "./dashboard/dashboard-data";
import PhylaxConnectButton from "./wallet/PhylaxConnectButton";
import { Shield, KeyRound, Flame, Activity } from "lucide-react";
import { motion } from "motion/react";

function DashboardPanel({
  activeView,
  onProvisionAgent,
  stats,
  accounts,
  activityLogs,
  gasTankEntries,
  gasConsumptionHistory,
  actionsDisabled,
  onEmergencyRevoke,
  onTopUpGas,
  onClaimTestnetUsdc,
  userUsdcBalance,
  onUpdateDailyLimit,
  onUpdateWhitelist,
  onUpdateAgentName,
  onUpdateSpendWindow,
}: {
  activeView: DashboardViewId;
  onProvisionAgent: () => void;
  stats: {
    id: string;
    label: string;
    value: string;
    helper: string;
  }[];
  accounts: import("./dashboard/dashboard-data").GuardedAccount[];
  activityLogs: import("./dashboard/dashboard-data").ActivityLog[];
  gasTankEntries: import("./dashboard/dashboard-data").GasTankEntry[];
  gasConsumptionHistory: import("./dashboard/dashboard-data").GasConsumptionLog[];
  actionsDisabled: boolean;
  onEmergencyRevoke: (accountAddress: `0x${string}`) => Promise<void>;
  onTopUpGas: (amount: string) => Promise<void>;
  onClaimTestnetUsdc: () => Promise<void>;
  userUsdcBalance: string;
  onUpdateDailyLimit: (accountAddress: `0x${string}`, limit: string) => Promise<void>;
  onUpdateWhitelist: (
    accountAddress: `0x${string}`,
    name: string,
    targetAddress: `0x${string}`,
    type: "contract" | "wallet",
    isAllowed: boolean
  ) => Promise<void>;
  onUpdateAgentName: (accountAddress: `0x${string}`, name: string) => Promise<void>;
  onUpdateSpendWindow: (accountAddress: `0x${string}`, durationSeconds: number) => Promise<void>;
}) {
  if (activeView === "gas-tank") {
    return (
      <GasTankWorkspace
        entries={gasTankEntries}
        gasBalance={stats[0]?.value ?? "0.00 USDC"}
        gasConsumptionHistory={gasConsumptionHistory}
        actionsDisabled={actionsDisabled}
        onTopUpGas={onTopUpGas}
        onClaimTestnetUsdc={onClaimTestnetUsdc}
        userUsdcBalance={userUsdcBalance}
      />
    );
  }

  if (activeView === "activity-logs") {
    return <ActivityLogsTable logs={activityLogs} />;
  }

  return (
    <div className="space-y-8">
      {activeView === "overview" && <DashboardStatsGrid stats={stats} />}
      <GuardedAccountsTable
        accounts={accounts}
        onProvisionAgent={onProvisionAgent}
        actionsDisabled={actionsDisabled}
        onEmergencyRevoke={onEmergencyRevoke}
        onUpdateDailyLimit={onUpdateDailyLimit}
        onUpdateWhitelist={onUpdateWhitelist}
        onUpdateAgentName={onUpdateAgentName}
        onUpdateSpendWindow={onUpdateSpendWindow}
      />
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-800/40 rounded ${className}`} />
  );
}

function DashboardSkeleton({ activeView }: { activeView: DashboardViewId }) {
  if (activeView === "gas-tank") {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-zinc-850/60" />
          <Skeleton className="h-8 w-64 bg-zinc-800/60" />
          <Skeleton className="h-4 w-full max-w-3xl bg-zinc-800/30" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="bg-[#111111] p-6 sm:p-7 space-y-6">
            <Skeleton className="h-4 w-32 bg-zinc-800/60" />
            <Skeleton className="h-12 w-48 bg-zinc-800/60" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-32 bg-zinc-800/60" />
              <Skeleton className="h-12 w-44 bg-zinc-800/60" />
            </div>
            <Skeleton className="h-4 w-40 bg-zinc-800/60" />
          </div>
          <div className="grid gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-[#111111] p-5 space-y-3">
                <Skeleton className="h-4 w-28 bg-zinc-800/60" />
                <Skeleton className="h-8 w-24 bg-zinc-800/60" />
                <Skeleton className="h-4 w-48 bg-zinc-800/40" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 mt-8">
          <Skeleton className="h-6 w-48 bg-zinc-800/60" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-zinc-800/40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "activity-logs") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-zinc-800/60" />
          <Skeleton className="h-8 w-56 bg-zinc-800/60" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-zinc-800/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#111111] p-5 space-y-4">
            <Skeleton className="h-4 w-24 bg-zinc-800/60" />
            <Skeleton className="h-10 w-32 bg-zinc-800/60" />
          </div>
        ))}
      </div>
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 bg-zinc-800/60" />
          <Skeleton className="h-10 w-36 bg-zinc-800/60" />
        </div>
        <div className="bg-[#111111] p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 bg-zinc-800/60" />
                <Skeleton className="h-4 w-64 bg-zinc-800/40" />
              </div>
              <Skeleton className="h-6 w-20 bg-zinc-800/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const [activeView, setActiveView] = useState<DashboardViewId>("overview");
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    hasSdkConfig,
    isConnected,
    isCorrectChain,
    canWriteLive,
    stats,
    accounts,
    activityLogs,
    gasTankEntries,
    gasConsumptionHistory,
    provisionNewAgent,
    emergencyRevoke,
    claimFaucet,
    submitTopUpGas,
    userUsdcBalance,
    isLoading,
    isReconnecting,
    status,
    updateDailyLimit,
    updateWhitelist,
    updateAgentName,
    updateSpendWindow,
  } = usePhylaxOwnerDashboard();
  const actionsDisabled = !canWriteLive;

  const isWalletLoading = !mounted || status === "connecting" || status === "reconnecting";
  const showDashboard = mounted && isConnected && status === "connected";

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14">
        <div className="grid gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
          <DashboardSidebar
            items={dashboardNavItems}
            activeView={activeView}
            onSelect={setActiveView}
          />

          {isWalletLoading ? (
            <DashboardSkeleton activeView={activeView} />
          ) : showDashboard ? (
            isLoading ? (
              <DashboardSkeleton activeView={activeView} />
            ) : (
              <DashboardPanel
                activeView={activeView}
                onProvisionAgent={() => setProvisionOpen(true)}
                stats={stats}
                accounts={accounts}
                activityLogs={activityLogs}
                gasTankEntries={gasTankEntries}
                gasConsumptionHistory={gasConsumptionHistory}
                actionsDisabled={actionsDisabled}
                onEmergencyRevoke={emergencyRevoke}
                onTopUpGas={submitTopUpGas}
                onClaimTestnetUsdc={claimFaucet}
                userUsdcBalance={userUsdcBalance}
                onUpdateDailyLimit={updateDailyLimit}
                onUpdateWhitelist={updateWhitelist}
                onUpdateAgentName={updateAgentName}
                onUpdateSpendWindow={updateSpendWindow}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center border border-white/6 bg-white/[0.01] backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center min-h-[600px] shadow-[0_0_50px_-12px_rgba(34,211,238,0.03)]">
              <motion.div
                className="flex flex-col items-center text-center max-w-xl mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="phx-display font-extrabold text-white text-3xl sm:text-4xl tracking-[-0.05em] mb-4">
                  Unlock Owner Dashboard
                </h1>
                <p className="phx-body text-zinc-400 text-sm sm:text-base leading-relaxed">
                  Please connect your Master EOA wallet to deploy smart vaults, manage whitelists,
                  adjust daily spending caps, and deposit stablecoins to your centralized gas tank.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative">
                    <PhylaxConnectButton />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <LandingFooter />
      </div>

      <ProvisionAgentModal
        open={provisionOpen}
        onClose={() => setProvisionOpen(false)}
        disabled={actionsDisabled}
        onSubmit={provisionNewAgent}
      />

      {!hasSdkConfig && isConnected && (
        <p className="mx-auto mt-6 w-full max-w-7xl text-sm text-zinc-500">
          Dashboard is running in mock preview mode. Add Phylax contract addresses to
          <span className="mx-1 font-[family:var(--font-mono)] text-zinc-300">
            web/.env.local
          </span>
          to enable live owner flows.
        </p>
      )}

      {hasSdkConfig && isConnected && !isCorrectChain && (
        <p className="mx-auto mt-6 w-full max-w-7xl text-sm text-amber-200/80">
          Switch your wallet to Arbitrum Sepolia to enable live Phylax owner actions.
        </p>
      )}
    </>
  );
}

