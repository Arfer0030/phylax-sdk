import { Coins, Plus, Shield, Sparkles } from "lucide-react";

export default function DashboardHeroSection() {
  return (
    <section className="overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(51,184,198,0.18),_transparent_34%),linear-gradient(180deg,_rgba(10,10,12,0.96),_rgba(4,4,5,1))]">
      <div className="grid gap-8 px-6 py-7 lg:grid-cols-[1.4fr_0.9fr] lg:px-8 lg:py-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-[family:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-200">
            <Shield className="h-3.5 w-3.5" />
            Owner workspace
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="phx-display text-4xl sm:text-5xl">
                Dashboard
              </h1>
              <span className="phx-label border border-white/10 px-2.5 py-1 text-zinc-400">
                Arbitrum Sepolia
              </span>
            </div>

            <p className="phx-body max-w-3xl text-sm sm:text-[15px]">
              Phylax gives owners one place to provision smart accounts, fund gas tanks, issue
              session signers, and define execution envelopes before any AI agent touches capital.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200">
              <Plus className="h-4 w-4" />
              Create smart account
            </button>
            <button className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/5">
              <Coins className="h-4 w-4" />
              Top up gas tank
            </button>
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            <div className="border border-white/8 bg-white/5 p-4">
              <p className="phx-label">Sponsored balance</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.06em] text-white">
                318.95 USDC
              </p>
              <p className="phx-body mt-2 text-xs leading-5">
                Centralized gas tank reserved for account-abstraction settlement and markup.
              </p>
            </div>
            <div className="border border-white/8 bg-white/5 p-4">
              <p className="phx-label">Active smart accounts</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.06em] text-white">3</p>
              <p className="phx-body mt-2 text-xs leading-5">
                Each account maps to a separate AI role with isolated rules and working capital.
              </p>
            </div>
            <div className="border border-white/8 bg-white/5 p-4">
              <p className="phx-label">Session signers</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.06em] text-white">
                2 active / 1 paused
              </p>
              <p className="phx-body mt-2 text-xs leading-5">
                Owner-issued signer secrets are revealed once, then enforced by on-chain policy.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="phx-label">Deployment status</p>
              <h2 className="mt-2 text-lg font-medium text-white">Infrastructure ready</h2>
            </div>
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="space-y-4 pt-4 text-sm text-zinc-300">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="phx-label">EntryPoint</p>
                <p className="mt-1 font-medium text-white">0x5FF1...2789</p>
              </div>
              <span className="phx-badge border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-300">
                Connected
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="phx-label">Paymaster + gas tank</p>
                <p className="mt-1 font-medium text-white">Custom settlement active</p>
              </div>
              <span className="phx-badge border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-cyan-200">
                Live
              </span>
            </div>

            <div>
              <p className="phx-label">Factory registry</p>
              <p className="phx-body mt-1 text-sm leading-6 text-zinc-300">
                Dashboard is the owner setup surface. AI agents consume the SDK after this
                provisioning layer is in place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
