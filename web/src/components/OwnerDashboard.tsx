"use client";

import DashboardHeroSection from "./dashboard/DashboardHeroSection";
import GasTankSection from "./dashboard/GasTankSection";
import PolicyTemplatesSection from "./dashboard/PolicyTemplatesSection";
import SessionSignerSection from "./dashboard/SessionSignerSection";
import SmartAccountRegistrySection from "./dashboard/SmartAccountRegistrySection";

export default function OwnerDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DashboardHeroSection />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
        <GasTankSection />
        <SmartAccountRegistrySection />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SessionSignerSection />
        <PolicyTemplatesSection />
      </section>
    </div>
  );
}
