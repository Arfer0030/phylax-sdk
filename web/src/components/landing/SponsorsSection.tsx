"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import LandingSectionEyebrow from "./LandingSectionEyebrow";
import { Reveal, StaggerGroup, StaggerItem } from "./MotionReveal";

// ============================================================================
// Sponsor Layout Mode Configuration
// Set to "marquee" for the Infinite Kinetic Marquee with Portal Glow (New Style)
// Set to "rotation" for the Rotational Index Highlighting (Previous Style)
// ============================================================================
const ANIMATION_MODE: "marquee" | "rotation" = "marquee";

const curatedSponsors = {
  collaborators: [
    { name: "Arbitrum", logo: "/images/arbitrum.svg", width: 230, height: 90 },
    { name: "Pimlico", logo: "/images/pimlico.svg", width: 210, height: 32 }
  ],
  infrastructure: [
    { name: "Viem", logo: "/images/viem.svg", width: 125, height: 46 },
    { name: "Foundry", logo: "/images/foundry.svg", width: 85, height: 85 },
    { name: "Etherscan", logo: "/images/etherscan.svg", width: 175, height: 40 }
  ],
  ecosystem: [
    { name: "Uniswap", logo: "/images/uniswap.svg", width: 140, height: 35 },
    { name: "Aave", logo: "/images/aave.svg", width: 180, height: 30 },
    { name: "OpenZeppelin", logo: "/images/oppenzeppelin.svg", width: 195, height: 35 },
    { name: "Rainbow", logo: "/images/rainbow.svg", width: 145, height: 35 }
  ]
};

