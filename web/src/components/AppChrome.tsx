"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppChromeProps = {
  children: ReactNode;
};

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[#0a0b0f] font-sans text-[#E0E0E0] selection:bg-cyan-400 selection:text-black">
      <header className="sticky top-0 z-50 bg-[#0a0b0f]/54 px-4 py-5 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#0a0b0f]/42 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex select-none items-center gap-4.5 text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl"
          >
            <Image
              src="/images/logo.png"
              alt="Phylax logo"
              width={65}
              height={65}
              className="h-[3.25rem] w-[3.25rem] object-contain"
            />
            <span>PHYLAX</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-5">
            <nav className="hidden items-center gap-7 text-[13px] font-bold text-white lg:flex">
              <Link
                href="/docs"
                className="inline-flex items-center gap-1 transition hover:text-zinc-300"
              >
                Docs
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="https://github.com/Arfer0030/phylax-sdk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 transition hover:text-zinc-300"
              >
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </nav>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-[12px] font-bold text-black transition hover:bg-zinc-200"
            >
              Dashboard
            </Link>

            <div className="flex items-center gap-3 lg:hidden">
              <Link
                href="/docs"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-white transition hover:text-zinc-300"
              >
                Docs
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="https://github.com/Arfer0030/phylax-sdk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-white transition hover:text-zinc-300"
              >
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className={isHome ? "flex-1 bg-[#0a0b0f]" : "flex-1 bg-[#0a0b0f] p-4 sm:p-8"}>
        {children}
      </main>

      {!isHome && (
        <footer className="border-t border-slate-900 bg-black/40 px-6 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-gray-500">
          <span>PHYLAX SECURITY STANDARDS v1.0.4 / DECENTRALIZED POLICIES</span>
        </footer>
      )}
    </div>
  );
}
