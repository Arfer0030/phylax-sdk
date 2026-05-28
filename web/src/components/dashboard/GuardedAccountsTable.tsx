"use client";

import { Copy, Plus, X, Pencil } from "lucide-react";
import { useState } from "react";
import EmergencyRevokeModal from "./EmergencyRevokeModal";
import EditPolicyModal from "./EditPolicyModal";
import type { GuardedAccount, WhitelistTarget } from "./dashboard-data";

type GuardedAccountsTableProps = {
  accounts: GuardedAccount[];
  onProvisionAgent: () => void;
  actionsDisabled?: boolean;
  onEmergencyRevoke: (accountAddress: `0x${string}`) => Promise<void>;
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
};

type WhitelistModalProps = {
  accountName: string;
  targets: WhitelistTarget[];
  onClose: () => void;
};

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type CopyIconButtonProps = {
  label: string;
  copied: boolean;
  onCopy: () => void;
};

function SpendingBar({ used, limit }: { used: number; limit: number }) {
  const percent = Math.min((used / limit) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="h-2 w-full overflow-hidden rounded-none bg-white/8">
        <div className="h-full rounded-none bg-white" style={{ width: `${percent}%` }} />
      </div>
      <p className="font-[family:var(--font-mono)] text-[12px] text-zinc-500">
        {used.toFixed(2)} / {limit.toFixed(2)} USDC
      </p>
    </div>
  );
}

function StatusCell({ status, expiresIn }: { status: GuardedAccount["status"]; expiresIn: string }) {
  const color =
    status === "Active" ? "bg-cyan-300" : status === "Expired" ? "bg-red-400" : "bg-zinc-500";

  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2 text-sm font-medium text-white">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {status}
      </div>
      <p className="font-[family:var(--font-mono)] text-[12px] text-zinc-500">{expiresIn}</p>
    </div>
  );
}

