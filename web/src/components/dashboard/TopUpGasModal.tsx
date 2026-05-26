"use client";

import { X } from "lucide-react";
import { useState } from "react";

type TopUpGasModalProps = {
  open: boolean;
  onClose: () => void;
  disabled?: boolean;
  onSubmit: (amount: string) => Promise<void>;
};

type FlowStep = "form" | "processing";

export default function TopUpGasModal({
  open,
  onClose,
  disabled = false,
  onSubmit,
}: TopUpGasModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<FlowStep>("form");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const canSubmit = amount.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || disabled) {
      return;
    }

    setErrorMessage(null);
    setStep("processing");

    try {
      await onSubmit(amount);
      setStep("form");
      setAmount("");
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to top up gas tank.");
      setStep("form");
    }
  };

  const handleClose = () => {
    setStep("form");
    setAmount("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/72 px-4 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#050505] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="phx-label">Top up gas</p>
            <h2 className="phx-display text-3xl">Fund Centralized Gas Reserve</h2>
            <p className="phx-body max-w-lg text-sm">
              Deposit additional USDC into the Phylax paymaster pool to keep all active AI
              accounts sponsored.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-zinc-400 transition hover:text-white"
            aria-label="Close top up gas modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "form" && (
          <div className="mt-8 space-y-6">
            <label className="block space-y-2">
              <span className="phx-label">Top up amount (USDC)</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="100"
                className="w-full border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              {["50 USDC", "100 USDC", "250 USDC"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.replace(" USDC", ""))}
                  className="border border-white/10 px-4 py-3 text-left text-sm text-white transition hover:border-white/30 hover:bg-white/5"
                >
                  <span className="phx-label block">Quick amount</span>
                  <span className="mt-2 block font-medium">{preset}</span>
                </button>
              ))}
            </div>

            {errorMessage && (
              <p className="text-sm text-red-300">{errorMessage}</p>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || disabled}
                className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                Submit & Sign
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="mt-10 space-y-5">
            <div className="h-2 overflow-hidden rounded-none bg-white/8">
              <div className="h-full w-2/3 animate-pulse bg-white" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">Awaiting wallet confirmation</p>
              <p className="phx-body text-sm">
                Open RainbowKit / MetaMask and approve the USDC top up transaction.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
