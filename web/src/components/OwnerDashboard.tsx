"use client";

import { useState } from "react";
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
      />
    </div>
  );
}

export default function OwnerDashboard() {
  const [activeView, setActiveView] = useState<DashboardViewId>("overview");
  const [provisionOpen, setProvisionOpen] = useState(false);
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
  } = usePhylaxOwnerDashboard();
  const actionsDisabled = !canWriteLive;

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14">
        <div className="grid gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
          <DashboardSidebar
            items={dashboardNavItems}
            activeView={activeView}
            onSelect={setActiveView}
          />

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
          />
        </div>

        <LandingFooter />
      </div>

      <ProvisionAgentModal
        open={provisionOpen}
        onClose={() => setProvisionOpen(false)}
        disabled={actionsDisabled}
        onSubmit={provisionNewAgent}
      />

      {!hasSdkConfig && (
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
