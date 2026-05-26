"use client";

import { useRouter } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export default function HomePage() {
  const router = useRouter();

  return (
    <LandingPage
      onNavigateToDashboard={() => router.push("/dashboard")}
      onNavigateToDocs={() => router.push("/docs")}
    />
  );
}
