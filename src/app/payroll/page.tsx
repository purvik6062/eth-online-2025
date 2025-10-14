"use client";

import Link from "next/link";
import { useNexus } from "@/providers/NexusProvider";
import ConnectWallet from "@/components/blocks/connect-wallet";
import NexusInitButton from "@/components/nexus-init";
import PayrollForm from "@/components/payroll/PayrollForm";

export default function PayrollPage() {
  const { nexusSDK } = useNexus();

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-8 gap-y-6">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <h1 className="text-2xl font-semibold">CrossPayX Payroll</h1>
        <Link href="/" className="underline">
          Home
        </Link>
      </div>

      <div className="flex gap-x-4 items-center">
        <ConnectWallet />
        <NexusInitButton />
      </div>

      {!nexusSDK?.isInitialized() ? (
        <p className="text-sm text-gray-600">
          Connect wallet and initialize Nexus to begin.
        </p>
      ) : (
        <div className="w-full max-w-3xl">
          <PayrollForm />
        </div>
      )}
    </div>
  );
}
