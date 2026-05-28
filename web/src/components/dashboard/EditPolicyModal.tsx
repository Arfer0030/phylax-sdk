"use client";

import { Trash2, X, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import type { GuardedAccount } from "./dashboard-data";

type EditPolicyModalProps = {
  account: GuardedAccount;
  onClose: () => void;
  onUpdateDailyLimit: (accountAddress: `0x${string}`, limit: string) => Promise<void>;
  onUpdateWhitelist: (
    accountAddress: `0x${string}`,
    name: string,
    targetAddress: `0x${string}`,
    type: "contract" | "wallet",
    isAllowed: boolean
  ) => Promise<void>;
  onUpdateAgentName?: (accountAddress: `0x${string}`, name: string) => Promise<void>;
  onUpdateSpendWindow?: (accountAddress: `0x${string}`, durationSeconds: number) => Promise<void>;
  disabled?: boolean;
};

type DraftWhitelistTarget = { name: string; address: string; type: "Contract" | "Wallet" };
type FlowStep = "form" | "processing";

function durationUnitToSeconds(value: string, unit: "D" | "W" | "M") {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid session duration.");
  }

  if (unit === "D") {
    return amount * 24 * 60 * 60;
  }
  if (unit === "W") {
    return amount * 7 * 24 * 60 * 60;
  }

  return amount * 30 * 24 * 60 * 60;
}

