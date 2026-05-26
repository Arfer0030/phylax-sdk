import LandingSectionEyebrow from "./LandingSectionEyebrow";
import { integrationStack } from "./landing-data";

export default function IntegrationStackSection() {
  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-12">
        <LandingSectionEyebrow label="Integration stack" />

        <div className="mt-10">
          <h2 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-white sm:text-6xl">
            Production-grade architecture powered by the modern EVM stack
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {integrationStack.map((layer) => (
            <div
              key={layer.title}
              className="group relative flex min-h-[148px] flex-col justify-between overflow-hidden border border-white/6 bg-white/[0.03] p-6 transition hover:border-white"
            >
              <div className="absolute inset-0 translate-x-[-102%] bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0" />
              <span className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 transition duration-300 group-hover:text-black">
                {layer.tag}
              </span>
              <span className="relative z-10 max-w-[12ch] text-[2rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white transition duration-300 group-hover:text-black">
                {layer.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
