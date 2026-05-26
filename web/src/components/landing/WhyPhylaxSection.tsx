import LandingSectionEyebrow from "./LandingSectionEyebrow";
import { whyPhylax } from "./landing-data";

export default function WhyPhylaxSection() {
  return (
    <section id="why-phylax">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-12">
        <LandingSectionEyebrow label="Why Phylax" />

        <div className="mt-10 grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div />
          <div>
            <h2 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-white sm:text-6xl">
              The immutable control layer built for autonomous AI safety
            </h2>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {whyPhylax.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden border border-white/6 bg-white/[0.03] p-8 transition hover:border-white"
            >
              <div className="absolute left-8 top-8 h-3 w-3 rounded-sm bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
              <span className="relative z-10 mb-16 block h-3 w-3 rounded-sm bg-white transition duration-300 group-hover:bg-black" />
              <h3 className="relative z-10 text-4xl font-semibold leading-tight tracking-[-0.06em] text-white transition duration-300 group-hover:text-black">
                {item.title}
              </h3>
              <p className="relative z-10 mt-8 text-lg leading-8 text-zinc-300 transition duration-300 group-hover:text-black/80">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
