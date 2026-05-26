"use client";

import { motion, useScroll, useTransform } from "motion/react";

export default function HeroBackgroundVideo() {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 700], [1.04, 1.12]);
  const y = useTransform(scrollY, [0, 700], [0, 56]);
  const opacity = useTransform(scrollY, [0, 700], [0.65, 0.38]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="h-full w-full blur-[1px]" style={{ scale, y, opacity }}>
        <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="auto">
          <source src="/video/animated-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(10,11,15,0.08),_rgba(10,11,15,0.62)_72%)]" />
      <div className="absolute inset-0 bg-[#0a0b0f]/24" />
    </div>
  );
}
