"use client";

import { useMemo, useState, useEffect } from "react";
import Button from "@/components/ui/button-new";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNexus } from "@/providers/NexusProvider";
import { useAccount } from "wagmi";
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
type Recipient = { address: string; share: string };

interface CampaignSplitsFormProps {
  campaignId: string;
  campaignName: string;
  maxAmount: number;
  onSplitComplete?: () => void;
}

export default function CampaignSplitsForm({
  campaignId,
  campaignName,
  maxAmount,
  onSplitComplete,
}: CampaignSplitsFormProps) {
  const { nexusSDK, intentRefCallback, allowanceRefCallback, handleInit } =
    useNexus();
  const { address } = useAccount();
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

    // Validate against campaign raised amount
    if (totalAmountNeeded > maxAmount) {
      setError(
        `Split amount (${totalAmountNeeded}) cannot exceed campaign raised amount (${maxAmount})`
      );
      return;
    }

    console.log(`Total amount to split: ${totalAmountNeeded} ${token}`);
    console.log(`Number of recipients: ${entries.length}`);

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

          failedTransfers.push({
            index: i + 1,
            address: r.address,
            error: errorMessage,
          });
        }
      }

      // Report results
      console.log(
        `Transfer Summary: ${successfulTransfers.length} successful, ${failedTransfers.length} failed`
      );

      if (successfulTransfers.length > 0) {
        console.log("Successful transfers:", successfulTransfers);

        // Save split record to database
        try {
          const splitResponse = await fetch(`/api/campaigns/${campaignId}/splits`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipients: successfulTransfers.map((t) => ({
                address: t.address,
                amount: entries.find((e) => e.address === t.address)?.amount || "0",
              })),
              totalAmount: totalAmountNeeded.toString(),
              splitType: mode,
              transactionHash: "pending", // Will be updated when transaction is confirmed
              userAddress: address,
            }),
          });

          if (splitResponse.ok) {
            console.log("Split record saved to database");
          } else {
            console.error("Failed to save split record");
          }
        } catch (dbError) {
          console.error("Error saving split record:", dbError);
        }
      }

      if (failedTransfers.length > 0) {
        console.log("Failed transfers:", failedTransfers);

        let errorMessage =
          `${successfulTransfers.length} transfers completed successfully, ${failedTransfers.length} failed. ` +
          `Failed transfers: ${failedTransfers
            .map((f) => `#${f.index} (${f.address})`)
            .join(", ")}`;

        setError(errorMessage);
      } else {
        console.log("All transfers completed successfully");
        setSubmitting(false);
        setCurrentTransferIndex(0);
        setTotalTransfers(0);

        // Call completion callback
        if (onSplitComplete) {
          onSplitComplete();
        }
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
      <Card className="w-full max-w-4xl bg-transparent">
        <CardHeader>
          <CardTitle>Split Funds for {campaignName}</CardTitle>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              Nexus SDK Status:{" "}
              {nexusSDK?.isInitialized() ? (
                <span className="text-green-600">✓ Initialized</span>
              ) : (
                <span className="text-red-600">✗ Not Initialized</span>
              )}
            </div>
            <div className="text-blue-600">
              Maximum amount available: {maxAmount.toFixed(6)} {token}
            </div>
            {computedAmounts.length > 0 && (
              <div className="text-yellow-600">
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
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Chain</Label>
              <select
                className="border rounded-md h-10 px-2"
                value={chain ?? SUPPORTED_CHAINS.SEPOLIA}
                onChange={(e) => setChain(Number(e.target.value) as SUPPORTED_CHAINS_IDS)}
              >
                <option value={SUPPORTED_CHAINS.SEPOLIA}>Sepolia</option>
                <option value={SUPPORTED_CHAINS.ARBITRUM_SEPOLIA}>Arbitrum Sepolia</option>
                <option value={SUPPORTED_CHAINS.OPTIMISM_SEPOLIA}>Optimism Sepolia</option>
                <option value={SUPPORTED_CHAINS.BASE_SEPOLIA}>Base Sepolia</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Token</Label>
              <select
                className="border rounded-md h-10 px-2"
                value={token ?? "ETH"}
                onChange={(e) => setToken(e.target.value as SUPPORTED_TOKENS)}
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Total Amount</Label>
              <Input
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="100"
                max={maxAmount}
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
                  {(mode === "percent" || mode === "custom") && (
                    <div className="col-span-3 grid gap-2">
                      <Label htmlFor={`share-${idx}`}>
                        {mode === "percent" ? "Percent %" : "Amount"}
                      </Label>
                      <Input
                        id={`share-${idx}`}
                        value={r.share}
                        onChange={(e) =>
                          updateRecipient(idx, "share", e.target.value)
                        }
                        placeholder={
                          mode === "percent" ? "10" : "25"
                        }
                        className="input-neobrutal"
                      />
                    </div>
                  )}
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
        <div className="mt-4 space-y-4">
          <div className="card-neobrutal p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3">
                  <div className="w-2 h-2 bg-background rounded-full animate-pulse"></div>
                </div>
                Transaction Progress
              </h3>
              {totalTransfers > 0 && (
                <div className="text-sm text-foreground/70">
                  {currentTransferIndex}/{totalTransfers} transfers
                </div>
              )}
            </div>

            {totalTransfers > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-foreground/70 mb-2">
                  <span>Transfer Progress</span>
                  <span>{Math.round((currentTransferIndex / totalTransfers) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 border-2 border-foreground">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(currentTransferIndex / totalTransfers) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {processing && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-background border-2 border-foreground rounded-lg">
                    <div className="text-2xl font-bold text-primary">{processing?.currentStep}</div>
                    <div className="text-sm text-foreground/70">Current Step</div>
                  </div>
                  <div className="text-center p-3 bg-background border-2 border-foreground rounded-lg">
                    <div className="text-2xl font-bold text-primary">{processing?.totalSteps}</div>
                    <div className="text-sm text-foreground/70">Total Steps</div>
                  </div>
                  <div className="text-center p-3 bg-background border-2 border-foreground rounded-lg">
                    <div className="text-lg font-bold text-primary">{processing?.statusText}</div>
                    <div className="text-sm text-foreground/70">Status</div>
                  </div>
                </div>
              </div>
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
