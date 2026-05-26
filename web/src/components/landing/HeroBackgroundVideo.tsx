"use client";

import { motion, useScroll, useTransform } from "motion/react";

export default function HeroBackgroundVideo() {
  const { scrollY } = useScroll();
  
  // Smooth scroll-linked parallax transformations
  const scale = useTransform(scrollY, [0, 700], [1.02, 1.08]);
  const y = useTransform(scrollY, [0, 700], [0, 48]);
  const opacity = useTransform(scrollY, [0, 700], [0.55, 0.28]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0a0b0f]">
      {/* 1. Underlying Video Asset with high-end atmospheric blur */}
      <motion.div className="h-full w-full blur-[2px]" style={{ scale, y, opacity }}>
        <video className="h-full w-full object-cover animate-[pulse_10s_ease-in-out_infinite]" autoPlay muted loop playsInline preload="auto">
          <source src="/video/animated-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* 2. Cybernetic Dot Matrix Grid Pattern (Web3 Industry Standard Grid) */}
      <div 
        className="absolute inset-0 z-10 opacity-45"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.22) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* 3. Atmospheric Vignette (Fades video into background darkness near boundaries) */}
      <div 
        className="absolute inset-0 z-20"
        style={{
          background: "radial-gradient(circle at center, rgba(10, 11, 15, 0) 15%, rgba(10, 11, 15, 0.72) 65%, #0a0b0f 100%)",
        }}
      />

      {/* 4. Seamless Bottom Horizon Gradient Fade (Lowered to keep hero buttons bright) */}
      <div className="absolute inset-x-0 bottom-0 h-[120px] z-30 bg-gradient-to-b from-transparent to-[#0a0b0f]" />
    </div>
  );
}