// ----------------------------------------------------------------------------
// Sponsor Card Component (Used by both modes)
// ----------------------------------------------------------------------------
function SponsorCard({
  name,
  logo,
  width,
  height,
  isActive,
  onHoverStart,
  onHoverEnd,
}: {
  name: string;
  logo: string;
  width: number;
  height: number;
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  return (
    <motion.div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className="relative flex items-center justify-center cursor-pointer overflow-hidden px-5 py-3 rounded-md"
      animate={{
        y: isActive ? -4 : 0,
        scale: isActive ? 1.05 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Premium Sliding Reflection Shine Effect */}
      {isActive && (
        <motion.div
          className="absolute inset-y-0 w-1/3 pointer-events-none skew-x-12"
          initial={{ left: "-150%" }}
          animate={{ left: "150%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 50%, transparent)",
            zIndex: 20,
          }}
        />
      )}

      <Image
        src={logo}
        alt={`${name} logo`}
        width={width}
        height={height}
        className="object-contain transition-all duration-500 relative z-10"
        style={{
          filter: isActive ? "grayscale(0%) brightness(1.15)" : "grayscale(100%) brightness(0.65)",
          opacity: isActive ? 1 : 0.45,
        }}
      />
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Primary Sponsors Section
// ----------------------------------------------------------------------------
export default function SponsorsSection() {
  // --- Rotation Mode State ---
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Slow rotational index highlight shift (Only used in "rotation" mode)
  useEffect(() => {
    if (ANIMATION_MODE !== "rotation" || hoveredIndex !== null) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 9);
    }, 1500);

    return () => clearInterval(interval);
  }, [hoveredIndex]);

  // --- Marquee Mode State ---
  const [marqueeHovered1, setMarqueeHovered1] = useState<number | null>(null);
  const [marqueeHovered2, setMarqueeHovered2] = useState<number | null>(null);

  const row1Items = [...curatedSponsors.collaborators, ...curatedSponsors.infrastructure];
  // Triple items list to support seamless infinite -33.33% sliding animation
  const row1ItemsTripled = [...row1Items, ...row1Items, ...row1Items];

  const row2Items = [...curatedSponsors.ecosystem];
  const row2ItemsTripled = [...row2Items, ...row2Items, ...row2Items];

  // Render Marquee Mode
  if (ANIMATION_MODE === "marquee") {
    return (
      <section className="relative overflow-hidden py-24">
        {/* Scoped CSS styling for hardware-accelerated infinite scrolling */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-ltr {
            0% { transform: translateX(-33.3333%); }
            100% { transform: translateX(0%); }
          }
          @keyframes marquee-rtl {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-33.3333%); }
          }
          .animate-marquee-ltr {
            display: flex;
            width: max-content;
            animation: marquee-ltr 28s linear infinite;
          }
          .animate-marquee-rtl {
            display: flex;
            width: max-content;
            animation: marquee-rtl 28s linear infinite;
          }
          .marquee-container:hover .animate-marquee-ltr,
          .marquee-container:hover .animate-marquee-rtl {
            animation-play-state: paused;
          }
        `}} />

        {/* Backdrop Ambient Cyber Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/2 rounded-full blur-[140px] pointer-events-none" />

        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
          <Reveal>
            <LandingSectionEyebrow label="Sponsors" />
          </Reveal>
        </div>

        {/* Infinite Kinetic Sliding Container */}
        <div className="marquee-container relative w-full mt-14 space-y-16 select-none overflow-hidden py-10">
          
          {/* Side Fades (Portal Glow mask) */}
          <div className="absolute -inset-y-10 left-0 w-24 sm:w-48 bg-gradient-to-r from-[#0a0b0f] via-[#0a0b0f]/80 to-transparent z-30 pointer-events-none" />
          <div className="absolute -inset-y-10 right-0 w-24 sm:w-48 bg-gradient-to-l from-[#0a0b0f] via-[#0a0b0f]/80 to-transparent z-30 pointer-events-none" />

          {/* Row 1: Right-to-Left (Collaborators + Infrastructure) */}
          <div className="relative flex overflow-hidden">
            <div className="animate-marquee-rtl flex gap-12 sm:gap-20 items-center">
              {row1ItemsTripled.map((sponsor, idx) => {
                const isItemActive = marqueeHovered1 === idx;
                return (
                  <div key={`${sponsor.name}-row1-${idx}`} className="flex items-center justify-center min-w-[200px]">
                    <SponsorCard
                      {...sponsor}
                      isActive={isItemActive}
                      onHoverStart={() => setMarqueeHovered1(idx)}
                      onHoverEnd={() => setMarqueeHovered1(null)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2: Left-to-Right (DeFi Ecosystem) */}
          <div className="relative flex overflow-hidden">
            <div className="animate-marquee-ltr flex gap-12 sm:gap-20 items-center">
              {row2ItemsTripled.map((sponsor, idx) => {
                const isItemActive = marqueeHovered2 === idx;
                return (
                  <div key={`${sponsor.name}-row2-${idx}`} className="flex items-center justify-center min-w-[180px]">
                    <SponsorCard
                      {...sponsor}
                      isActive={isItemActive}
                      onHoverStart={() => setMarqueeHovered2(idx)}
                      onHoverEnd={() => setMarqueeHovered2(null)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    );
  }

  // Render Rotation Mode (Default / Revert Option)
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-12">
        <div className="space-y-10">
          <Reveal>
            <LandingSectionEyebrow label="Sponsors" />
          </Reveal>

          <div className="space-y-14">
            {/* 1. Core Collaborators */}
            <div className="space-y-6">
              <Reveal delay={0.02}>
                <p className="phx-label">Collaborator</p>
              </Reveal>
              <StaggerGroup className="grid gap-6 md:grid-cols-2" delayChildren={0.04} stagger={0.06}>
                {curatedSponsors.collaborators.map((sponsor, idx) => {
                  const globalIdx = idx;
                  const isActive = hoveredIndex === null ? activeIndex === globalIdx : hoveredIndex === globalIdx;
                  return (
                    <StaggerItem key={sponsor.name} y={20}>
                      <div className="flex min-h-[150px] items-center justify-center px-6 py-8">
                        <SponsorCard
                          {...sponsor}
                          isActive={isActive}
                          onHoverStart={() => setHoveredIndex(globalIdx)}
                          onHoverEnd={() => setHoveredIndex(null)}
                        />
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            </div>

            {/* 2. Infrastructure Stack */}
            <div className="space-y-6">
              <Reveal delay={0.02}>
                <p className="phx-label">Infrastructure</p>
              </Reveal>
              <StaggerGroup className="grid gap-6 md:grid-cols-3" delayChildren={0.04} stagger={0.06}>
                {curatedSponsors.infrastructure.map((sponsor, idx) => {
                  const globalIdx = 2 + idx;
                  const isActive = hoveredIndex === null ? activeIndex === globalIdx : hoveredIndex === globalIdx;
                  return (
                    <StaggerItem key={sponsor.name} y={16}>
                      <div className="flex min-h-[120px] items-center justify-center px-6 py-8">
                        <SponsorCard
                          {...sponsor}
                          isActive={isActive}
                          onHoverStart={() => setHoveredIndex(globalIdx)}
                          onHoverEnd={() => setHoveredIndex(null)}
                        />
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            </div>

            {/* 3. DeFi & Ecosystem */}
            <div className="space-y-6">
              <Reveal delay={0.02}>
                <p className="phx-label">Ecosystem</p>
              </Reveal>
              <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" delayChildren={0.04} stagger={0.05}>
                {curatedSponsors.ecosystem.map((sponsor, idx) => {
                  const globalIdx = 5 + idx;
                  const isActive = hoveredIndex === null ? activeIndex === globalIdx : hoveredIndex === globalIdx;
                  return (
                    <StaggerItem key={sponsor.name} y={12}>
                      <div className="flex min-h-[104px] items-center justify-center px-6 py-6">
                        <SponsorCard
                          {...sponsor}
                          isActive={isActive}
                          onHoverStart={() => setHoveredIndex(globalIdx)}
                          onHoverEnd={() => setHoveredIndex(null)}
                        />
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
