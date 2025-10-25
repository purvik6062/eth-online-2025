"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { useNotification } from "@blockscout/app-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/button-new";
import { useNexus } from "@/providers/NexusProvider";
import {
  SUPPORTED_CHAINS,
  type SUPPORTED_CHAINS_IDS,
} from "@avail-project/nexus-core";
import type { Address } from "viem";
import { isAddress } from "viem";
import IntentModal from "@/components/blocks/intent-modal";
import AllowanceModal from "@/components/blocks/allowance-modal";
import useListenTransaction from "@/hooks/useListenTransactions";

type SupportedChainKey = "sepolia" | "arbitrumSepolia";

// Set default chain based on campaign
const getChainFromCampaign = (chainName: string): SUPPORTED_CHAINS_IDS => {
  switch (chainName.toLowerCase()) {
    case "arbitrum":
      return SUPPORTED_CHAINS.ARBITRUM_SEPOLIA;
    case "ethereum":
      return SUPPORTED_CHAINS.SEPOLIA;
    case "polygon":
      return SUPPORTED_CHAINS.POLYGON_AMOY;
    case "base":
      return SUPPORTED_CHAINS.BASE_SEPOLIA;
    case "optimism":
      return SUPPORTED_CHAINS.OPTIMISM_SEPOLIA;
    default:
      return SUPPORTED_CHAINS.SEPOLIA;
  }
};

// Map campaign chain name to component's SupportedChainKey
const getSupportedChainKeyFromCampaign = (
  chainName: string
): SupportedChainKey => {
  switch (chainName.toLowerCase()) {
    case "arbitrum":
      return "arbitrumSepolia";
    // Fallback to Sepolia for any other chain names for now
    default:
      return "sepolia";
  }
};

interface Campaign {
  campaignId: string;
  name: string;
  userAddress: string;
  chain: string;
}

interface RecurringSubscriptionFormProps {
  campaign: Campaign;
  onSuccess: () => void;
}

const CHAIN_CONFIG: Record<
  SupportedChainKey,
  { id: number; name: string; usdc: Address; delegationManager: Address }
> = {
  sepolia: {
    id: 11155111,
    name: "Sepolia",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    delegationManager: "0xe220442A5aEa25dee9194c07396C082468f9f62F",
  },
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    delegationManager: "0x03bd3553E02062D77Fb8Beda2207846063791115",
  },
};

// Minimal ABIs needed
const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

