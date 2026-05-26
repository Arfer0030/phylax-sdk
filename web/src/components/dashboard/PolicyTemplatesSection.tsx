import { Layers3 } from "lucide-react";
import { policyTemplates } from "./dashboard-data";

export default function PolicyTemplatesSection() {
  return (
    <div className="border border-white/10 bg-[#09090b] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            Policy templates
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
            Standardize safe operating envelopes
          </h2>
        </div>
        <Layers3 className="h-5 w-5 text-cyan-300" />
      </div>

      <div className="mt-6 space-y-3">
        {policyTemplates.map((template) => (
          <div
            key={template.name}
            className="border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/20"
          >
            <p className="text-sm font-medium text-white">{template.name}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">{template.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
