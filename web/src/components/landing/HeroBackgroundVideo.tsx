"use client";

export default function HeroBackgroundVideo() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <video
        className="h-full w-full scale-[1.04] object-cover opacity-65 blur-[1px]"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/video/animated-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(10,11,15,0.08),_rgba(10,11,15,0.62)_72%)]" />
      <div className="absolute inset-0 bg-[#0a0b0f]/24" />
    </div>
  );
}