export default function EditPolicyModal({
  account,
  onClose,
  onUpdateDailyLimit,
  onUpdateWhitelist,
  onUpdateAgentName,
  onUpdateSpendWindow,
  disabled = false,
}: EditPolicyModalProps) {
  const [step, setStep] = useState<FlowStep>("form");
  const [agentName, setAgentName] = useState(account.name);
  const [dailyLimit, setDailyLimit] = useState(account.dailyLimit.toString());
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("D");
  
  // Track currently active whitelists in local state so removals are draft-only
  const [activeWhitelists, setActiveWhitelists] = useState(account.whitelist);
  // Track which active whitelists are marked for removal
  const [removedWhitelists, setRemovedWhitelists] = useState<
    { name: string; address: string; type: "contract" | "wallet" }[]
  >([]);

  // Draft whitelist targets to be added on-chain
  const [whitelistTargets, setWhitelistTargets] = useState<DraftWhitelistTarget[]>([]);

  // Loading & Error States
  const [processingMessage, setProcessingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateWhitelistTarget = (
    index: number,
    field: keyof DraftWhitelistTarget,
    value: string,
  ) => {
    setWhitelistTargets((current) =>
      current.map((target, currentIndex) =>
        currentIndex === index ? { ...target, [field]: value } : target,
      ),
    );
  };

  const addWhitelistTarget = () => {
    setWhitelistTargets((current) => [...current, { name: "", address: "", type: "Contract" }]);
  };

  const removeWhitelistTarget = (index: number) => {
    setWhitelistTargets((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleDraftRemoveActive = (index: number) => {
    const itemToRemove = activeWhitelists[index];
    if (itemToRemove) {
      setRemovedWhitelists((prev) => [
        ...prev,
        {
          name: itemToRemove.name,
          address: itemToRemove.address,
          type: (itemToRemove.type || "contract") as "contract" | "wallet",
        },
      ]);
      setActiveWhitelists((prev) => prev.filter((_, idx) => idx !== index));
      setSuccessMessage(`Marked "${itemToRemove.name}" for removal. Submit to apply.`);
      window.setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const hasChanges =
    agentName.trim() !== account.name ||
    dailyLimit.trim() !== account.dailyLimit.toString() ||
    durationValue.trim() !== "" ||
    whitelistTargets.some(
      (target) => target.name.trim().length > 0 && target.address.trim().length > 0
    ) ||
    removedWhitelists.length > 0;

  const canSubmit =
    agentName.trim().length > 0 &&
    dailyLimit.trim().length > 0 &&
    (durationValue.trim().length === 0 || !isNaN(Number(durationValue))) &&
    whitelistTargets.every(
      (target) => target.name.trim().length > 0 && target.address.trim().length > 0,
    );

  const handleSubmit = async () => {
    if (!canSubmit || !hasChanges || disabled) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setStep("processing");

    try {
      const targetAddress = account.address as `0x${string}`;

      // 1. Update Agent Name
      if (agentName.trim() !== account.name) {
        setProcessingMessage(`Updating agent name to "${agentName}"...`);
        if (onUpdateAgentName) {
          await onUpdateAgentName(targetAddress, agentName.trim());
        }
      }

      // 2. Update Daily Limit
      if (dailyLimit.trim() !== account.dailyLimit.toString()) {
        setProcessingMessage(`Updating daily limit to ${dailyLimit} USDC...`);
        await onUpdateDailyLimit(targetAddress, dailyLimit.trim());
      }

      // 3. Update Session Duration
      if (durationValue.trim() !== "") {
        setProcessingMessage(`Updating session duration...`);
        if (onUpdateSpendWindow) {
          const durationSeconds = durationUnitToSeconds(durationValue, durationUnit as "D" | "W" | "M");
          await onUpdateSpendWindow(targetAddress, durationSeconds);
        }
      }

      // 4. Add Whitelist Targets
      const validNewTargets = whitelistTargets.filter(
        (t) => t.name.trim().length > 0 && t.address.trim().length > 0
      );

      for (let i = 0; i < validNewTargets.length; i++) {
        const target = validNewTargets[i];
        setProcessingMessage(`Whitelisting target ${i + 1} of ${validNewTargets.length}: "${target.name}"...`);
        const targetType = target.type === "Contract" ? "contract" : "wallet";
        await onUpdateWhitelist(
          targetAddress,
          target.name,
          target.address as `0x${string}`,
          targetType,
          true
        );
      }

      // 5. Process Removed Whitelist Targets on-chain
      for (let i = 0; i < removedWhitelists.length; i++) {
        const target = removedWhitelists[i];
        setProcessingMessage(`Removing target ${i + 1} of ${removedWhitelists.length}: "${target.name}"...`);
        await onUpdateWhitelist(
          targetAddress,
          target.name,
          target.address as `0x${string}`,
          target.type,
          false
        );
      }

      setDurationValue("");
      setWhitelistTargets([]);
      setRemovedWhitelists([]);
      setStep("form");
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update guard policies.");
      setStep("form");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/72 px-4 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#050505] p-6 sm:p-8 overflow-y-auto max-h-[90vh] border border-white/6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="phx-label">Policy Management</p>
            <h2 className="phx-display text-3xl">Manage Guard Policies</h2>
            <p className="phx-body max-w-xl text-sm">
              Adjust parameters and whitelist destinations for <strong className="text-white">{account.name}</strong>. All changes execute natively on-chain.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 transition hover:text-white cursor-pointer"
            aria-label="Close edit policy modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messaging Box */}
        {(errorMessage || successMessage) && step === "form" && (
          <div className="mt-6">
            {errorMessage && (
              <div className="border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-200">
                {successMessage}
              </div>
            )}
          </div>
        )}

        {step === "form" && (
          <div className="mt-8 space-y-6">
            {/* AGENT NAME */}
            <label className="block space-y-2">
              <span className="phx-label">Agent name</span>
              <input
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
                placeholder="Trader Agent"
                className="w-full border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300"
              />
            </label>

            {/* DAILY LIMIT & SESSION DURATION */}
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="phx-label">Daily limit (USDC)</span>
                <input
                  value={dailyLimit}
                  onChange={(event) => setDailyLimit(event.target.value)}
                  placeholder="50"
                  className="w-full border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300"
                />
              </label>

              <label className="space-y-2">
                <span className="phx-label">Session duration</span>
                <div className="grid grid-cols-[3fr_1fr] gap-0">
                  <input
                    value={durationValue}
                    onChange={(event) => setDurationValue(event.target.value)}
                    placeholder="1"
                    className="w-full border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300"
                  />
                  <select
                    value={durationUnit}
                    onChange={(event) => setDurationUnit(event.target.value)}
                    className="border border-l-0 border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                  >
                    <option value="D">D</option>
                    <option value="W">W</option>
                    <option value="M">M</option>
                  </select>
                </div>
              </label>
            </div>

            {/* WHITELIST TARGETS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="phx-label">Whitelist contract / wallet addresses</span>
                <button
                  onClick={addWhitelistTarget}
                  className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Target
                </button>
              </div>

              {whitelistTargets.length > 0 ? (
                <div className="space-y-3">
                  {whitelistTargets.map((target, index) => (
                    <div key={`whitelist-${index}`} className="grid gap-3 sm:grid-cols-[0.55fr_1.15fr_0.5fr_auto]">
                      <input
                        value={target.name}
                        onChange={(event) =>
                          updateWhitelistTarget(index, "name", event.target.value)
                        }
                        placeholder="Uniswap V3 Router"
                        className="w-full border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300"
                      />
                      <input
                        value={target.address}
                        onChange={(event) =>
                          updateWhitelistTarget(index, "address", event.target.value)
                        }
                        placeholder="0xE592427A0AEce92De3Edee1F18E0157C05861564"
                        className="w-full border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300"
                      />
                      <select
                        value={target.type}
                        onChange={(event) =>
                          updateWhitelistTarget(
                            index,
                            "type",
                            event.target.value as DraftWhitelistTarget["type"],
                          )
                        }
                        className="w-full border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                      >
                        <option value="Contract">Contract</option>
                        <option value="Wallet">Wallet</option>
                      </select>
                      <button
                        onClick={() => removeWhitelistTarget(index)}
                        className="inline-flex items-center justify-center border border-white/10 px-4 py-3 text-zinc-400 transition hover:border-red-500 hover:text-red-300"
                        aria-label="Remove whitelist target"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* CURRENT WHITELISTS */}
            <div className="space-y-3 mt-6 border-t border-white/6 pt-6">
              <p className="phx-label">Current Whitelists ({activeWhitelists.length})</p>
              {activeWhitelists.length === 0 ? (
                <p className="text-zinc-500 text-xs py-4 text-center border border-dashed border-white/8">
                  No active whitelist rules configured for this agent.
                </p>
              ) : (
                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                  {activeWhitelists.map((item, index) => {
                    return (
                      <div
                        key={`${item.address}-${index}`}
                        className="flex items-center justify-between border border-white/6 bg-white/[0.01] p-3 text-xs"
                      >
                        <div className="space-y-1 pr-4 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate max-w-[150px]">
                              {item.name}
                            </span>
                            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 capitalize">
                              {item.type || "contract"}
                            </span>
                          </div>
                          <p className="break-all font-[family:var(--font-mono)] text-[11px] text-zinc-500">
                            {item.address}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDraftRemoveActive(index)}
                          disabled={disabled}
                          className="p-2 border border-white/8 text-zinc-400 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          title="Mark for Removal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit & Sign */}
            <div className="flex justify-end pt-4 border-t border-white/6">
              <button
                onClick={() => void handleSubmit()}
                disabled={!hasChanges || !canSubmit || disabled}
                className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                Submit & Sign
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="mt-10 space-y-5">
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-2/3 animate-pulse bg-white" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">{processingMessage || "Awaiting wallet confirmation..."}</p>
              <p className="phx-body text-sm">
                Open RainbowKit / MetaMask and approve the transactions sequentially to update your guard policy on-chain.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
