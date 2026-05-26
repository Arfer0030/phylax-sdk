import { KeyRound } from "lucide-react";

export default function SessionSignerSection() {
  return (
    <div className="border border-white/10 bg-[#09090b] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="phx-label">Session signer issuance</p>
          <h2 className="phx-display mt-2 text-2xl">
            Generate once, reveal once, enforce on-chain
          </h2>
        </div>
        <KeyRound className="h-5 w-5 text-fuchsia-300" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-white/8 bg-white/[0.03] p-4">
          <p className="phx-label">Step 1</p>
          <p className="mt-3 text-sm font-medium text-white">Issue a session signer secret</p>
          <p className="phx-body mt-2 text-xs leading-5">
            Dashboard creates the delegated signer the AI environment will use instead of the owner
            key.
          </p>
        </div>
        <div className="border border-white/8 bg-white/[0.03] p-4">
          <p className="phx-label">Step 2</p>
          <p className="mt-3 text-sm font-medium text-white">Attach guardrails</p>
          <p className="phx-body mt-2 text-xs leading-5">
            Expiry windows, target whitelists, and daily limits bind that signer on-chain.
          </p>
        </div>
        <div className="border border-white/8 bg-white/[0.03] p-4">
          <p className="phx-label">Step 3</p>
          <p className="mt-3 text-sm font-medium text-white">Hand off to the agent app</p>
          <p className="phx-body mt-2 text-xs leading-5">
            The external AI agent consumes the SDK only after this setup layer is ready.
          </p>
        </div>
      </div>
    </div>
  );
}