function CopyIconButton({ label, copied, onCopy }: CopyIconButtonProps) {
  return (
    <button
      onClick={onCopy}
      className="group relative text-zinc-400 transition hover:text-white"
      aria-label={label}
      type="button"
    >
      <Copy className="h-3.5 w-3.5" />
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap border border-white/10 bg-[#111111] px-2 py-1 text-[10px] font-medium text-zinc-200 opacity-0 transition duration-200 group-hover:opacity-100">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

function WhitelistDetailsModal({
  accountName,
  targets,
  onClose,
}: WhitelistModalProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      window.setTimeout(() => {
        setCopiedAddress((current) => (current === address ? null : current));
      }, 1200);
    } catch {
      setCopiedAddress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/72 px-4 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#050505] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="phx-label">Target whitelist</p>
            <h3 className="phx-display text-3xl">{accountName}</h3>
            <p className="phx-body text-sm">
              Approved contract targets currently bound to this guarded account.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 transition hover:text-white"
            aria-label="Close whitelist details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {targets.map((target) => (
            <div key={`${target.name}-${target.address}`} className="grid gap-3 border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="phx-label">Contract Name</p>
                <p className="mt-2 text-sm font-medium text-white">{target.name}</p>
              </div>
              <div>
                <p className="phx-label">Contract Address</p>
                <div className="mt-2 flex items-start gap-2">
                  <p className="break-all font-[family:var(--font-mono)] text-[12px] tracking-normal text-zinc-400">
                    {target.address}
                  </p>
                  <CopyIconButton
                    label={`Copy ${target.name} contract address`}
                    copied={copiedAddress === target.address}
                    onCopy={() => void handleCopyAddress(target.address)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GuardedAccountsTable({
  accounts,
  onProvisionAgent,
  actionsDisabled = false,
  onEmergencyRevoke,
  onUpdateDailyLimit,
  onUpdateWhitelist,
  onUpdateAgentName,
  onUpdateSpendWindow,
}: GuardedAccountsTableProps) {
  const [selectedWhitelist, setSelectedWhitelist] = useState<GuardedAccount | null>(null);
  const [selectedRevoke, setSelectedRevoke] = useState<GuardedAccount | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<GuardedAccount | null>(null);
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);

  const handleCopyAccountAddress = async (account: GuardedAccount) => {
    try {
      await navigator.clipboard.writeText(account.address);
      setCopiedAccountId(account.id);
      window.setTimeout(() => {
        setCopiedAccountId((current) => (current === account.id ? null : current));
      }, 1200);
    } catch {
      setCopiedAccountId(null);
    }
  };

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="phx-label">Overview</p>
            <h2 className="phx-display text-3xl">Active Guarded Accounts</h2>
            <p className="phx-body max-w-3xl text-sm">
              Real-time inventory of active AI smart accounts. Monitor spending caps, protocol
              whitelists, and session lifetimes enforced natively on Arbitrum.
            </p>
          </div>

          <button
            onClick={onProvisionAgent}
            disabled={actionsDisabled}
            className="inline-flex items-center gap-2 border border-white px-4 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-500 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
          >
            <Plus className="h-4 w-4" />
            Provision New Agent
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Agent Account</th>
                <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Daily Spending</th>
                <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Target Whitelist</th>
                <th className="pb-5 pr-6 text-base font-semibold text-zinc-300">Session Status</th>
                <th className="pb-5 text-base font-semibold text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const visibleTargets = account.whitelist.slice(0, 2);
                const hiddenCount = Math.max(account.whitelist.length - 2, 0);
                const displayedDailyUsed =
                  account.status === "Expired" ? 0 : account.dailyUsed;

                return (
                  <tr key={account.id} className="border-b border-white/8 align-top">
                    <td className="py-6 pr-6">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-white">{account.name}</p>
                        <div className="inline-flex items-center gap-2 font-[family:var(--font-mono)] text-[12px] text-zinc-500">
                          <span>{truncateAddress(account.address)}</span>
                          <CopyIconButton
                            label="Copy smart account address"
                            copied={copiedAccountId === account.id}
                            onCopy={() => void handleCopyAccountAddress(account)}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-6 pr-6">
                      <SpendingBar used={displayedDailyUsed} limit={account.dailyLimit} />
                    </td>
                    <td className="py-6 pr-6">
                      <button
                        onClick={() => setSelectedWhitelist(account)}
                        className="flex flex-wrap gap-2 text-left"
                      >
                        {visibleTargets.map((target) => (
                          <span
                            key={target.address}
                            className="border border-white/12 bg-black px-3 py-2 font-[family:var(--font-mono)] text-[12px] text-zinc-300 transition hover:border-white/30 hover:text-white"
                          >
                            {target.name}
                          </span>
                        ))}
                        {hiddenCount > 0 && (
                          <span className="border border-white/12 bg-black px-3 py-2 font-[family:var(--font-mono)] text-[12px] text-zinc-400 transition hover:border-white/30 hover:text-white">
                            +{hiddenCount}
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-6 pr-6">
                      <StatusCell status={account.status} expiresIn={account.expiresIn} />
                    </td>
                    <td className="py-6">
                      {account.status === "Expired" ? (
                        <button
                          disabled
                          className="cursor-not-allowed border border-white/8 px-4 py-2 font-[family:var(--font-mono)] text-[12px] uppercase tracking-[0.2em] text-zinc-600"
                        >
                          Inactive
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedEdit(account)}
                            disabled={actionsDisabled}
                            className="p-2.5 border border-white/16 text-zinc-300 transition hover:border-white hover:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            title="Edit Guard Policies"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedRevoke(account)}
                            disabled={actionsDisabled}
                            className="border border-white/16 px-4 py-2 font-[family:var(--font-mono)] text-[12px] uppercase tracking-[0.2em] text-zinc-300 transition hover:border-red-500 hover:bg-red-500 hover:text-white cursor-pointer disabled:cursor-not-allowed"
                          >
                            Kill-Switch
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selectedWhitelist && (
        <WhitelistDetailsModal
          accountName={selectedWhitelist.name}
          targets={selectedWhitelist.whitelist}
          onClose={() => setSelectedWhitelist(null)}
        />
      )}

      {selectedRevoke && (
        <EmergencyRevokeModal
          account={selectedRevoke}
          onConfirm={onEmergencyRevoke}
          onClose={() => setSelectedRevoke(null)}
        />
      )}

      {selectedEdit && (
        <EditPolicyModal
          account={selectedEdit}
          onClose={() => setSelectedEdit(null)}
          onUpdateDailyLimit={onUpdateDailyLimit}
          onUpdateWhitelist={onUpdateWhitelist}
          onUpdateAgentName={onUpdateAgentName}
          onUpdateSpendWindow={onUpdateSpendWindow}
          disabled={actionsDisabled}
        />
      )}
    </>
  );
}
