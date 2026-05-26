"use client";

import { useState } from "react";
import LandingFooter from "./landing/LandingFooter";
import ActivityLogsTable from "./dashboard/ActivityLogsTable";
import DashboardSidebar from "./dashboard/DashboardSidebar";
import DashboardStatsGrid from "./dashboard/DashboardStatsGrid";
import GasTankWorkspace from "./dashboard/GasTankWorkspace";
import GuardedAccountsTable from "./dashboard/GuardedAccountsTable";
import ProvisionAgentModal from "./dashboard/ProvisionAgentModal";
import {
  activityLogs,
  dashboardNavItems,
  type DashboardViewId,
  guardedAccounts,
} from "./dashboard/dashboard-data";

function DashboardPanel({
  activeView,
  onProvisionAgent,
  activeAgentCount,
}: {
  activeView: DashboardViewId;
  onProvisionAgent: () => void;
  activeAgentCount: number;
}) {
  if (activeView === "gas-tank") {
    return <GasTankWorkspace />;
  }

  if (activeView === "activity-logs") {
    return <ActivityLogsTable logs={activityLogs} />;
  }

  return (
    <div className="space-y-8">
      {activeView === "overview" && (
        <DashboardStatsGrid
          stats={[
            { id: "gas-balance", label: "Gas Tank Balance", value: "45.20 USDC", helper: "" },
            {
              id: "agents",
              label: "Active Agents",
              value: `${activeAgentCount} Accounts`,
              helper: "",
            },
            { id: "limits", label: "Total Daily Limits", value: "150.00 USDC", helper: "" },
            { id: "anomalies", label: "Blocked Anomalies", value: "2 Reverted", helper: "" },
          ]}
        />
      )}
      <GuardedAccountsTable accounts={guardedAccounts} onProvisionAgent={onProvisionAgent} />
    </div>
  );
}

export default function OwnerDashboard() {
  const [activeView, setActiveView] = useState<DashboardViewId>("overview");
  const [provisionOpen, setProvisionOpen] = useState(false);
  const activeAgentCount = guardedAccounts.filter((account) => account.status === "Active").length;

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
            activeAgentCount={activeAgentCount}
          />
        </div>

        <LandingFooter />
      </div>

      <ProvisionAgentModal open={provisionOpen} onClose={() => setProvisionOpen(false)} />
    </>
  );
}
