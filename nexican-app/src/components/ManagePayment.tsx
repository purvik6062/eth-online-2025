"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { useNotification } from "@blockscout/app-sdk";
import Card from "@/components/ui/card-new";
import Button from "@/components/ui/button-new";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Pause,
  Play,
  X,
  CopyIcon,
  ExternalLink,
} from "lucide-react";
import { isAddress, formatEther } from "viem";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  SUPPORTED_CHAINS,
  type SUPPORTED_CHAINS_IDS,
  CHAIN_METADATA,
} from "@avail-project/nexus-core";

// Helper function to format addresses
const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to copy address to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

type SupportedChainKey =
  | "sepolia"
  | "arbitrumSepolia"
  | "baseSepolia"
  | "optimismSepolia";

const CHAIN_CONFIG: Record<
  SupportedChainKey,
  { id: number; name: string; delegationManager: string; usdc: string }
> = {
  sepolia: {
    id: 11155111,
    name: "Sepolia",
    delegationManager: "0x9E89b0F0049e22E679C3A3bE4938DF1dCc08ec15",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  },
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    delegationManager: "0x9edE152D33D7450E08B8eAec6bDA5E7D1F98F45d",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  },
  baseSepolia: {
    id: 84532,
    name: "Base Sepolia",
    delegationManager: "0x5C009421fb32B13Ac739E1fe95a4f6Ff4C132882", 
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", 
  },
  optimismSepolia: {
    id: 11155420,
    name: "Optimism Sepolia",
    delegationManager: "0x32dDe10DBD35910Be56CdcDc47353488F798b8bb", // Dummy address
    usdc: "0x5fd84259d66Cd46123540766Be93DFE2D0b02CC2", // Optimism Sepolia USDC
  },
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

