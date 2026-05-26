"use client";

import BuiltForSection from "./landing/BuiltForSection";
import CoreInfrastructureSection from "./landing/CoreInfrastructureSection";
import LandingFooter from "./landing/LandingFooter";
import LandingHeroSection from "./landing/LandingHeroSection";
import IntegrationStackSection from "./landing/IntegrationStackSection";
import SponsorsSection from "./landing/SponsorsSection";
import WhyPhylaxSection from "./landing/WhyPhylaxSection";

interface LandingPageProps {
  onNavigateToDashboard: () => void;
  onNavigateToDocs: () => void;
}

export default function LandingPage({
  onNavigateToDashboard,
  onNavigateToDocs,
}: LandingPageProps) {
  return (
    <div className="bg-[#0a0b0f] text-white">
      <LandingHeroSection
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToDocs={onNavigateToDocs}
      />
      <BuiltForSection />
      <CoreInfrastructureSection />
      <IntegrationStackSection />
      <WhyPhylaxSection />
      <SponsorsSection />
      <LandingFooter />
    </div>
  );
}
