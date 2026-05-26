"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import HeroBackgroundVideo from "./HeroBackgroundVideo";

type LandingHeroSectionProps = {
  onNavigateToDashboard: () => void;
  onNavigateToDocs: () => void;
};

export default function LandingHeroSection({
  onNavigateToDashboard,
  onNavigateToDocs,
}: LandingHeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <HeroBackgroundVideo />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-7xl flex-col items-center justify-center px-6 py-20 text-center sm:px-10 lg:px-12">
        <div className="max-w-5xl">
          <motion.h1
            className="phx-display mt-8 text-6xl uppercase leading-[0.88] tracking-[-0.08em] sm:text-7xl lg:text-[8.5rem]"
            initial={{ opacity: 0, y: 44, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            The Immutable
            <br />
            Guardian for
            <br />
            AI Agents
          </motion.h1>
          <motion.p
            className="phx-body mx-auto mt-8 max-w-3xl text-base sm:text-[20px]"
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.82, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            Deploy secure ERC-4337 accounts on Arbitrum. Protect assets via on-chain
            guardrails, delegate temporary session keys, and fuel all your AI agents from one
            centralized gas tank.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={onNavigateToDashboard}
              className="inline-flex items-center gap-2 bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-zinc-200"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onNavigateToDocs}
              className="inline-flex items-center gap-2 border border-white/12 bg-white/[0.03] px-8 py-4 text-base font-medium text-white transition hover:border-white/25 hover:bg-white/[0.06]"
            >
              Read docs
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
