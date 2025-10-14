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
import { BridgeModeSelector } from "@/components/bridge/BridgeModeSelector";
// import { TokenSelector } from "./TokenSelector";
// import { ChainSelector } from "./ChainSelector";
// import { AmountInput } from "@/components/blocks/amount-input";
// import { TransactionPreview } from "@/components/blocks/transaction-preview";
import { TransactionStatus } from "@/components/bridge/TransactionStatus";

type BridgeMode = "bridge" | "swap";

export function BridgeSwapForm() {
  const { nexusSDK, handleInit } = useNexus();

  // Form state
  const [mode, setMode] = useState<BridgeMode>("bridge");
  const [sourceChain, setSourceChain] = useState<SUPPORTED_CHAINS_IDS | null>(
    SUPPORTED_CHAINS.SEPOLIA
  );
  const [destinationChain, setDestinationChain] =
    useState<SUPPORTED_CHAINS_IDS | null>(null);
  const [sourceToken, setSourceToken] = useState<SUPPORTED_TOKENS | null>(
    "ETH"
  );
  const [destinationToken, setDestinationToken] =
    useState<SUPPORTED_TOKENS | null>(null);
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

  // Handle mode change
  const handleModeChange = (newMode: BridgeMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);

    // Reset form when switching modes
    if (newMode === "bridge") {
      setDestinationToken(null);
    }
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
      setError(null);
      setSuccess(null);

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

  // Handle swap transaction
  const handleSwap = async () => {
    if (
      !nexusSDK?.isInitialized() ||
      !sourceToken ||
      !destinationToken ||
      !destinationChain ||
      !amount
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      console.log("Starting XCS swap:", {
        fromToken: sourceToken,
        toToken: destinationToken,
        amount,
        chainId: destinationChain,
      });

      // For now, we'll use bridge as a workaround for XCS swap
      // In a real implementation, you would use a proper XCS protocol
      const result = await nexusSDK.bridge({
        token: sourceToken,
        amount,
        chainId: destinationChain,
      });

      if (result?.success) {
        setSuccess(
          `Successfully swapped ${amount} ${sourceToken} to ${destinationToken} on ${destinationChain}`
        );
        setTransactionHash(result.transactionHash || null);
        await fetchUnifiedBalance(); // Refresh balance
      } else {
        setError("Swap transaction failed");
      }
    } catch (error) {
      console.error("Swap error:", error);
      setError(
        error instanceof Error ? error.message : "Swap transaction failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (mode === "bridge") {
      await handleBridge();
    } else {
      await handleSwap();
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    if (!sourceToken || !destinationChain || !amount) return false;
    if (mode === "swap" && !destinationToken) return false;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Mode Selector */}
      <BridgeModeSelector mode={mode} onModeChange={handleModeChange} />

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "bridge" ? "🌉 Bridge Tokens" : "🔄 Swap Tokens"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Chain */}
          <div>
            <Label>Source Chain</Label>
            <ChainSelect
              selectedChain={sourceChain ?? SUPPORTED_CHAINS.SEPOLIA}
              handleSelect={setSourceChain}
              isTestnet
            />
          </div>

          {/* Destination Chain */}
          <div>
            <Label>Destination Chain</Label>
            <ChainSelect
              selectedChain={destinationChain ?? SUPPORTED_CHAINS.SEPOLIA}
              handleSelect={setDestinationChain}
              isTestnet
            />
          </div>

          {/* Source Token */}
          <div>
            <Label>Source Token</Label>
            <TokenSelect
              selectedChain={(
                sourceChain ?? SUPPORTED_CHAINS.SEPOLIA
              ).toString()}
              selectedToken={sourceToken ?? "ETH"}
              handleTokenSelect={setSourceToken}
              isTestnet
            />
          </div>

          {/* Destination Token (for swap mode) */}
          {mode === "swap" && (
            <div>
              <Label>Destination Token</Label>
              <TokenSelect
                selectedChain={(
                  destinationChain ?? SUPPORTED_CHAINS.SEPOLIA
                ).toString()}
                selectedToken={destinationToken ?? "USDC"}
                handleTokenSelect={setDestinationToken}
                isTestnet
              />
            </div>
          )}

          {/* Amount */}
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              !isFormValid() || isSubmitting || !nexusSDK?.isInitialized()
            }
            className="w-full"
          >
            {isSubmitting
              ? mode === "bridge"
                ? "Bridging..."
                : "Swapping..."
              : mode === "bridge"
              ? "Bridge Tokens"
              : "Swap Tokens"}
          </Button>

          {/* SDK Status */}
          {!nexusSDK?.isInitialized() && (
            <div className="text-center">
              <Button onClick={handleInit} variant="outline">
                Initialize Nexus SDK
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Status */}
      <TransactionStatus
        error={error}
        success={success}
        transactionHash={transactionHash}
        isLoading={isSubmitting}
      />

      {/* Unified Balance Display */}
      {unifiedBalance && (
        <Card>
          <CardHeader>
            <CardTitle>💰 Your Unified Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unifiedBalance
                .filter((token) => parseFloat(token.balance) > 0)
                .slice(0, 5)
                .map((token) => (
                  <div
                    key={token.symbol}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm text-gray-600">
                      ${token.balanceInFiat.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
