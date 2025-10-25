"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNexus } from "@/providers/NexusProvider";
import {
  SUPPORTED_CHAINS,
  type SUPPORTED_CHAINS_IDS,
  type SUPPORTED_TOKENS,
} from "@avail-project/nexus-core";
import ChainSelect from "@/components/blocks/chain-select";
import TokenSelect from "@/components/blocks/token-select";
// Removed unused imports for cleaner code
import { TransactionStatus } from "@/components/bridge/TransactionStatus";

export function BridgeSwapForm() {
  const { nexusSDK, handleInit } = useNexus();

  // Form state
  const [sourceChain, setSourceChain] = useState<SUPPORTED_CHAINS_IDS | null>(
    SUPPORTED_CHAINS.SEPOLIA
  );
  const [destinationChain, setDestinationChain] =
    useState<SUPPORTED_CHAINS_IDS | null>(null);
  const [sourceToken, setSourceToken] = useState<SUPPORTED_TOKENS | null>(
    "ETH"
  );
  const [amount, setAmount] = useState<string>("");

  // Transaction state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Balance state
  const [unifiedBalance, setUnifiedBalance] = useState<any[] | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch unified balance
  const fetchUnifiedBalance = async () => {
    if (!nexusSDK?.isInitialized()) return;

    try {
      setIsLoadingBalance(true);
      const balance = await nexusSDK.getUnifiedBalances();
      setUnifiedBalance(balance);
    } catch (error) {
      console.error("Error fetching unified balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Auto-fetch balance when SDK initializes
  useEffect(() => {
    if (nexusSDK?.isInitialized()) {
      fetchUnifiedBalance();
    }
  }, [nexusSDK?.isInitialized()]);

  // Clear errors and success messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Handle bridge transaction
  const handleBridge = async () => {
    if (
      !nexusSDK?.isInitialized() ||
      !sourceToken ||
      !destinationChain ||
      !amount
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      clearMessages();

      console.log("Starting bridge transaction:", {
        token: sourceToken,
        amount,
        chainId: destinationChain,
      });

      const result = await nexusSDK.bridge({
        token: sourceToken,
        amount,
        chainId: destinationChain,
      });

      if (result?.success) {
        setSuccess(
          `Successfully bridged ${amount} ${sourceToken} to ${destinationChain}`
        );
        setTransactionHash(result.transactionHash || null);
        await fetchUnifiedBalance(); // Refresh balance
      } else {
        setError("Bridge transaction failed");
      }
    } catch (error) {
      console.error("Bridge error:", error);
      setError(
        error instanceof Error ? error.message : "Bridge transaction failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return !!(sourceToken && destinationChain && amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">🌉 Bridge Tokens</h2>
        <p className="text-muted-foreground">
          Transfer your tokens across different chains seamlessly
        </p>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Section */}
        <Card className="border-2 hover:border-primary/20 transition-colors">
          <CardHeader>
            <CardTitle className="text-center text-lg">From</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Source Chain */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Source Chain</Label>
              <ChainSelect
                selectedChain={sourceChain ?? SUPPORTED_CHAINS.SEPOLIA}
                handleSelect={setSourceChain}
                isTestnet
              />
            </div>

            {/* Source Token */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Token</Label>
              <TokenSelect
                selectedChain={(
                  sourceChain ?? SUPPORTED_CHAINS.SEPOLIA
                ).toString()}
                selectedToken={sourceToken ?? "ETH"}
                handleTokenSelect={setSourceToken}
                isTestnet
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Destination Section */}
        <Card className="border-2 hover:border-primary/20 transition-colors">
          <CardHeader>
            <CardTitle className="text-center text-lg">To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Destination Chain */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Destination Chain</Label>
              <ChainSelect
                selectedChain={destinationChain ?? SUPPORTED_CHAINS.SEPOLIA}
                handleSelect={setDestinationChain}
                isTestnet
              />
            </div>

            {/* Destination Token (same as source for bridge) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Token</Label>
              <div className="p-3 border rounded-md bg-muted/50 text-center">
                <span className="text-sm text-muted-foreground">
                  {sourceToken || "Select source token first"}
                </span>
              </div>
            </div>

            {/* Amount Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount</Label>
              <div className="p-3 border rounded-md bg-muted/50 text-center">
                <span className="text-sm text-muted-foreground">
                  {amount || "0.0"} {sourceToken || ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Section */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Submit Button */}
            <Button
              onClick={handleBridge}
              disabled={
                !isFormValid() || isSubmitting || !nexusSDK?.isInitialized()
              }
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              {isSubmitting ? "Bridging..." : "Bridge Tokens"}
            </Button>

            {/* SDK Status */}
            {!nexusSDK?.isInitialized() && (
              <div className="text-center">
                <Button onClick={handleInit} variant="outline" size="lg">
                  Initialize Nexus SDK
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Status */}
      <TransactionStatus
        error={error}
        success={success}
        transactionHash={transactionHash}
        isLoading={isSubmitting}
      />
    </div>
  );
}
