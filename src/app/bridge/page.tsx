"use client";

import Link from "next/link";
import { BridgeSwapForm } from "@/components/bridge/BridgeSwapForm";
import { useNexus } from "@/providers/NexusProvider";
import ConnectWallet from "@/components/blocks/connect-wallet";
import NexusInitButton from "@/components/nexus-init";
import NexusUnifiedBalance from "@/components/unified-balance";

export default function BridgePage() {
  const { nexusSDK } = useNexus();

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-8 gap-y-6">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <h1 className="text-2xl font-semibold">🌉 Bridge & Swap</h1>
        <nav className="flex gap-4">
          <Link href="/" className="underline">
            Home
          </Link>
          <Link href="/splits" className="underline">
            Splits
          </Link>
          <Link href="/split-requests" className="underline">
            Split Requests
          </Link>
        </nav>
      </div>

      <div className="flex gap-x-4 items-center">
        <ConnectWallet />
        <NexusInitButton />
      </div>

      {nexusSDK?.isInitialized() && <NexusUnifiedBalance />}

      {!nexusSDK?.isInitialized() ? (
        <p className="text-sm text-gray-600">
          Connect wallet and initialize Nexus to begin.
        </p>
      ) : (
        <div className="w-full max-w-4xl">
          <BridgeSwapForm />
        </div>
      )}
    </div>
  );
}
