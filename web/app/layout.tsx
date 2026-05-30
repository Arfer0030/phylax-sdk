import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import AppChrome from "@/components/AppChrome";
import Web3Providers from "@/components/providers/Web3Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Phylax - The Immutable Guardian for Autonomous AI Agents",
  description:
    "Deploy secure ERC-4337 accounts on Arbitrum with on-chain guardrails, temporary session keys, and centralized gas tanks for autonomous AI agents.",
  openGraph: {
    title: "Phylax - The Immutable Guardian for Autonomous AI Agents",
    description:
      "Deploy secure ERC-4337 accounts on Arbitrum with on-chain guardrails, temporary session keys, and centralized gas tanks for autonomous AI agents.",
    images: [
      {
        url: "/images/og-banner.png",
        alt: "Phylax Open Graph Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phylax - The Immutable Guardian for Autonomous AI Agents",
    description:
      "Deploy secure ERC-4337 accounts on Arbitrum with on-chain guardrails, temporary session keys, and centralized gas tanks for autonomous AI agents.",
    images: ["/images/og-banner.png"],
  },
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetBrainsMono.variable}`}>
        <Web3Providers>
          <AppChrome>{children}</AppChrome>
        </Web3Providers>
      </body>
    </html>
  );
}
