"use client";

import LandingSectionEyebrow from "./LandingSectionEyebrow";
import { Reveal, StaggerGroup, StaggerItem } from "./MotionReveal";
import { sponsorGroups } from "./landing-data";

function SponsorWordmark({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center text-white tracking-[-0.05em] ${className ?? ""}`}
    >
      {name}
    </div>
  );
}

export default function SponsorsSection() {
  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-12">
        <div className="space-y-10">
          <Reveal>
            <LandingSectionEyebrow label="Sponsors" />
          </Reveal>

          <div className="space-y-12">
            <div className="space-y-6">
              <Reveal delay={0.04}>
                <p className="phx-label">Collaborator</p>
              </Reveal>
              <StaggerGroup className="grid gap-6 md:grid-cols-2" delayChildren={0.06} stagger={0.08}>
                {sponsorGroups.collaborator.map((name, index) => (
                  <StaggerItem key={name} y={24}>
                    <div className="flex min-h-[150px] items-center px-6 py-8">
                      <SponsorWordmark
                        name={name}
                        className={
                          index === 0
                            ? "text-5xl font-semibold sm:text-6xl"
                            : "text-6xl font-black uppercase italic sm:text-7xl"
                        }
                      />
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>

            <div className="space-y-6">
              <Reveal delay={0.04}>
                <p className="phx-label">Infrastructure</p>
              </Reveal>
              <StaggerGroup className="grid gap-6 md:grid-cols-2" delayChildren={0.06} stagger={0.08}>
                {sponsorGroups.infrastructure.map((name) => (
                  <StaggerItem key={name} y={24}>
                    <div className="flex min-h-[120px] items-center px-6 py-8">
                      <SponsorWordmark name={name} className="text-4xl font-bold sm:text-5xl" />
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>

            <div className="space-y-6">
              <Reveal delay={0.04}>
                <p className="phx-label">Ecosystem</p>
              </Reveal>
              <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" delayChildren={0.05} stagger={0.05}>
                {sponsorGroups.ecosystem.map((name, index) => (
                  <StaggerItem key={name} y={18}>
                    <div className="flex min-h-[104px] items-center px-6 py-6">
                      <SponsorWordmark
                        name={name}
                        className={
                          index % 3 === 0
                            ? "text-[2rem] font-semibold"
                            : index % 3 === 1
                              ? "text-[2.1rem] font-medium"
                              : "text-[1.95rem] font-bold"
                        }
                      />
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