const EIP7702_DELEGATION_MANAGER_ABI = [
  {
    type: "function",
    name: "createSubscription",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "token", type: "address" },
      { name: "amountPerInterval", type: "uint256" },
      { name: "totalAmount", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "interval", type: "uint256" },
      { name: "periods", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
] as const;

export default function RecurringPayments({
  campaign,
  onSuccess,
}: RecurringSubscriptionFormProps) {
  const [campaignChain, setCampaignChain] =
    useState<SUPPORTED_CHAINS_IDS | null>(getChainFromCampaign(campaign.chain));
  const { address, isConnected } = useAccount();
  const { nexusSDK, intentRefCallback, allowanceRefCallback, handleInit } =
    useNexus();
  const { openTxToast } = useNotification();
  const chainId = useChainId();
  const useSponsoredApprovals =
    process.env.NEXT_PUBLIC_NEXUS_USE_SPONSORED_APPROVALS === "true";
  const [destinationChain, setDestinationChain] = useState<SupportedChainKey>(
    getSupportedChainKeyFromCampaign(campaign.chain)
  );
  const [recipient, setRecipient] = useState(campaign.userAddress || "");
  const [amountPerInterval, setAmountPerInterval] = useState("");
  const [periods, setPeriods] = useState("6");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly");
  const [startDate, setStartDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subscriptionCreated, setSubscriptionCreated] = useState(false);

  // Wagmi hooks for contract interactions
  const {
    writeContract: approveContract,
    data: approveHash,
    error: approveError,
  } = useWriteContract();
  const {
    writeContract: createContract,
    data: createHash,
    error: createError,
  } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApprovalConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const { isLoading: isCreating, isSuccess: isCreateConfirmed } =
    useWaitForTransactionReceipt({
      hash: createHash,
    });

  // Show notifications for successful transactions
  useEffect(() => {
    if (isApprovalConfirmed && approveHash) {
      openTxToast(chainId.toString(), approveHash);
    }
  }, [isApprovalConfirmed, approveHash, chainId, openTxToast]);

  useEffect(() => {
    if (isCreateConfirmed && createHash) {
      openTxToast(chainId.toString(), createHash);
    }
  }, [isCreateConfirmed, createHash, chainId, openTxToast]);

  const chain = CHAIN_CONFIG[destinationChain];

  // Only listen to transactions when we're actually submitting
  const { processing, explorerURL } = useListenTransaction({
    sdk: nexusSDK!,
    type: "bridge",
  });

  const total = useMemo(() => {
    if (!amountPerInterval || !periods) return 0;
    return parseFloat(amountPerInterval) * parseInt(periods);
  }, [amountPerInterval, periods]);

  const intervalSeconds = useMemo(() => {
    return frequency === "monthly" ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
  }, [frequency]);

  const periodsNum = parseInt(periods);

  // Lock destination and recipient from campaign props
  useEffect(() => {
    setDestinationChain(getSupportedChainKeyFromCampaign(campaign.chain));
    setRecipient(campaign.userAddress || "");
  }, [campaign]);

  // Monitor approval confirmation and proceed to subscription creation
  useEffect(() => {
    if (
      isApprovalConfirmed &&
      submitting &&
      !isCreating &&
      !subscriptionCreated
    ) {
      console.log("Approval confirmed, proceeding to subscription creation...");
      setStatusText("Step 3/3: Creating subscription...");
      setSubscriptionCreated(true); // Prevent duplicate calls

      // Now create the subscription
      const createSubscription = async () => {
        try {
          const startTime = startDate
            ? Math.floor(new Date(startDate).getTime() / 1000)
            : Math.floor(Date.now() / 1000) + 60; // 1 minute from now

          const amountPerIntervalWei = BigInt(
            Math.floor(parseFloat(amountPerInterval) * 1_000_000)
          );
          const totalAmountWei = BigInt(Math.floor(total * 1_000_000));

          console.log("Creating subscription with params:", {
            recipient,
            token: chain.usdc,
            amountPerInterval: amountPerIntervalWei.toString(),
            totalAmount: totalAmountWei.toString(),
            startTime: startTime,
            interval: intervalSeconds,
            periods: periodsNum,
            currentTime: Math.floor(Date.now() / 1000),
            timeDifference: startTime - Math.floor(Date.now() / 1000),
          });

          await createContract({
            address: chain.delegationManager as `0x${string}`,
            abi: EIP7702_DELEGATION_MANAGER_ABI,
            functionName: "createSubscription",
            args: [
              recipient as `0x${string}`,
              chain.usdc as `0x${string}`,
              amountPerIntervalWei,
              totalAmountWei,
              BigInt(startTime),
              BigInt(intervalSeconds),
              BigInt(periodsNum),
            ],
            value: BigInt(0),
            gas: BigInt(500000),
            chain: { id: chain.id, name: chain.name } as any,
            account: address as `0x${string}`,
          });

          console.log("Subscription creation transaction submitted");
          setStatusText("⏳ Waiting for subscription confirmation...");
        } catch (error) {
          console.error("Error creating subscription:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to create subscription"
          );
          setSubmitting(false);
        }
      };

      createSubscription();
    }
  }, [isApprovalConfirmed, submitting, isCreating, subscriptionCreated]);

  // Monitor subscription creation confirmation
  useEffect(() => {
    if (isCreateConfirmed && submitting) {
      console.log("Subscription created successfully!");
      setStatusText("✅ Subscription created successfully!");
      setSubmitting(false);
      onSuccess();
    }
  }, [isCreateConfirmed, submitting, onSuccess]);

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet");
      return;
    }

    if (!recipient || !isAddress(recipient)) {
      setError("Please enter a valid recipient address");
      return;
    }

    if (!amountPerInterval || parseFloat(amountPerInterval) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!periods || periodsNum <= 0 || periodsNum > 60) {
      setError("Please enter a valid number of periods (1-60)");
      return;
    }

    if (!nexusSDK?.isInitialized()) {
      setError("Nexus SDK is not initialized. Please initialize it first.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setStatusText("");
    setSubscriptionCreated(false); // Reset flag for new submission

    try {
      // Step 1: Bridge/fund USDC to destination chain
      setStatusText(`Step 1/3: Bridging ${total} USDC to ${chain.name}...`);
      console.log("Starting Nexus transfer...");

      const transferResult = await nexusSDK.transfer({
        token: "USDC",
        amount: total,
        chainId: chain.id as unknown as SUPPORTED_CHAINS_IDS,
        recipient: address as Address,
      });

      if (!transferResult?.success) {
        throw new Error("Failed to bridge USDC");
      }

      // Show notification for successful bridge transfer
      if (transferResult?.transactionHash) {
        openTxToast(chainId.toString(), transferResult.transactionHash);
      }

      console.log("Nexus transfer completed:", transferResult);
      setStatusText("✅ Bridge completed successfully");

      // Step 2: Approve USDC to DelegationManager
      setStatusText("Step 2/3: Approving USDC to Delegation Manager...");
      console.log("Starting USDC approval...");

      await approveContract({
        address: chain.usdc as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          chain.delegationManager as `0x${string}`,
          BigInt(Math.floor(total * 1_000_000)),
        ],
        gas: BigInt(100000),
        chain: { id: chain.id, name: chain.name } as any,
        account: address as `0x${string}`,
      });

      console.log("Approval transaction submitted");
      setStatusText("⏳ Waiting for approval confirmation...");

      // The subscription creation will be handled by useEffect after approval is confirmed
      // We don't proceed to subscription creation here - let the useEffect handle it
    } catch (e: any) {
      console.error("Error in handleSubmit:", e);
      setError(e?.message || String(e));
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-lg text-gray-600">Please connect your wallet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Recurring Payment</CardTitle>
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
              Campaign: <span className="font-semibold">{campaign.name}</span>
            </div>
            <div className="text-blue-600">
              Target Chain:{" "}
              <span className="font-semibold">{campaign.chain}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chain Selection */}
          <div className="space-y-2">
            <Label htmlFor="chain">Destination Chain</Label>
            <select
              id="chain"
              className="w-full p-2 border rounded-md"
              value={destinationChain}
              onChange={() => { }}
              disabled
            >
              <option value="sepolia">Sepolia</option>
              <option value="arbitrumSepolia">Arbitrum Sepolia</option>
            </select>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={() => { }}
              readOnly
              disabled
              className="text-black bg-gray-50"
            />
          </div>

          {/* Amount Per Interval */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount Per {frequency === "monthly" ? "Month" : "Week"} (USDC)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amountPerInterval}
              onChange={(e) => setAmountPerInterval(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <select
              id="frequency"
              className="w-full p-2 border rounded-md"
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as "weekly" | "monthly")
              }
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Number of Periods */}
          <div className="space-y-2">
            <Label htmlFor="periods">
              Number of {frequency === "monthly" ? "Months" : "Weeks"}
            </Label>
            <Input
              id="periods"
              type="number"
              min="1"
              max="60"
              value={periods}
              onChange={(e) => setPeriods(e.target.value)}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            {!startDate && (
              <p className="text-sm text-gray-500">
                Defaults to 1 minute from now
              </p>
            )}
          </div>

          {/* Total Amount Display */}
          {total > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Total Amount: {total} USDC</p>
              <p className="text-xs text-gray-600">
                {periods} payments of {amountPerInterval} USDC
              </p>
            </div>
          )}

          {/* Status Messages */}
          {statusText && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{statusText}</p>
            </div>
          )}

          {/* Error Messages */}
          {(error || approveError || createError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                {error || approveError?.message || createError?.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          {!nexusSDK?.isInitialized() ? (
            <Button onClick={handleInit} className="w-full">
              Initialize Nexus SDK
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || isApproving || isCreating}
              className="w-full"
            >
              {submitting || isApproving || isCreating
                ? "Processing..."
                : "Execute Recurring Setup"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Transaction Progress */}
      {(intentRefCallback?.current?.intent || submitting) && (
        <div className="mt-3 text-sm space-y-2">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="font-semibold">Transaction Progress</p>
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

      {/* Modals */}
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
    </div>
  );
}
