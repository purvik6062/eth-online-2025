"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChainSelect from "@/components/blocks/chain-select";
import TokenSelect from "@/components/blocks/token-select";
import { useNexus } from "@/providers/NexusProvider";
import type { Address } from "viem";
import {
  SUPPORTED_CHAINS,
  type SUPPORTED_CHAINS_IDS,
  type SUPPORTED_TOKENS,
} from "@avail-project/nexus-core";
import IntentModal from "@/components/blocks/intent-modal";
import AllowanceModal from "@/components/blocks/allowance-modal";
import useListenTransaction from "@/hooks/useListenTransactions";

type ShareMode = "equal" | "percent" | "custom";
type Recipient = { address: string; share: string }; // share is amount for custom, percent for percent, ignored for equal

export default function SplitsForm() {
  const { nexusSDK, intentRefCallback, allowanceRefCallback, handleInit } =
    useNexus();
  const useSponsoredApprovals =
    process.env.NEXT_PUBLIC_NEXUS_USE_SPONSORED_APPROVALS === "true";
  const [chain, setChain] = useState<SUPPORTED_CHAINS_IDS | null>(
    SUPPORTED_CHAINS.SEPOLIA
  );
  const [token, setToken] = useState<SUPPORTED_TOKENS | null>("ETH");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [mode, setMode] = useState<ShareMode>("equal");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: "", share: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [currentTransferIndex, setCurrentTransferIndex] = useState<number>(0);
  const [totalTransfers, setTotalTransfers] = useState<number>(0);
  const [retryFailedTransfers, setRetryFailedTransfers] =
    useState<boolean>(false);
  const [unifiedBalance, setUnifiedBalance] = useState<any[] | null>(null);

  // Only listen to transactions when we're actually submitting
  const { processing, explorerURL } = useListenTransaction({
    sdk: nexusSDK!,
    type: "bridge",
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const computedAmounts = useMemo(() => {
    const entries = recipients.filter((r) => r.address);
    const total = parseFloat(totalAmount || "0");
    if (!entries.length || !total)
      return [] as { address: string; amount: string }[];
    if (mode === "equal") {
      const each = (total / entries.length).toString();
      return entries.map((r) => ({ address: r.address, amount: each }));
    }
    if (mode === "percent") {
      return entries.map((r) => ({
        address: r.address,
        amount: ((parseFloat(r.share || "0") / 100) * total).toString(),
      }));
    }
    // custom absolute amounts
    return entries.map((r) => ({ address: r.address, amount: r.share || "0" }));
  }, [recipients, totalAmount, mode]);

  const updateRecipient = (
    index: number,
    key: keyof Recipient,
    value: string
  ) => {
    setRecipients((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addRecipient = () =>
    setRecipients((prev) => [...prev, { address: "", share: "" }]);
  const removeRecipient = (index: number) =>
    setRecipients((prev) => prev.filter((_, i) => i !== index));

  // Fetch unified balance
  const fetchUnifiedBalance = async () => {
    if (!nexusSDK?.isInitialized()) return;
    try {
      const balance = await nexusSDK.getUnifiedBalances();
      setUnifiedBalance(balance);
    } catch (error) {
      console.error("Error fetching unified balance:", error);
    }
  };

  // Auto-fetch balance when component mounts or SDK initializes
  useEffect(() => {
    if (nexusSDK?.isInitialized()) {
      fetchUnifiedBalance();
    }
  }, [nexusSDK?.isInitialized()]);

  // Debug: Log unified balance when it changes
  useEffect(() => {
    if (unifiedBalance) {
      console.log("Unified Balance:", unifiedBalance);
      console.log(
        "Tokens with balance:",
        unifiedBalance.filter((token) => parseFloat(token.balance) > 0)
      );
    }
  }, [unifiedBalance]);

  const handleSubmit = async () => {
    if (!nexusSDK || !nexusSDK.isInitialized() || !chain || !token) {
      setError(
        "Nexus SDK is not initialized. Please ensure your wallet is connected."
      );
      return;
    }
    const entries = computedAmounts.filter((r) => r.address && r.amount);
    if (entries.length === 0) {
      setError("Please add at least one recipient with a valid address.");
      return;
    }

    // Calculate total amount needed
    const totalAmountNeeded = entries.reduce((sum, entry) => {
      return sum + parseFloat(entry.amount || "0");
    }, 0);

    console.log(`Total amount needed: ${totalAmountNeeded} ${token}`);
    console.log(`Number of recipients: ${entries.length}`);

    // Validate against unified balance (chain-abstracted)
    try {
      const unified = await nexusSDK.getUnifiedBalances();
      const tokenBalance = unified?.find((t) => t.symbol === token);
      const availableUnified = tokenBalance
        ? parseFloat(tokenBalance.balance)
        : 0;
      if (availableUnified < totalAmountNeeded) {
        setError(
          `Insufficient unified balance for ${token}. You have ${availableUnified} ${token} across all chains but need ${totalAmountNeeded} ${token}.`
        );
        return;
      }
    } catch (balanceError) {
      console.log("Could not fetch unified balance:", balanceError);
    }

    setSubmitting(true);
    setError(null);
    setTotalTransfers(entries.length);
    setCurrentTransferIndex(0);

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setSubmitting(false);
      setError("Transaction timeout. Please try again.");
    }, 300000); // 5 minutes timeout
    setTimeoutId(timeout);

    try {
      // Process transfers sequentially with proper delays and error handling
      const successfulTransfers = [];
      const failedTransfers = [];

      for (let i = 0; i < entries.length; i++) {
        const r = entries[i];
        setCurrentTransferIndex(i + 1);
        console.log(
          `Processing transfer ${i + 1}/${entries.length} to ${r.address}`
        );

        try {
          // Add a small delay between transfers to avoid conflicts
          if (i > 0) {
            console.log(`Waiting 2 seconds before next transfer...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          // Check if SDK is still initialized before each transfer
          if (!nexusSDK?.isInitialized()) {
            console.log("SDK not initialized, attempting to reinitialize...");
            await handleInit();
            // Wait a bit more after reinitialization
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          // Keep previous refs to allow modals to render when hooks fire

          // Use direct transfer method
          const result = await nexusSDK.transfer({
            token,
            amount: r.amount,
            chainId: chain,
            recipient: r.address as Address,
          });

          console.log(`Transfer ${i + 1} result:`, result);

          if (result?.success) {
            successfulTransfers.push({
              index: i + 1,
              address: r.address,
              result,
            });
            console.log(`Transfer ${i + 1} completed successfully`);
          } else {
            failedTransfers.push({
              index: i + 1,
              address: r.address,
              error: (result as any)?.error || "Unknown error",
            });
            console.error(`Transfer ${i + 1} failed:`, (result as any)?.error);
          }
        } catch (transferError) {
          console.error(`Transfer ${i + 1} error:`, transferError);
          const errorMessage =
            transferError instanceof Error
              ? transferError.message
              : "Unknown error";

          // Check if it's a balance issue
          const isBalanceError =
            errorMessage.toLowerCase().includes("insufficient balance") ||
            errorMessage.toLowerCase().includes("insufficient funds");

          failedTransfers.push({
            index: i + 1,
            address: r.address,
            error: isBalanceError
              ? `Insufficient balance for ${r.amount} ${token} transfer`
              : errorMessage,
          });
        }
      }

      // Report results
      console.log(
        `Transfer Summary: ${successfulTransfers.length} successful, ${failedTransfers.length} failed`
      );

      if (successfulTransfers.length > 0) {
        console.log("Successful transfers:", successfulTransfers);
      }

      if (failedTransfers.length > 0) {
        console.log("Failed transfers:", failedTransfers);

        // Check if any failures are due to balance issues
        const balanceErrors = failedTransfers.filter(
          (f) =>
            f.error.toLowerCase().includes("insufficient balance") ||
            f.error.toLowerCase().includes("insufficient funds")
        );

        let errorMessage =
          `${successfulTransfers.length} transfers completed successfully, ${failedTransfers.length} failed. ` +
          `Failed transfers: ${failedTransfers
            .map((f) => `#${f.index} (${f.address})`)
            .join(", ")}`;

        if (balanceErrors.length > 0) {
          errorMessage +=
            `\n\n💡 Balance Issue: ${balanceErrors.length} transfers failed due to insufficient balance. ` +
            `Make sure you have enough ${token} for all transfers. ` +
            `Consider reducing the amounts or adding more funds to your wallet.`;
        }

        setError(errorMessage);

        // Don't set submitting to false if some transfers succeeded
        if (successfulTransfers.length > 0) {
          console.log(
            "Some transfers succeeded, keeping process active for retry option"
          );
        }
      } else {
        console.log("All transfers completed successfully");
        setSubmitting(false);
        setCurrentTransferIndex(0);
        setTotalTransfers(0);
      }
    } catch (e) {
      console.error("Split submission failed", e);
      setError(
        e instanceof Error ? e.message : "Transaction failed. Please try again."
      );
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      setSubmitting(false);
      setCurrentTransferIndex(0);
      setTotalTransfers(0);
    }
  };

  return (
    <>
      <Card className="w-full max-w-3xl bg-transparent">
        <CardHeader>
          <CardTitle>Create Split</CardTitle>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              Nexus SDK Status:{" "}
              {nexusSDK?.isInitialized() ? (
                <span className="text-green-600">✓ Initialized</span>
              ) : (
                <span className="text-red-600">✗ Not Initialized</span>
              )}
            </div>
            {computedAmounts.length > 0 && (
              <div className="text-blue-600">
                Total to distribute:{" "}
                {computedAmounts
                  .reduce(
                    (sum, entry) => sum + parseFloat(entry.amount || "0"),
                    0
                  )
                  .toFixed(6)}{" "}
                {token}
                {computedAmounts.length > 1 && (
                  <div className="text-yellow-600 text-xs mt-1">
                    ⚠️ Make sure you have enough balance for all{" "}
                    {computedAmounts.length} transfers
                  </div>
                )}
              </div>
            )}

            {/* Unified Balance Display */}
            {unifiedBalance && (
              <div className="bg-green-50 p-3 rounded-md mt-2">
                <div className="text-sm font-semibold text-green-800 mb-2">
                  💰 Your Unified Balance
                </div>
                <div className="space-y-1">
                  {unifiedBalance
                    .filter((token) => parseFloat(token.balance) > 0)
                    .slice(0, 3)
                    .map((token) => (
                      <div
                        key={token.symbol}
                        className="flex justify-between text-xs"
                      >
                        <span>{token.symbol}</span>
                        <span className="font-medium">
                          ${token.balanceInFiat.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  {unifiedBalance.filter(
                    (token) => parseFloat(token.balance) > 0
                  ).length > 3 && (
                    <div className="text-xs text-gray-600">
                      +
                      {unifiedBalance.filter(
                        (token) => parseFloat(token.balance) > 0
                      ).length - 3}{" "}
                      more assets
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Chain</Label>
              <ChainSelect
                selectedChain={chain ?? SUPPORTED_CHAINS.SEPOLIA}
                handleSelect={setChain}
                isTestnet
              />
            </div>
            <div className="grid gap-2">
              <Label>Token</Label>
              <TokenSelect
                selectedChain={(chain ?? SUPPORTED_CHAINS.SEPOLIA).toString()}
                selectedToken={token ?? "ETH"}
                handleTokenSelect={setToken}
                isTestnet
              />
            </div>
            <div className="grid gap-2">
              <Label>Total Amount</Label>
              <Input
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="grid gap-2">
              <Label>Share Mode</Label>
              <select
                className="border rounded-md h-10 px-2"
                value={mode}
                onChange={(e) => setMode(e.target.value as ShareMode)}
              >
                <option value="equal">Equal</option>
                <option value="percent">Percentage</option>
                <option value="custom">Custom amounts</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Recipients</Label>
            <div className="grid gap-3">
              {recipients.map((r, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-7 grid gap-2">
                    <Label htmlFor={`addr-${idx}`}>Address</Label>
                    <Input
                      id={`addr-${idx}`}
                      value={r.address}
                      onChange={(e) =>
                        updateRecipient(idx, "address", e.target.value)
                      }
                      placeholder="0x..."
                    />
                  </div>
                  <div className="col-span-3 grid gap-2">
                    <Label htmlFor={`share-${idx}`}>
                      {mode === "percent"
                        ? "Percent %"
                        : mode === "custom"
                        ? "Amount"
                        : ""}
                    </Label>
                    <Input
                      id={`share-${idx}`}
                      value={r.share}
                      onChange={(e) =>
                        updateRecipient(idx, "share", e.target.value)
                      }
                      placeholder={
                        mode === "percent"
                          ? "10"
                          : mode === "custom"
                          ? "25"
                          : ""
                      }
                      disabled={mode === "equal"}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => removeRecipient(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div>
                <Button type="button" onClick={addRecipient}>
                  Add recipient
                </Button>
              </div>
            </div>
          </div>

          {computedAmounts.length > 0 && (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium mb-2">Preview</p>
              <ul className="list-disc pl-5 space-y-1">
                {computedAmounts.map((a) => (
                  <li key={a.address}>
                    {a.address} ← {a.amount} {token}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
              {error}
              {error.includes("failed") && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRetryFailedTransfers(true);
                      setError(null);
                      handleSubmit();
                    }}
                    disabled={submitting}
                  >
                    Retry Failed Transfers
                  </Button>
                </div>
              )}
            </div>
          )}
          {!nexusSDK?.isInitialized() ? (
            <Button onClick={handleInit} className="w-full">
              Initialize Nexus SDK
            </Button>
          ) : (
            <Button disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Submitting..." : "Execute Split"}
            </Button>
          )}
        </CardFooter>
      </Card>
      {(intentRefCallback?.current?.intent || submitting) && (
        <div className="mt-3 text-sm space-y-2">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="font-semibold">Transaction Progress</p>
            {totalTransfers > 0 && (
              <p className="font-semibold">
                Transfer Progress: {currentTransferIndex}/{totalTransfers}
              </p>
            )}
            {processing && (
              <>
                <p className="font-semibold">
                  Total Steps: {processing?.totalSteps}
                </p>
                <p className="font-semibold">
                  Status: {processing?.statusText}
                </p>
                <p className="font-semibold">
                  Progress: {processing?.currentStep}
                </p>
              </>
            )}
          </div>
        </div>
      )}
      {intentRefCallback?.current?.intent && (
        <IntentModal intent={intentRefCallback?.current} />
      )}
      {useSponsoredApprovals && allowanceRefCallback?.current && (
        <AllowanceModal data={allowanceRefCallback.current} />
      )}
      {explorerURL && (
        <div className="mt-3">
          <a
            href={(explorerURL ?? undefined) as unknown as string}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            View on Explorer
          </a>
        </div>
      )}
    </>
  );
}
