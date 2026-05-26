"use client";

import { Copy, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

type ProvisionAgentModalProps = {
  open: boolean;
  onClose: () => void;
};

type FlowStep = "form" | "processing" | "revealed";
type DraftWhitelistTarget = { name: string; address: string };

function generateSessionKey() {
  const chars = "abcdef0123456789";
  let value = "0x";

  for (let index = 0; index < 64; index += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }

  return value;
}

export default function ProvisionAgentModal({
  open,
  onClose,
}: ProvisionAgentModalProps) {
  const [step, setStep] = useState<FlowStep>("form");
  const [agentName, setAgentName] = useState("");
  const [dailyLimit, setDailyLimit] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("D");
  const [whitelistTargets, setWhitelistTargets] = useState<DraftWhitelistTarget[]>([
    { name: "", address: "" },
  ]);
  const [copiedSessionKey, setCopiedSessionKey] = useState(false);
  const sessionKey = useMemo(() => generateSessionKey(), []);

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    setStep("processing");
    window.setTimeout(() => {
      setStep("revealed");
    }, 1400);
  };

  const handleClose = () => {
    setStep("form");
    setAgentName("");
    setDailyLimit("");
    setDurationValue("");
    setDurationUnit("D");
    setWhitelistTargets([{ name: "", address: "" }]);
    setCopiedSessionKey(false);
    onClose();
  };

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
    setWhitelistTargets((current) => [...current, { name: "", address: "" }]);
  };

  const removeWhitelistTarget = (index: number) => {
    setWhitelistTargets((current) =>
      current.length === 1 ? current : current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const canSubmit =
    agentName.trim().length > 0 &&
    dailyLimit.trim().length > 0 &&
    durationValue.trim().length > 0 &&
    whitelistTargets.every(
      (target) => target.name.trim().length > 0 && target.address.trim().length > 0,
    );

  const handleCopySessionKey = async () => {
    try {
      await navigator.clipboard.writeText(sessionKey);
      setCopiedSessionKey(true);
      window.setTimeout(() => {
        setCopiedSessionKey(false);
      }, 1200);
    } catch {
      setCopiedSessionKey(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/72 px-4 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#050505] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="phx-label">Provision agent</p>
            <h2 className="phx-display text-3xl">
              {step === "revealed" ? "Session signer generated" : "Provision new guarded account"}
            </h2>
            <p className="phx-body max-w-xl text-sm">
              {step === "revealed"
                ? "Store this signer securely. The owner wallet stays isolated while the delegated session key inherits the on-chain guardrail envelope."
                : "Define a bounded execution envelope, then sign the setup transaction from your owner wallet."}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-zinc-400 transition hover:text-white"
            aria-label="Close provision modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "form" && (
          <div className="mt-8 space-y-6">
            <label className="block space-y-2">
              <span className="phx-label">Agent name</span>
              <input
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
                placeholder="Trader Agent"
                className="w-full border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300"
              />
            </label>

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
                    placeholder="24"
                    className="w-full border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300"
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="phx-label">Whitelist contract addresses</span>
                <button
                  onClick={addWhitelistTarget}
                  className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Target
                </button>
              </div>

              <div className="space-y-3">
                {whitelistTargets.map((target, index) => (
                  <div key={`whitelist-${index}`} className="grid gap-3 sm:grid-cols-[0.7fr_1.3fr_auto]">
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
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
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
              <p className="text-lg font-semibold text-white">Awaiting wallet confirmation</p>
              <p className="phx-body text-sm">
                Open RainbowKit / MetaMask and approve the smart account setup transaction.
              </p>
            </div>
          </div>
        )}

        {step === "revealed" && (
          <div className="mt-8 space-y-5">
            <div className="border border-white/10 bg-[#111111] p-5">
              <p className="phx-label">One-time reveal</p>
              <div className="mt-4 flex items-start justify-between gap-4">
                <code className="block overflow-x-auto font-[family:var(--font-mono)] text-sm font-bold text-white">
                  PHYLAX_AI_SESSION_PRIVATE_KEY = {sessionKey}
                </code>
                <button
                  onClick={() => void handleCopySessionKey()}
                  className="group relative shrink-0 text-zinc-400 transition hover:text-white"
                  aria-label="Copy session private key"
                >
                  <Copy className="h-4 w-4" />
                  <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap border border-white/10 bg-[#111111] px-2 py-1 text-[10px] font-medium text-zinc-200 opacity-0 transition duration-200 group-hover:opacity-100">
                    {copiedSessionKey ? "Copied" : "Copy"}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2 border border-amber-500/20 bg-amber-500/8 p-4">
              <p className="text-sm font-semibold text-amber-200">Security Notice</p>
              <p className="text-sm leading-6 text-amber-100/80">
                Copy this private key now. Phylax encrypts this session key natively on-chain. For
                your safety, it will never be displayed again once you close this window.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
