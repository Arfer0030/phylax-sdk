"use client";

import LandingSectionEyebrow from "./LandingSectionEyebrow";
import { Reveal, StaggerGroup, StaggerItem } from "./MotionReveal";
import { stackProducts } from "./landing-data";

export default function CoreInfrastructureSection() {
  return (
    <section id="infrastructure">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-12">
        <Reveal>
          <LandingSectionEyebrow label="Core infrastructure" />
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <div />
          <Reveal className="lg:col-start-2" delay={0.05}>
            <h2 className="phx-display max-w-4xl text-5xl leading-[0.96] sm:text-6xl lg:text-[4.75rem]">
              The core infrastructure for secure agentic execution
            </h2>
          </Reveal>
        </div>

        <StaggerGroup className="mt-16 grid gap-8 lg:grid-cols-3" delayChildren={0.08} stagger={0.1}>
          {stackProducts.map((product) => (
            <StaggerItem key={product.name} y={34}>
              <div className="space-y-6">
                <div className="h-32 w-32 origin-top-right border-t-4 border-r-4 border-white/90" />
                <h3 className="phx-display text-3xl tracking-[-0.05em]">{product.name}</h3>
                <p className="phx-body max-w-md text-base sm:text-[17px]">
                  {product.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
