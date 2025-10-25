"use client";

import { NexusProvider } from "@avail-project/nexus-widgets";
import { useNexus as useNexicanNexus } from "./NexusProvider";
import { useAccount } from "wagmi";
import { useEffect, useState, createContext, useContext, useMemo } from "react";
import type { NexusNetwork } from "@avail-project/nexus-widgets";

// Network context similar to widgets Web3Provider
interface NexusWidgetsContextValue {
  network: NexusNetwork;
  setNetwork: React.Dispatch<React.SetStateAction<NexusNetwork>>;
  isReady: boolean;
}

const NexusWidgetsContext = createContext<NexusWidgetsContextValue | null>(
  null
);

// This provider wraps the nexus-widgets with the existing nexus core integration
export function NexusWidgetsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { nexusSDK } = useNexicanNexus();
  const { status, address, isConnected } = useAccount();
  const [isReady, setIsReady] = useState(false);
  const [network, setNetwork] = useState<NexusNetwork>("testnet");

  useEffect(() => {
    console.log(
      "NexusWidgetsProvider - Status:",
      status,
      "NexusSDK:",
      nexusSDK?.isInitialized(),
      "Address:",
      address,
      "Network:",
      network
    );
    if (nexusSDK?.isInitialized() && status === "connected") {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [nexusSDK?.isInitialized(), status, address, network]);

  const value = useMemo(
    () => ({
      network,
      setNetwork,
      isReady,
    }),
    [network, isReady]
  );

  return (
    <NexusWidgetsContext.Provider value={value}>
      <NexusProvider
        config={{
          debug: true,
          network: "testnet", // Use dynamic network from context
        }}
      >
        {children}
      </NexusProvider>
    </NexusWidgetsContext.Provider>
  );
}

export function useNexusWidgetsContext() {
  const context = useContext(NexusWidgetsContext);
  if (!context) {
    throw new Error(
      "useNexusWidgetsContext must be used within a NexusWidgetsProvider"
    );
  }
  return context;
}
