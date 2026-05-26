"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppChromeProps = {
  children: ReactNode;
};

function navClass(active: boolean, activeClass: string) {
  return `cursor-pointer transition-all pb-1 hover:text-white ${
    active ? activeClass : "text-gray-500 opacity-60 hover:opacity-100"
  }`;
}

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isDashboard = pathname === "/dashboard";
  const isDocs = pathname === "/docs" || pathname === "/doc";

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#E0E0E0] font-sans flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <header className="border-b border-slate-900/80 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-baseline shrink-0 gap-4 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-0 right-10 w-[200px] h-[80px] bg-gradient-to-br from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-10 w-[200px] h-[80px] bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link
            href="/"
            className="text-5xl sm:text-7xl font-sans font-black tracking-tighter leading-none text-white cursor-pointer select-none block"
          >
            PHYLAX
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 animate-pulse">
              .
            </span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.4em] font-semibold text-gray-500 mt-1.5 font-mono select-none">
            The Immutable Guardian for AI Agents
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] font-bold uppercase tracking-widest font-mono relative z-10">
          <Link
            href="/"
            className={navClass(
              isHome,
              "text-cyan-400 border-b-2 border-cyan-400"
            )}
          >
            01 Home
          </Link>

          <Link
            href="/dashboard"
            className={navClass(
              isDashboard,
              "text-fuchsia-400 border-b-2 border-fuchsia-500"
            )}
          >
            02 Control Panel
          </Link>

          <Link
            href="/docs"
            className={navClass(
              isDocs,
              "text-purple-400 border-b-2 border-purple-500"
            )}
          >
            03 Documentation
          </Link>

          <span className="opacity-30 border-l border-slate-800 pl-4 hidden md:inline text-gray-500">
            Arbitrum Sepolia Testnet
          </span>
        </nav>
      </header>

      <main className="flex-1 bg-[#050505] p-4 sm:p-8">{children}</main>

      <footer className="border-t border-slate-900 py-4 px-6 text-center text-[10px] font-mono text-gray-500 uppercase tracking-wider bg-black/40">
        <span>PHYLAX SECURITY STANDARDS v1.0.4 • DECENTRALIZED POLICIES</span>
      </footer>
    </div>
  );
}
