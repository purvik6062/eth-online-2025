"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import { toast } from "react-hot-toast";
import {
  SUPPORTED_CHAINS,
  type SUPPORTED_CHAINS_IDS,
  CHAIN_METADATA,
} from "@avail-project/nexus-core";
import type { Address } from "viem";
import { isAddress } from "viem";
import IntentModal from "@/components/blocks/intent-modal";
import AllowanceModal from "@/components/blocks/allowance-modal";
import useListenTransaction from "@/hooks/useListenTransactions";

type SupportedChainKey =
  | "sepolia"
  | "arbitrumSepolia"
  | "baseSepolia"
  | "optimismSepolia";

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
    case "base":
      return "baseSepolia";
    case "optimism":
      return "optimismSepolia";
    // Fallback to Sepolia for any other chain names for now
    default:
      return "sepolia";
  }
};

// Helper function to get chain ID from SupportedChainKey
const getChainIdFromSupportedKey = (
  key: SupportedChainKey
): SUPPORTED_CHAINS_IDS => {
  switch (key) {
    case "sepolia":
      return SUPPORTED_CHAINS.SEPOLIA;
    case "arbitrumSepolia":
      return SUPPORTED_CHAINS.ARBITRUM_SEPOLIA;
    case "baseSepolia":
      return SUPPORTED_CHAINS.BASE_SEPOLIA;
    case "optimismSepolia":
      return SUPPORTED_CHAINS.OPTIMISM_SEPOLIA;
    default:
      return SUPPORTED_CHAINS.SEPOLIA;
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
    delegationManager: "0x9E89b0F0049e22E679C3A3bE4938DF1dCc08ec15",
  },
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    delegationManager: "0x9edE152D33D7450E08B8eAec6bDA5E7D1F98F45d",
  },
  baseSepolia: {
    id: 84532,
    name: "Base Sepolia",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    delegationManager: "0x5C009421fb32B13Ac739E1fe95a4f6Ff4C132882",
  },
  optimismSepolia: {
    id: 11155420,
    name: "Optimism Sepolia",
    usdc: "0x5fd84259d66Cd46123540766Be93DFE2D0b02CC2",
    delegationManager: "0x32dDe10DBD35910Be56CdcDc47353488F798b8bb",
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
  const [transactionCompleted, setTransactionCompleted] = useState(false);

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

      // Store subscription data in database
      const storeSubscription = async () => {
        try {
          const response = await fetch("/api/subscriptions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              campaignId: campaign.campaignId,
              subscriberAddress: address,
              recipientAddress: recipient,
              paymentToken: "USDC",
              amountPerPayment: amountPerInterval,
              paymentFrequency: frequency,
              numberOfPayments: periods,
              startDate: startDate || new Date(Date.now() + 60 * 1000), // 1 minute from now if no start date
              status: "active",
            }),
          });

          const result = await response.json();
          if (result.success) {
            console.log("Subscription stored in database:", result.data);

            // Also record the contribution with total amount
            try {
              const contributionResponse = await fetch("/api/contributions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  campaignId: campaign.campaignId,
                  userId: address,
                  amount: total,
                  transactionHash:
                    createHash ||
                    `0x${Math.random().toString(16).substr(2, 64)}`, // Use actual hash or generate mock
                  type: "recurring",
                }),
              });

              const contributionResult = await contributionResponse.json();
              if (contributionResult.success) {
                console.log("Contribution recorded:", contributionResult.data);
              } else {
                console.error(
                  "Failed to record contribution:",
                  contributionResult.error
                );
              }
            } catch (contributionError) {
              console.error("Error recording contribution:", contributionError);
            }

            toast.success("Recurring payment setup completed successfully!");
          } else {
            console.error("Failed to store subscription:", result.error);
            toast.error(
              "Payment setup completed but failed to save subscription details"
            );
          }
        } catch (dbError) {
          console.error("Error storing subscription:", dbError);
          toast.error(
            "Payment setup completed but failed to save subscription details"
          );
        }
      };

      storeSubscription();
      setSubmitting(false);
      setTransactionCompleted(true);
      onSuccess();
    }
  }, [
    isCreateConfirmed,
    submitting,
    onSuccess,
    campaign.campaignId,
    address,
    recipient,
    amountPerInterval,
    frequency,
    periods,
    startDate,
  ]);

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
            <div className="text-blue-600 capitalize">
              Target Chain:{" "}
              <span className="font-semibold">{campaign.chain}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chain Selection */}
          <div className="space-y-2">
            <Label htmlFor="chain">Destination Chain</Label>
            <div className="w-full p-3 border rounded-md bg-gray-50 flex items-center gap-x-2">
              <Image
                src={
                  CHAIN_METADATA[getChainIdFromSupportedKey(destinationChain)]
                    ?.logo
                }
                alt={
                  CHAIN_METADATA[getChainIdFromSupportedKey(destinationChain)]
                    ?.name ?? ""
                }
                width={24}
                height={24}
                className="rounded-full"
              />
              <p className="text-sm text-gray-800">
                {
                  CHAIN_METADATA[getChainIdFromSupportedKey(destinationChain)]
                    ?.name
                }
              </p>
            </div>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={() => {}}
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
          <div className="bg-primary/10 border-2 border-primary/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-foreground">Transaction Progress</p>
              {processing && (
                <span className="text-sm text-foreground/70 bg-primary/20 px-2 py-1 rounded">
                  {processing?.currentStep}/{processing?.totalSteps}
                </span>
              )}
            </div>

            {processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/70">Status:</span>
                  <span className="font-medium text-foreground">{processing?.statusText}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/70">Progress:</span>
                  <span className="font-medium text-foreground">{processing?.currentStep}/{processing?.totalSteps}</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((processing?.currentStep || 0) / (processing?.totalSteps || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
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

      {transactionCompleted && (
        <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800">Recurring Payment Setup Complete!</p>
                <p className="text-sm text-green-700">Your subscription has been created successfully.</p>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = '/manage-payment'}
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            >
              Manage Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
