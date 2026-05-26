"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import { useState } from "react";
import { smartAccounts } from "./dashboard-data";

export default function SmartAccountRegistrySection() {
  const [selectedAccountId, setSelectedAccountId] = useState(smartAccounts[0]?.id ?? "");

  const selectedAccount =
    smartAccounts.find((account) => account.id === selectedAccountId) ?? smartAccounts[0];

  return (
    <div className="border border-white/10 bg-[#09090b] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="phx-label">Smart account registry</p>
          <h2 className="phx-display mt-2 text-2xl">
            Provision one account per AI role
          </h2>
        </div>
        <button className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-sm text-white transition hover:border-white/30 hover:bg-white/5">
          <Plus className="h-4 w-4" />
          New account
        </button>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-2">
          {smartAccounts.map((account) => {
            const active = account.id === selectedAccount.id;

            return (
              <button
                key={account.id}
                onClick={() => setSelectedAccountId(account.id)}
                className={`w-full border p-4 text-left transition ${
                  active
                    ? "border-cyan-400/35 bg-cyan-400/8"
                    : "border-white/8 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{account.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{account.address}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-500" />
                </div>
                <p className="mt-3 text-xs leading-5 text-zinc-400">{account.strategy}</p>
              </button>
            );
          })}
        </div>

        <div className="border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
            <div>
              <p className="phx-label">Selected account</p>
              <h3 className="mt-2 text-lg font-medium text-white">{selectedAccount.label}</h3>
              <p className="phx-body mt-1 text-sm">{selectedAccount.strategy}</p>
            </div>
            <span className="phx-badge border border-white/10 px-2 py-1 text-zinc-300">
              {selectedAccount.sessionStatus}
            </span>
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <div>
              <p className="phx-label">Gas tank attached</p>
              <p className="mt-2 text-xl font-semibold text-white">{selectedAccount.gasTank}</p>
            </div>
            <div>
              <p className="phx-label">Session status</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {selectedAccount.sessionExpiry}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="phx-label">Guardrail envelope</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedAccount.policies.map((policy) => (
                <span
                  key={policy}
                  className="border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300"
                >
                  {policy}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
