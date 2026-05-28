"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown } from "lucide-react";

function truncateLabel(value: string) {
  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function PhylaxConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        authenticationStatus,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account !== undefined &&
          chain !== undefined &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-[12px] font-bold text-black transition hover:bg-zinc-200"
            >
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className="inline-flex items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-[12px] font-bold text-red-200 transition hover:border-red-400 hover:bg-red-500/15"
            >
              Wrong Network
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-black transition hover:bg-zinc-200 shadow-sm cursor-pointer"
          >
            <span>{truncateLabel(account.displayName)}</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
