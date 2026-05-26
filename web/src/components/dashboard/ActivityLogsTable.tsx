"use client";

import type { ActivityLog } from "./dashboard-data";

type ActivityLogsTableProps = {
  logs: ActivityLog[];
};

export default function ActivityLogsTable({ logs }: ActivityLogsTableProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="phx-label">Activity logs</p>
        <h2 className="phx-display text-3xl">On-Chain Agent History</h2>
        <p className="phx-body max-w-3xl text-sm">
          Unified cryptographic audit trail tracking successful executions and guardrail-blocked
          anomalies natively on Arbitrum.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Account</th>
              <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Action</th>
              <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Amount</th>
              <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Result</th>
              <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Timestamp</th>
              <th className="pb-5 text-base font-semibold text-zinc-300">Context</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/8 align-top">
                <td className="py-6 pr-6 text-white">{log.account}</td>
                <td className="py-6 pr-6 text-white">{log.action}</td>
                <td className="py-6 pr-6 font-[family:var(--font-mono)] text-[13px] text-zinc-400">
                  {log.amount}
                </td>
                <td className="py-6 pr-6">
                  <span
                    className={`phx-badge border px-2 py-1 ${
                      log.result === "Executed"
                        ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                        : "border-red-500/20 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {log.result}
                  </span>
                </td>
                <td className="py-6 pr-6 font-[family:var(--font-mono)] text-[13px] text-zinc-500">
                  {log.timestamp}
                </td>
                <td className="py-6 text-sm text-zinc-400">{log.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
