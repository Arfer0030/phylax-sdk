"use client";

import LandingSectionEyebrow from "./LandingSectionEyebrow";
import { Reveal, StaggerGroup, StaggerItem } from "./MotionReveal";
import { integrationStack } from "./landing-data";

export default function IntegrationStackSection() {
  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-12">
        <Reveal>
          <LandingSectionEyebrow label="Integration stack" />
        </Reveal>

        <Reveal className="mt-10" delay={0.05}>
          <h2 className="phx-display max-w-4xl text-5xl leading-[0.96] sm:text-6xl">
            Production-grade architecture powered by the modern EVM stack
          </h2>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" delayChildren={0.06} stagger={0.05}>
          {integrationStack.map((layer) => (
            <StaggerItem key={layer.title} y={24}>
              <div className="group relative flex min-h-[148px] flex-col justify-between overflow-hidden border border-white/6 bg-white/[0.03] p-6 transition hover:border-white">
                <div className="absolute inset-0 translate-x-[-102%] bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0" />
                <span className="phx-label relative z-10 transition duration-300 group-hover:text-black">
                  {layer.tag}
                </span>
                <span className="relative z-10 max-w-[13ch] text-[1.72rem] font-extrabold leading-[1.06] tracking-[-0.05em] text-white transition duration-300 group-hover:text-black sm:text-[1.8rem]">
                  {layer.title}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
