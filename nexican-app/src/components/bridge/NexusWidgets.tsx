"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BridgeButton,
  TransferButton,
  SwapButton,
  BridgeAndExecuteButton,
  useNexus,
  SUPPORTED_CHAINS,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { useNexus as useNexicanNexus } from "@/providers/NexusProvider";
import { useNexusWidgetsContext } from "@/providers/NexusWidgetsProvider";
import { useAccount, useChainId } from "wagmi";
import { parseUnits } from "viem";

export function NexusWidgets() {
  const { nexusSDK } = useNexicanNexus();
  const { initializeSdk, isSdkInitialized } = useNexus();
  const { network, isReady } = useNexusWidgetsContext();
  const { status, address, isConnected } = useAccount();
  const chainId = useChainId();
  const [loading, setLoading] = useState(false);

  // Check if we're on a testnet
  const isTestnet = chainId === 11155111 || chainId === 421614; // Sepolia or Arbitrum Sepolia

  // Log connection status for debugging
  useEffect(() => {
    console.log("NexusWidgets - Wallet Status:", {
      status,
      isConnected,
      address,
      chainId,
      isTestnet,
      network,
      isReady,
      nexusSDKInitialized: nexusSDK?.isInitialized(),
      nexusWidgetsInitialized: isSdkInitialized,
    });
  }, [
    status,
    isConnected,
    address,
    chainId,
    isTestnet,
    network,
    isReady,
    nexusSDK?.isInitialized(),
    isSdkInitialized,
  ]);

  const handleInitializeSDK = async () => {
    if (isSdkInitialized) return;
    setLoading(true);
    try {
      await initializeSdk();
    } catch (error) {
      console.error("Unable to initialize SDK:", error);
    } finally {
      setLoading(false);
    }
  };

  const widgetButtonClick = async (onClick: () => void) => {
    if (!isSdkInitialized) {
      await handleInitializeSDK();
    }
    onClick();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">🌉 Bridge & Transfer</h2>
        <p className="text-muted-foreground">
          Use the integrated Nexus widgets for seamless bridging, transfers, and
          swaps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bridge Widget */}
        <Card className="border-2 hover:border-primary/20 transition-colors">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Bridge Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <BridgeButton>
              {({ onClick, isLoading }) => (
                <Button
                  onClick={() => widgetButtonClick(onClick)}
                  disabled={isLoading || loading}
                  className="w-full font-bold !text-white"
                  size="lg"
                >
                  {loading
                    ? "Initializing..."
                    : isLoading
                    ? "Loading..."
                    : "Open Bridge"}
                </Button>
              )}
            </BridgeButton>
          </CardContent>
        </Card>

        {/* Transfer Widget */}
        <Card className="border-2 hover:border-primary/20 transition-colors">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Transfer Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <TransferButton>
              {({ onClick, isLoading }) => (
                <Button
                  onClick={() => widgetButtonClick(onClick)}
                  disabled={isLoading || loading}
                  className="w-full font-bold !text-white"
                  size="lg"
                >
                  {loading
                    ? "Initializing..."
                    : isLoading
                    ? "Loading..."
                    : "Open Transfer"}
                </Button>
              )}
            </TransferButton>
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {nexusSDK?.isInitialized() ? (
            <span className="text-green-600">
              ✓ Nexus Core SDK is initialized
            </span>
          ) : (
            <span className="text-yellow-600">
              ⚠ Connect wallet to initialize Nexus
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          Wallet: {status} | Chain: {chainId} | Testnet:{" "}
          {isTestnet ? "Yes" : "No"}
        </p>
        <p className="text-xs text-muted-foreground">
          Network: {network} | Ready: {isReady ? "Yes" : "No"}
        </p>
        <p className="text-xs text-muted-foreground">
          Nexus Widgets: {isSdkInitialized ? "Ready" : "Not Ready"}
        </p>
      </div>
    </div>
  );
}
