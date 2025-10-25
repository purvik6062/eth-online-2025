"use client";

import Link from "next/link";
import { BridgeSwapForm } from "@/components/bridge/BridgeSwapForm";
import { NexusWidgets } from "@/components/bridge/NexusWidgets";
import { useNexus } from "@/providers/NexusProvider";
import ConnectWallet from "@/components/blocks/connect-wallet";
import NexusInitButton from "@/components/nexus-init";
import NexusUnifiedBalance from "@/components/unified-balance";
import UnifiedBalance from "@/components/UnifiedBalance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BridgePage() {
  const { nexusSDK } = useNexus();

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-8 gap-y-6">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <h1 className="text-2xl font-semibold">🌉 Bridge & Transfer</h1>
      </div>

      {nexusSDK?.isInitialized() && 
      <div className="w-full max-w-4xl">
      <UnifiedBalance />
      </div>
      }

      {!nexusSDK?.isInitialized() ? (
        <p className="text-sm text-gray-600">
          Connect wallet and initialize Nexus to begin.
        </p>
      ) : (
        <div className="w-full max-w-4xl">
          <Tabs defaultValue="widgets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="widgets">Nexus Widgets</TabsTrigger>
              <TabsTrigger value="form">Custom Form</TabsTrigger>
            </TabsList>
            <TabsContent value="widgets" className="mt-6">
              <NexusWidgets />
            </TabsContent>
            <TabsContent value="form" className="mt-6">
              <BridgeSwapForm />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
