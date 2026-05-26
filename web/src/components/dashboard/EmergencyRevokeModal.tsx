"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { GuardedAccount } from "./dashboard-data";

type EmergencyRevokeModalProps = {
  account: GuardedAccount;
  onClose: () => void;
};

export default function EmergencyRevokeModal({
  account,
  onClose,
}: EmergencyRevokeModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-[68] flex items-center justify-center bg-black/72 px-4 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#050505] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="phx-label text-red-300">Emergency revoke</p>
            <h3 className="phx-display text-3xl">Confirm Emergency Revoke</h3>
            <p className="phx-body max-w-xl text-sm">
              Are you sure you want to terminate the session key for {account.name}? This will
              instantly block the AI agent from executing any further transactions on-chain.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 transition hover:text-white"
            aria-label="Close emergency revoke modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 space-y-3 border border-white/8 bg-[#111111] p-5">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <p className="phx-label">Smart Account</p>
              <p className="mt-2 break-all pr-3 font-[family:var(--font-mono)] text-[12px] leading-6 tracking-normal text-zinc-400">
                {account.address}
              </p>
            </div>
            <div className="min-w-0">
              <p className="phx-label">Action Required</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white">
                EOA Transaction Signature
              </p>
            </div>
            <div className="min-w-0">
              <p className="phx-label">Status Impact</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white">
                Instant Session Termination
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-zinc-500">
          Note: This action is irreversible and requires an on-chain gas fee from your connected
          wallet.
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-white/14 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-red-500 hover:text-white disabled:cursor-wait disabled:bg-zinc-300 disabled:text-black"
          >
            {submitting ? "Opening Wallet..." : "Confirm & Kill Key"}
          </button>
        </div>
      </div>
    </div>
  );
}
