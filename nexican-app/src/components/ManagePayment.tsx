"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { isAddress, formatEther } from "viem";
import { toast } from "react-toastify";

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

type SupportedChainKey = "sepolia" | "arbitrumSepolia";

const CHAIN_CONFIG: Record<
  SupportedChainKey,
  { id: number; name: string; delegationManager: string; usdc: string }
> = {
  sepolia: {
    id: 11155111,
    name: "Sepolia",
    delegationManager: "0xe220442A5aEa25dee9194c07396C082468f9f62F",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  },
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    delegationManager: "0x03bd3553E02062D77Fb8Beda2207846063791115",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  },
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
    return (Number(amount) / 1_000_000).toFixed(6); // USDC has 6 decimals
  };

  return (
    <Card className="w-full" hover={true}>
      <div className="border-b-2 border-foreground pb-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-foreground font-semibold text-sm">Subscriber</Label>
            <div className="flex items-center gap-2 bg-secondary border-2 border-foreground px-3 py-2 rounded-lg">
              <p className="font-mono text-sm flex-1 text-foreground" title={sub.subscriber}>
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
            <Label className="text-foreground font-semibold text-sm">Recipient</Label>
            <div className="flex items-center gap-2 bg-secondary border-2 border-foreground px-3 py-2 rounded-lg">
              <p className="font-mono text-sm flex-1 text-foreground" title={sub.recipient}>
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

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-secondary border-2 border-foreground rounded-lg p-4">
            <Label className="text-foreground font-semibold text-sm">Amount per Interval</Label>
            <p className="text-xl font-bold text-foreground mt-1">
              {formatAmount(sub.amountPerInterval)} USDC
            </p>
          </div>
          <div className="bg-secondary border-2 border-foreground rounded-lg p-4">
            <Label className="text-foreground font-semibold text-sm">Total Amount</Label>
            <p className="text-xl font-bold text-foreground mt-1">
              {formatAmount(sub.totalAmount)} USDC
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-secondary border-2 border-foreground rounded-lg p-4">
            <Label className="text-foreground font-semibold text-sm">Remaining Amount</Label>
            <p className="text-xl font-bold text-foreground mt-1">
              {formatAmount(sub.remainingAmount)} USDC
            </p>
          </div>
          <div className="bg-secondary border-2 border-foreground rounded-lg p-4">
            <Label className="text-foreground font-semibold text-sm">Periods Remaining</Label>
            <p className="text-xl font-bold text-foreground mt-1">{sub.periodsRemaining.toString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-secondary border-2 border-foreground rounded-lg p-4">
            <Label className="text-foreground font-semibold text-sm">Next Payment</Label>
            <p className="text-xl font-bold text-foreground mt-1">
              {timeUntilDue ? formatTime(timeUntilDue) : "N/A"}
            </p>
          </div>
          <div className="bg-secondary border-2 border-foreground rounded-lg p-4">
            <Label className="text-foreground font-semibold text-sm">Chain</Label>
            <p className="text-xl font-bold text-foreground mt-1">{chainConfig.name}</p>
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

export default function ManagePayment() {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] =
    useState<SupportedChainKey>("sepolia");
  const [refreshKey, setRefreshKey] = useState(0);

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
  if (!isConnected || isLoadingUserSubscriptions || isLoadingReceivedSubscriptions) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Manage Recurring Payments
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-3">
              <Label className="text-foreground font-semibold">Chain:</Label>
              <select
                className="input-neobrutal h-12 px-4 text-foreground font-semibold"
                value={selectedChain}
                onChange={(e) =>
                  setSelectedChain(e.target.value as SupportedChainKey)
                }
              >
                <option value="sepolia">Sepolia</option>
                <option value="arbitrumSepolia">Arbitrum Sepolia</option>
              </select>
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
                  {!isConnected ? "Wallet Not Connected" : "Loading subscriptions..."}
                </p>
                <p className="text-sm text-foreground/70">
                  {!isConnected
                    ? "Please connect your wallet to view and manage your subscriptions"
                    : "Fetching your subscription data from the blockchain"
                  }
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
            <select
              className="input-neobrutal h-12 px-4 text-foreground font-semibold"
              value={selectedChain}
              onChange={(e) =>
                setSelectedChain(e.target.value as SupportedChainKey)
              }
            >
              <option value="sepolia">Sepolia</option>
              <option value="arbitrumSepolia">Arbitrum Sepolia</option>
            </select>
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
          <h3 className="text-red-800 font-bold text-lg mb-4">Contract Error</h3>
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

      <Tabs defaultValue="created" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary border-2 border-foreground rounded-lg p-1">
          <TabsTrigger
            value="created"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-background transition-all duration-200 hover:bg-primary/20 font-semibold rounded-md"
          >
            <Calendar className="h-4 w-4" />
            <span>Created</span>
            <span className="bg-foreground text-background px-2 py-1 rounded-lg text-xs font-bold">
              {userSubscriptionIds?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="received"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-background transition-all duration-200 hover:bg-primary/20 font-semibold rounded-md"
          >
            <Users className="h-4 w-4" />
            <span>Received</span>
            <span className="bg-foreground text-background px-2 py-1 rounded-lg text-xs font-bold">
              {receivedSubscriptionIds?.length || 0}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="space-y-6">
          <Card hover={false}>
            <div className="border-b-2 border-foreground pb-4 mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Created Subscriptions</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {userSubscriptionIds && userSubscriptionIds.length > 0 ? userSubscriptionIds.map((id) => (
                <SubscriptionCard
                  key={`${id}-${refreshKey}`}
                  subscriptionId={Number(id)}
                  chain={selectedChain}
                  onUpdate={handleSubscriptionUpdate}
                />
              )) : <div className="text-center p-8 col-span-full">
                <p className="text-foreground/70 text-lg font-semibold">
                  No subscriptions created yet
                </p>
              </div>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-6">
          <Card hover={false}>
            <div className="border-b-2 border-foreground pb-4 mb-6">
              <h2 className="text-2xl font-bold text-foreground">Subscriptions You've Received</h2>
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
                <p className="text-foreground/70 text-lg font-semibold">No subscriptions received yet</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <Card hover={false}>
        <div className="border-b-2 border-foreground pb-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">How to Manage Recurring Payments</h2>
        </div>
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-secondary border-2 border-foreground rounded-lg p-6">
              <h3 className="font-bold text-foreground text-lg mb-3">As Subscriber</h3>
              <p className="text-foreground/80">
                Pause, resume, or cancel your subscriptions. Monitor payment
                status and remaining amounts.
              </p>
            </div>
            <div className="bg-secondary border-2 border-foreground rounded-lg p-6">
              <h3 className="font-bold text-foreground text-lg mb-3">As Recipient</h3>
              <p className="text-foreground/80">
                Process due payments when they become available. View incoming
                subscription details.
              </p>
            </div>
            <div className="bg-secondary border-2 border-foreground rounded-lg p-6">
              <h3 className="font-bold text-foreground text-lg mb-3">Chain Management</h3>
              <p className="text-foreground/80">
                Switch between Sepolia and Arbitrum Sepolia to manage
                subscriptions on different networks.
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
