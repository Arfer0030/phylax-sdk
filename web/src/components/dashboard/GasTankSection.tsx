import { Wallet } from "lucide-react";
import { gasEvents } from "./dashboard-data";

export default function GasTankSection() {
  return (
    <div className="border border-white/10 bg-[#09090b] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="phx-label">Gas tank treasury</p>
          <h2 className="phx-display mt-2 text-2xl">
            Sponsor gas without touching agent working capital
          </h2>
        </div>
        <Wallet className="h-5 w-5 text-cyan-300" />
      </div>

      <div className="mt-6 grid gap-3">
        {gasEvents.map((event) => (
          <div
            key={event.label}
            className="flex items-start justify-between gap-4 border border-white/8 bg-white/[0.03] p-4"
          >
            <div>
              <p className="text-sm font-medium text-white">{event.label}</p>
              <p className="phx-body mt-1 text-xs leading-5">{event.note}</p>
            </div>
            <p className="text-sm font-medium text-cyan-200">{event.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {["50 USDC", "100 USDC", "250 USDC"].map((preset) => (
          <button
            key={preset}
            className="border border-white/10 px-4 py-3 text-left text-sm text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
          >
            <span className="phx-label block">Quick top up</span>
            <span className="mt-2 block font-medium">{preset}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