// ABI for EIP7702DelegationManager
const EIP7702_DELEGATION_MANAGER_ABI = [
  {
    type: "function",
    name: "getUserSubscriptions",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReceivedSubscriptions",
    inputs: [{ name: "recipient", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSubscription",
    inputs: [{ name: "subscriptionId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "subscriber", type: "address" },
          { name: "recipient", type: "address" },
          { name: "token", type: "address" },
          { name: "amountPerInterval", type: "uint256" },
          { name: "totalAmount", type: "uint256" },
          { name: "remainingAmount", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "interval", type: "uint256" },
          { name: "periods", type: "uint256" },
          { name: "periodsRemaining", type: "uint256" },
          { name: "nextPaymentTime", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "isPaused", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSubscriptionPaymentStatus",
    inputs: [{ name: "subscriptionId", type: "uint256" }],
    outputs: [
      { name: "isDue", type: "bool" },
      { name: "timeUntilDue", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "processSubscriptionPayment",
    inputs: [{ name: "subscriptionId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelSubscription",
    inputs: [{ name: "subscriptionId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pauseSubscription",
    inputs: [{ name: "subscriptionId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resumeSubscription",
    inputs: [{ name: "subscriptionId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

interface Subscription {
  subscriber: string;
  recipient: string;
  token: string;
  amountPerInterval: bigint;
  totalAmount: bigint;
  remainingAmount: bigint;
  startTime: bigint;
  interval: bigint;
  periods: bigint;
  periodsRemaining: bigint;
  nextPaymentTime: bigint;
  isActive: boolean;
  isPaused: boolean;
}

interface DatabaseSubscription {
  _id: string;
  subscriptionId: string;
  campaignId: string;
  subscriberAddress: string;
  recipientAddress: string;
  paymentToken: string;
  amountPerPayment: number;
  paymentFrequency: string;
  numberOfPayments: number;
  completedPayments: number;
  status: "active" | "completed" | "cancelled" | "pending";
  startDate: string;
  createdAt: string;
}

interface Campaign {
  campaignId: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  deadline: string;
  backers: number;
  chain: string;
  status: string;
  userAddress: string;
  createdAt: string;
}

interface SubscriptionCardProps {
  subscriptionId: number;
  chain: SupportedChainKey;
  onUpdate: () => void;
}

function SubscriptionCard({
  subscriptionId,
  chain,
  onUpdate,
}: SubscriptionCardProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { openTxToast } = useNotification();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const chainConfig = CHAIN_CONFIG[chain];

  // Get subscription details
  const { data: subscription, isLoading: isLoadingSubscription } =
    useReadContract({
      address: chainConfig.delegationManager as `0x${string}`,
      abi: EIP7702_DELEGATION_MANAGER_ABI,
      functionName: "getSubscription",
      args: [BigInt(subscriptionId)],
      query: { enabled: !!chainConfig.delegationManager },
    });

  // Get payment status
  const { data: paymentStatus } = useReadContract({
    address: chainConfig.delegationManager as `0x${string}`,
    abi: EIP7702_DELEGATION_MANAGER_ABI,
    functionName: "getSubscriptionPaymentStatus",
    args: [BigInt(subscriptionId)],
    query: { enabled: !!chainConfig.delegationManager },
  });

  const processPayment = async () => {
    if (!chainConfig.delegationManager) return;
    try {
      await writeContract({
        address: chainConfig.delegationManager as `0x${string}`,
        abi: EIP7702_DELEGATION_MANAGER_ABI,
        functionName: "processSubscriptionPayment",
        args: [BigInt(subscriptionId)],
        gas: BigInt(300000),
        chain: { id: chainConfig.id, name: chainConfig.name } as any,
        account: address as `0x${string}`,
      });
    } catch (error) {
      console.error("Process payment error:", error);
    }
  };

  const cancelSubscription = async () => {
    if (!chainConfig.delegationManager) return;
    try {
      await writeContract({
        address: chainConfig.delegationManager as `0x${string}`,
        abi: EIP7702_DELEGATION_MANAGER_ABI,
        functionName: "cancelSubscription",
        args: [BigInt(subscriptionId)],
        gas: BigInt(200000),
        chain: { id: chainConfig.id, name: chainConfig.name } as any,
        account: address as `0x${string}`,
      });
    } catch (error) {
      console.error("Cancel subscription error:", error);
    }
  };

  const pauseSubscription = async () => {
    if (!chainConfig.delegationManager) return;
    try {
      await writeContract({
        address: chainConfig.delegationManager as `0x${string}`,
        abi: EIP7702_DELEGATION_MANAGER_ABI,
        functionName: "pauseSubscription",
        args: [BigInt(subscriptionId)],
        gas: BigInt(150000),
        chain: { id: chainConfig.id, name: chainConfig.name } as any,
        account: address as `0x${string}`,
      });
    } catch (error) {
      console.error("Pause subscription error:", error);
    }
  };

  const resumeSubscription = async () => {
    if (!chainConfig.delegationManager) return;
    try {
      await writeContract({
        address: chainConfig.delegationManager as `0x${string}`,
        abi: EIP7702_DELEGATION_MANAGER_ABI,
        functionName: "resumeSubscription",
        args: [BigInt(subscriptionId)],
        gas: BigInt(150000),
        chain: { id: chainConfig.id, name: chainConfig.name } as any,
        account: address as `0x${string}`,
      });
    } catch (error) {
      console.error("Resume subscription error:", error);
    }
  };

  useEffect(() => {
    if (isConfirmed && hash) {
      // Show Blockscout notification
      openTxToast(chainId.toString(), hash);
      onUpdate();
    }
  }, [isConfirmed, hash, chainId, openTxToast, onUpdate]);

  if (isLoadingSubscription || !subscription) {
    return (
      <Card hover={false}>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  const sub = subscription as Subscription;
  const isSubscriber = address?.toLowerCase() === sub.subscriber.toLowerCase();
  const isRecipient = address?.toLowerCase() === sub.recipient.toLowerCase();
  const isDue = paymentStatus?.[0] as boolean;
  const timeUntilDue = paymentStatus?.[1] as bigint;

  const formatTime = (seconds: bigint) => {
    const s = Number(seconds);
    if (s <= 0) return "Due now";
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1_000_000).toFixed(2); // USDC has 6 decimals
  };

  return (
    <Card className="w-full" hover={true}>
      <div className="border-b-2 border-foreground pb-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className=" font-bold text-foreground">
            Subscription #{subscriptionId}
          </h3>
          <div className="flex gap-2">
            {sub.isActive ? (
              <span className="bg-green-500 text-background px-3 py-1 rounded-lg text-xs font-semibold border-2 border-foreground">
                Active
              </span>
            ) : (
              <span className="bg-red-500 text-background px-3 py-1 rounded-lg text-xs font-semibold border-2 border-foreground">
                Inactive
              </span>
            )}
            {sub.isPaused && (
              <span className="bg-yellow-500 text-background px-3 py-1 rounded-lg text-xs font-semibold border-2 border-foreground">
                Paused
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-foreground font-semibold text-sm">
              Subscriber
            </Label>
            <div className="flex items-center gap-2 bg-secondary border-2 border-foreground px-3 py-2 rounded-lg">
              <p
                className="font-mono text-xs flex-1 text-foreground"
                title={sub.subscriber}
              >
                {formatAddress(sub.subscriber)}
              </p>
              <button
                onClick={() => copyToClipboard(sub.subscriber)}
                className="cursor-pointer text-foreground/60 hover:text-foreground text-sm transition-colors"
                title="Copy full address"
              >
                <CopyIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-semibold text-sm">
              Recipient
            </Label>
            <div className="flex items-center gap-2 bg-secondary border-2 border-foreground px-3 py-2 rounded-lg">
              <p
                className="font-mono text-xs flex-1 text-foreground"
                title={sub.recipient}
              >
                {formatAddress(sub.recipient)}
              </p>
              <button
                onClick={() => copyToClipboard(sub.recipient)}
                className="cursor-pointer text-foreground/60 hover:text-foreground text-sm transition-colors"
                title="Copy full address"
              >
                <CopyIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary border-2 border-foreground rounded-lg p-2 flex flex-col justify-between">
            <Label className="text-foreground font-semibold text-sm">
              Amount per Interval
            </Label>
            <p className="font-bold text-foreground mt-1">
              {formatAmount(sub.amountPerInterval)} USDC
            </p>
          </div>
          <div className="bg-secondary border-2 border-foreground rounded-lg p-2 flex flex-col justify-between">
            <Label className="text-foreground font-semibold text-sm">
              Total Amount
            </Label>
            <p className="font-bold text-foreground mt-1">
              {formatAmount(sub.totalAmount)} USDC
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary border-2 border-foreground rounded-lg p-2 flex flex-col justify-between">
            <Label className="text-foreground font-semibold text-sm">
              Remaining Amount
            </Label>
            <p className="font-bold text-foreground mt-1">
              {formatAmount(sub.remainingAmount)} USDC
            </p>
          </div>
          <div className="bg-secondary border-2 border-foreground rounded-lg p-2 flex flex-col justify-between">
            <Label className="text-foreground font-semibold text-sm">
              Periods Remaining
            </Label>
            <p className="font-bold text-foreground mt-1">
              {sub.periodsRemaining.toString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary border-2 border-foreground rounded-lg p-2 flex flex-col justify-between">
            <Label className="text-foreground font-semibold text-sm">
              Next Payment
            </Label>
            <p className="font-bold text-foreground mt-1">
              {timeUntilDue ? formatTime(timeUntilDue) : "N/A"}
            </p>
          </div>
          <div className="bg-secondary border-2 border-foreground rounded-lg p-2 flex flex-col justify-between">
            <Label className="text-foreground font-semibold text-sm">
              Chain
            </Label>
            <p className="font-bold text-foreground mt-1">
              {chainConfig.name}
            </p>
          </div>
        </div>

        {/* Action buttons based on role */}
        <div className="flex gap-3 pt-6 border-t-2 border-foreground">
          {isRecipient && isDue && sub.isActive && !sub.isPaused && (
            <Button
              onClick={processPayment}
              disabled={isPending || isConfirming}
              size="sm"
              variant="primary"
              loading={isPending || isConfirming}
            >
              Process Payment
            </Button>
          )}

          {isSubscriber && sub.isActive && (
            <>
              {sub.isPaused ? (
                <Button
                  onClick={resumeSubscription}
                  disabled={isPending || isConfirming}
                  size="sm"
                  variant="outline"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              ) : (
                <Button
                  onClick={pauseSubscription}
                  disabled={isPending || isConfirming}
                  size="sm"
                  variant="outline"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              <Button
                onClick={cancelSubscription}
                disabled={isPending || isConfirming}
                size="sm"
                variant="secondary"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-100 border-2 border-red-500 p-3 rounded-lg font-semibold">
            {error.message}
          </div>
        )}
      </div>
    </Card>
  );
}

// Component to display database subscriptions with campaign info
function DatabaseSubscriptionCard({
  subscription,
  campaign,
}: {
  subscription: DatabaseSubscription;
  campaign?: Campaign;
}) {
  const formatAmount = (amount: number) => {
    return (amount / 1_000_000).toFixed(6); // USDC has 6 decimals
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const progressPercentage = getProgressPercentage(
    subscription.completedPayments,
    subscription.numberOfPayments
  );

  return (
    <Card className="w-full" hover={true}>
      <div className="border-b-2 border-foreground pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Subscription #{subscription.subscriptionId}
            </h3>
            {campaign && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-foreground/70">Campaign:</span>
                <Link
                  href={`/campaigns/${campaign.campaignId}`}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {campaign.name}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 border-foreground ${getStatusColor(
                subscription.status
              )}`}
            >
              {subscription.status.charAt(0).toUpperCase() +
                subscription.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Campaign Info */}
        {campaign && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Campaign Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Goal:</span>
                <span className="ml-2">${campaign.goal.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Raised:</span>
                <span className="ml-2">
                  ${campaign.raised.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Backers:</span>
                <span className="ml-2">{campaign.backers}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Chain:</span>
                <span className="ml-2">{campaign.chain}</span>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Details */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Payment Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">
                    Amount per payment:
                  </span>
                  <span className="font-medium">
                    {formatAmount(subscription.amountPerPayment)}{" "}
                    {subscription.paymentToken}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Frequency:</span>
                  <span className="font-medium">
                    {subscription.paymentFrequency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Total payments:</span>
                  <span className="font-medium">
                    {subscription.numberOfPayments}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Completed:</span>
                  <span className="font-medium">
                    {subscription.completedPayments}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Start date:</span>
                  <span className="font-medium">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Created:</span>
                  <span className="font-medium">
                    {new Date(subscription.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Progress</span>
            <span className="font-medium">
              {subscription.completedPayments}/{subscription.numberOfPayments}{" "}
              payments
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-foreground/60 text-center">
            {progressPercentage.toFixed(1)}% complete
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Subscriber</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {formatAddress(subscription.subscriberAddress)}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(subscription.subscriberAddress)}
              >
                <CopyIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Recipient</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {formatAddress(subscription.recipientAddress)}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(subscription.recipientAddress)}
              >
                <CopyIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ManagePayment() {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] =
    useState<SupportedChainKey>("sepolia");
  const [refreshKey, setRefreshKey] = useState(0);
  const [databaseSubscriptions, setDatabaseSubscriptions] = useState<
    DatabaseSubscription[]
  >([]);
  const [campaigns, setCampaigns] = useState<Record<string, Campaign>>({});
  const [loadingDatabase, setLoadingDatabase] = useState(false);

  const chainConfig = CHAIN_CONFIG[selectedChain];

  // Get user's created subscriptions
  const {
    data: userSubscriptionIds,
    isLoading: isLoadingUserSubscriptions,
    error: userSubscriptionsError,
    refetch: refetchUserSubscriptions,
  } = useReadContract({
    address: chainConfig.delegationManager as `0x${string}`,
    abi: EIP7702_DELEGATION_MANAGER_ABI,
    functionName: "getUserSubscriptions",
    args: [address as `0x${string}`],
    chainId: chainConfig.id,
    query: {
      enabled:
        !!chainConfig.delegationManager && !!address && isAddress(address),
      staleTime: 60000,
    },
  });

  // Get user's received subscriptions
  const {
    data: receivedSubscriptionIds,
    isLoading: isLoadingReceivedSubscriptions,
    error: receivedSubscriptionsError,
    refetch: refetchReceivedSubscriptions,
  } = useReadContract({
    address: chainConfig.delegationManager as `0x${string}`,
    abi: EIP7702_DELEGATION_MANAGER_ABI,
    functionName: "getReceivedSubscriptions",
    args: [address as `0x${string}`],
    chainId: chainConfig.id,
    query: {
      enabled:
        !!chainConfig.delegationManager && !!address && isAddress(address),
      staleTime: 60000,
    },
  });

  const handleRefresh = () => {
    refetchUserSubscriptions();
    refetchReceivedSubscriptions();
    setRefreshKey((prev) => prev + 1);
  };

  const handleSubscriptionUpdate = () => {
    handleRefresh();
  };

  // Fetch database subscriptions with campaign info
  const fetchDatabaseSubscriptions = async () => {
    if (!address) return;

    setLoadingDatabase(true);
    try {
      // Fetch user's subscriptions from database
      const subscriptionsResponse = await fetch(
        `/api/subscriptions?user=${address}`
      );
      const subscriptionsResult = await subscriptionsResponse.json();

      if (subscriptionsResult.success) {
        const subscriptions = subscriptionsResult.data;
        setDatabaseSubscriptions(subscriptions);

        // Fetch campaign details for each subscription
        const campaignIds = [
          ...new Set(
            subscriptions.map((sub: DatabaseSubscription) => sub.campaignId)
          ),
        ];
        const campaignPromises = campaignIds.map(async (campaignId) => {
          try {
            const response = await fetch(`/api/campaigns/${campaignId}`);
            const result = await response.json();
            return result.success
              ? { campaignId, campaign: result.data }
              : null;
          } catch (error) {
            console.error(`Error fetching campaign ${campaignId}:`, error);
            return null;
          }
        });

        const campaignResults = await Promise.all(campaignPromises);
        const campaignMap: Record<string, Campaign> = {};
        campaignResults.forEach((result) => {
          if (result) {
            campaignMap[result.campaignId as string] = result.campaign;
          }
        });

        setCampaigns(campaignMap);
      }
    } catch (error) {
      console.error("Error fetching database subscriptions:", error);
      toast.error("Failed to load subscription data");
    } finally {
      setLoadingDatabase(false);
    }
  };

  // Fetch database subscriptions on component mount and when address changes
  useEffect(() => {
    if (address) {
      fetchDatabaseSubscriptions();
    }
  }, [address]);

  // Test basic contract call - try to get a subscription to see if contract is working
  const { data: testCall, error: testError } = useReadContract({
    address: chainConfig.delegationManager as `0x${string}`,
    abi: EIP7702_DELEGATION_MANAGER_ABI,
    functionName: "getSubscription",
    args: [BigInt(1)], // Try to get subscription ID 1
    chainId: chainConfig.id,
    query: {
      enabled:
        !!chainConfig.delegationManager && !!address && isAddress(address),
    },
  });

  // Debug logging
  useEffect(() => {
    console.log("ManagePayment Debug:", {
      selectedChain,
      chainConfig,
      address,
      userSubscriptionIds,
      receivedSubscriptionIds,
      isLoadingUserSubscriptions,
      isLoadingReceivedSubscriptions,
      userSubscriptionsError,
      receivedSubscriptionsError,
      testCall,
      testError,
    });
  }, [
    selectedChain,
    chainConfig,
    address,
    userSubscriptionIds,
    receivedSubscriptionIds,
    isLoadingUserSubscriptions,
    isLoadingReceivedSubscriptions,
    userSubscriptionsError,
    receivedSubscriptionsError,
    testCall,
    testError,
  ]);

  // Show loading state while checking connection and loading data
  if (
    !isConnected ||
    isLoadingUserSubscriptions ||
    isLoadingReceivedSubscriptions
  ) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Manage Recurring Payments
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-3">
              <Label className="text-foreground font-semibold">Chain:</Label>
              <div className="flex items-center gap-2 input-neobrutal h-12 px-4 text-foreground font-semibold">
                <Image
                  src={
                    CHAIN_METADATA[getChainIdFromSupportedKey(selectedChain)]
                      ?.logo
                  }
                  alt={
                    CHAIN_METADATA[getChainIdFromSupportedKey(selectedChain)]
                      ?.name ?? ""
                  }
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <select
                  className="bg-transparent text-foreground font-semibold outline-none"
                  value={selectedChain}
                  onChange={(e) =>
                    setSelectedChain(e.target.value as SupportedChainKey)
                  }
                >
                  <option value="sepolia">Sepolia</option>
                  <option value="arbitrumSepolia">Arbitrum Sepolia</option>
                  <option value="baseSepolia">Base Sepolia</option>
                  <option value="optimismSepolia">Optimism Sepolia</option>
                </select>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="md">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Card hover={false}>
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div className="space-y-2">
                <p className="text-lg text-foreground font-semibold">
                  {!isConnected
                    ? "Wallet Not Connected"
                    : "Loading subscriptions..."}
                </p>
                <p className="text-sm text-foreground/70">
                  {!isConnected
                    ? "Please connect your wallet to view and manage your subscriptions"
                    : "Fetching your subscription data from the blockchain"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          Manage Recurring Payments
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3">
            <Label className="text-foreground font-semibold">Chain:</Label>
            <div className="flex items-center gap-2 input-neobrutal h-12 px-4 text-foreground font-semibold">
              <Image
                src={
                  CHAIN_METADATA[getChainIdFromSupportedKey(selectedChain)]
                    ?.logo
                }
                alt={
                  CHAIN_METADATA[getChainIdFromSupportedKey(selectedChain)]
                    ?.name ?? ""
                }
                width={20}
                height={20}
                className="rounded-full"
              />
              <select
                className="bg-transparent text-foreground font-semibold outline-none"
                value={selectedChain}
                onChange={(e) =>
                  setSelectedChain(e.target.value as SupportedChainKey)
                }
              >
                <option value="sepolia">Sepolia</option>
                <option value="arbitrumSepolia">Arbitrum Sepolia</option>
                <option value="baseSepolia">Base Sepolia</option>
                <option value="optimismSepolia">Optimism Sepolia</option>
              </select>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="md">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(userSubscriptionsError || receivedSubscriptionsError) && (
        <Card className="bg-red-100 border-2 border-red-500" hover={false}>
          <h3 className="text-red-800 font-bold text-lg mb-4">
            Contract Error
          </h3>
          {userSubscriptionsError && (
            <p className="text-red-700 text-sm mb-2 font-semibold">
              User Subscriptions Error: {userSubscriptionsError.message}
            </p>
          )}
          {receivedSubscriptionsError && (
            <p className="text-red-700 text-sm font-semibold">
              Received Subscriptions Error: {receivedSubscriptionsError.message}
            </p>
          )}
          <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-500 rounded-lg">
            <p className="text-yellow-800 text-sm font-bold mb-2">
              Possible Solutions:
            </p>
            <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside">
              <li>
                Make sure your wallet is connected to the correct network (
                {chainConfig.name})
              </li>
              <li>
                Check if the contract is deployed at:{" "}
                {chainConfig.delegationManager}
              </li>
              <li>
                Try switching to the other chain (Arbitrum Sepolia) to see if
                your subscription is there
              </li>
              <li>
                Verify that you created the subscription using the
                RecurringPayments component
              </li>
            </ul>
          </div>
        </Card>
      )}

      <Tabs defaultValue="database" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary border-2 border-foreground rounded-lg p-1">
          <TabsTrigger
            value="database"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-background transition-all duration-200 hover:bg-primary/20 font-semibold rounded-md"
          >
            <DollarSign className="h-4 w-4" />
            <span>My Subscriptions</span>
            <span className="bg-foreground text-background px-2 py-1 rounded-lg text-xs font-bold">
              {databaseSubscriptions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="created"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-background transition-all duration-200 hover:bg-primary/20 font-semibold rounded-md"
          >
            <Calendar className="h-4 w-4" />
            <span>Contract Created</span>
            <span className="bg-foreground text-background px-2 py-1 rounded-lg text-xs font-bold">
              {userSubscriptionIds?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="received"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-background transition-all duration-200 hover:bg-primary/20 font-semibold rounded-md"
          >
            <Users className="h-4 w-4" />
            <span>Contract Received</span>
            <span className="bg-foreground text-background px-2 py-1 rounded-lg text-xs font-bold">
              {receivedSubscriptionIds?.length || 0}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6">
          <Card hover={false}>
            <div className="border-b-2 border-foreground pb-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  My Subscriptions with Campaign Info
                </h2>
                <Button
                  onClick={fetchDatabaseSubscriptions}
                  variant="outline"
                  size="sm"
                  disabled={loadingDatabase}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      loadingDatabase ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>
              <p className="text-foreground/70 mt-2">
                View your subscriptions with campaign details and progress
                tracking
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {loadingDatabase ? (
                <div className="col-span-full text-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-foreground/70">
                    Loading subscription data...
                  </p>
                </div>
              ) : databaseSubscriptions.length > 0 ? (
                databaseSubscriptions.map((subscription) => (
                  <DatabaseSubscriptionCard
                    key={subscription._id}
                    subscription={subscription}
                    campaign={campaigns[subscription.campaignId]}
                  />
                ))
              ) : (
                <div className="col-span-full text-center p-8">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-foreground/50" />
                  <p className="text-foreground/70 text-lg font-semibold mb-2">
                    No subscriptions found
                  </p>
                  <p className="text-foreground/50 text-sm">
                    Create your first subscription by contributing to a campaign
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="created" className="space-y-6">
          <Card hover={false}>
            <div className="border-b-2 border-foreground pb-4 mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Your Created Subscriptions
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userSubscriptionIds && userSubscriptionIds.length > 0 ? (
                userSubscriptionIds.map((id) => (
                  <SubscriptionCard
                    key={`${id}-${refreshKey}`}
                    subscriptionId={Number(id)}
                    chain={selectedChain}
                    onUpdate={handleSubscriptionUpdate}
                  />
                ))
              ) : (
                <div className="text-center p-8 col-span-full">
                  <p className="text-foreground/70 text-lg font-semibold">
                    No subscriptions created yet
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-6">
          <Card hover={false}>
            <div className="border-b-2 border-foreground pb-4 mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Subscriptions You've Received
              </h2>
            </div>
            {isLoadingReceivedSubscriptions ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : receivedSubscriptionIds &&
              receivedSubscriptionIds.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {receivedSubscriptionIds.map((id) => (
                  <SubscriptionCard
                    key={`${id}-${refreshKey}`}
                    subscriptionId={Number(id)}
                    chain={selectedChain}
                    onUpdate={handleSubscriptionUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-foreground/70 text-lg font-semibold">
                  No subscriptions received yet
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <Card hover={false}>
        <div className="border-b-2 border-foreground pb-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            How to Manage Recurring Payments
          </h2>
        </div>
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-secondary border-2 border-foreground rounded-lg p-6">
              <h3 className="font-bold text-foreground text-lg mb-3">
                As Subscriber
              </h3>
              <p className="text-foreground/80">
                Pause, resume, or cancel your subscriptions. Monitor payment
                status and remaining amounts.
              </p>
            </div>
            <div className="bg-secondary border-2 border-foreground rounded-lg p-6">
              <h3 className="font-bold text-foreground text-lg mb-3">
                As Recipient
              </h3>
              <p className="text-foreground/80">
                Process due payments when they become available. View incoming
                subscription details.
              </p>
            </div>
            <div className="bg-secondary border-2 border-foreground rounded-lg p-6">
              <h3 className="font-bold text-foreground text-lg mb-3">
                Chain Management
              </h3>
              <p className="text-foreground/80">
                Switch between Sepolia, Arbitrum Sepolia, Base Sepolia, and
                Optimism Sepolia to manage subscriptions on different networks.
              </p>
            </div>
          </div>

          <div className="p-6 bg-primary/10 border-2 border-primary rounded-lg">
            <h4 className="font-bold text-primary text-lg mb-3">
              Powered by EIP-7702 + Nexus
            </h4>
            <p className="text-foreground/80">
              This system combines Nexus SDK for cross-chain funding with
              EIP-7702 delegation for secure recurring payments.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
