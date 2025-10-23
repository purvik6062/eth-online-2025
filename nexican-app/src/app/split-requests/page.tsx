"use client";

import Link from "next/link";
import { useNexus } from "@/providers/NexusProvider";
import ConnectWallet from "@/components/blocks/connect-wallet";
import NexusInitButton from "@/components/nexus-init";
import NexusUnifiedBalance from "@/components/unified-balance";
import RequestCreateForm from "@/components/splitRequests/RequestCreateForm";

export default function SplitRequestsPage() {
  const { nexusSDK } = useNexus();

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-8 gap-y-6">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <h1 className="text-2xl font-semibold">Split Requests (Incoming)</h1>
        <nav className="flex gap-4">
          <Link href="/" className="underline">
            Home
          </Link>
          <Link href="/splits" className="underline">
            Splits
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
        <div className="w-full max-w-3xl">
          <RequestCreateForm />
        </div>
      )}
    </div>
  );
}
