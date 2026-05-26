"use client";

import { motion } from "motion/react";
import type { DashboardNavItem, DashboardViewId } from "./dashboard-data";

type DashboardSidebarProps = {
  items: DashboardNavItem[];
  activeView: DashboardViewId;
  onSelect: (view: DashboardViewId) => void;
};

export default function DashboardSidebar({
  items,
  activeView,
  onSelect,
}: DashboardSidebarProps) {
  return (
    <aside className="border-r border-white/8 pr-6">
      <div className="sticky top-28 space-y-8">
        <div className="space-y-3">
          <p className="phx-label">Control Surface</p>
          <h1 className="phx-display text-3xl">Dashboard</h1>
          <p className="phx-body max-w-[18rem] text-sm">
            An immutable control plane for autonomous AI finance. Provision guarded smart
            accounts, manage risk boundaries, and monitor policy enforcement from a single
            interface.
          </p>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const active = item.id === activeView;

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="relative flex w-full items-center py-2 text-left"
              >
                <span
                  className={`text-[0.95rem] font-medium transition ${
                    active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="dashboard-nav-active"
                    className="absolute inset-y-0 -left-3 w-px bg-cyan-300/80"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
