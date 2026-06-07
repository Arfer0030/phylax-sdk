"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal, StaggerGroup, StaggerItem } from "./MotionReveal";

export default function LandingFooter() {
  return (
    <footer>
      <StaggerGroup
        className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[1.15fr_0.78fr_0.78fr_0.78fr_0.62fr] lg:px-12"
        delayChildren={0.04}
        stagger={0.08}
      >
        <StaggerItem>
          <div className="space-y-8">
          <div className="inline-flex items-center gap-5">
            <Image
              src="/images/logo.png"
              alt="Phylax logo"
                width={68}
                height={68}
                className="h-[4.25rem] w-[4.25rem] object-contain"
              />
              <h2 className="phx-display text-5xl leading-[0.96]">Phylax</h2>
            </div>
            <p className="phx-body max-w-sm text-lg leading-8">
              The immutable guardian for autonomous AI agents.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Platform</h3>
            <div className="space-y-3 text-lg text-zinc-400">
              <Link
                href="/dashboard"
                target="_self"
                className="block transition hover:text-white"
              >
                App Dashboard
              </Link>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <div className="space-y-3 text-lg text-zinc-400">
              <Link
                href="/docs"
                target="_self"
                className="block transition hover:text-white"
              >
                Documentation
              </Link>
              <a
                href="https://github.com/Arfer0030/phylax-sdk"
                target="_blank"
                rel="noreferrer"
                className="block transition hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/@phylax-sdk/sdk"
                target="_blank"
                rel="noreferrer"
                className="block transition hover:text-white"
              >
                Phylax SDK (NPM)
              </a>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Socials</h3>
            <div className="space-y-3 text-lg text-zinc-400">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="block transition hover:text-white"
              >
                X
              </a>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Ecosystem</h3>
            <div className="space-y-3 text-lg text-zinc-400">
              <a
                href="https://arbitrum.io/"
                target="_blank"
                rel="noreferrer"
                className="block transition hover:text-white"
              >
                Arbitrum Sepolia
              </a>
              <a
                href="https://www.pimlico.io/"
                target="_blank"
                rel="noreferrer"
                className="block transition hover:text-white"
              >
                Pimlico Bundler
              </a>
              <a
                href="https://docs.erc4337.io/index.html"
                target="_blank"
                rel="noreferrer"
                className="block transition hover:text-white"
              >
                ERC-4337 Standard
              </a>
            </div>
          </div>
        </StaggerItem>
      </StaggerGroup>

      <Reveal className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8 text-base text-zinc-500 sm:px-10 lg:px-12">
        <span>&copy; 2026 Phylax. All rights reserved.</span>
        <span>Built for bounded AI safety on Arbitrum.</span>
      </Reveal>
    </footer>
  );
}
