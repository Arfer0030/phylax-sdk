"use client";

import { useState } from "react";
import {
  gasConsumptionHistory,
  gasTankEntries,
} from "./dashboard-data";
import TopUpGasModal from "./TopUpGasModal";

export default function GasTankWorkspace() {
  const [topUpOpen, setTopUpOpen] = useState(false);

  return (
    <>
      <section className="space-y-8">
        <div className="space-y-2">
          <p className="phx-label">Gas tank</p>
          <h2 className="phx-display text-3xl">Centralized Gas Reserve</h2>
          <p className="phx-body max-w-3xl text-sm">
            Fund a single gas reserve to sponsor executions across all active AI accounts. Isolate
            your agents&apos; working capital entirely from on-chain gas overhead.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="bg-[#111111] p-6 sm:p-7">
            <p className="phx-label">Centralized Gas Reserves</p>
            <p className="mt-6 text-[3.4rem] font-extrabold leading-none tracking-[-0.08em] text-white sm:text-[4.25rem]">
              45.20 USDC
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setTopUpOpen(true)}
                className="inline-flex items-center justify-center bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                + Top Up Gas
              </button>
              <button className="inline-flex items-center justify-center border border-white/14 px-5 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5">
                Claim Testnet USDC
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {gasTankEntries.map((entry) => (
              <div key={entry.id} className="bg-[#111111] p-5">
                <p className="phx-label">{entry.label}</p>
                <p className="mt-5 text-[2rem] font-extrabold leading-none tracking-[-0.06em] text-white">
                  {entry.value}
                </p>
                <p className="phx-body mt-4 text-sm">{entry.note}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="phx-label">Billing analytics</p>
            <h3 className="phx-display text-3xl">Gas Consumption History</h3>
            <p className="phx-body max-w-3xl text-sm">
              Track which AI accounts are currently consuming paymaster balance and how frequently
              they draw from the centralized reserve.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Agent Account</th>
                  <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Gas Spent (USDC)</th>
                  <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Tx Type</th>
                  <th className="pb-5 text-base font-semibold text-zinc-300">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {gasConsumptionHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/8 align-top">
                    <td className="py-6 pr-6 text-white">{entry.account}</td>
                    <td className="py-6 pr-6 font-[family:var(--font-mono)] text-[13px] text-zinc-400">
                      {entry.gasSpent}
                    </td>
                    <td className="py-6 pr-6 text-white">{entry.txType}</td>
                    <td className="py-6 font-[family:var(--font-mono)] text-[13px] text-zinc-500">
                      {entry.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <TopUpGasModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </>
  );
}
