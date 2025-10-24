"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { isAddress, formatEther } from "viem";

// Helper function to format addresses
const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to copy address to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
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
    if (isConfirmed) {
      onUpdate();
    }
  }, [isConfirmed, onUpdate]);

  if (isLoadingSubscription || !subscription) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription #{subscriptionId}</span>
          <div className="flex gap-2">
            {sub.isActive ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                Active
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                Inactive
              </span>
            )}
            {sub.isPaused && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                Paused
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <Label className="text-gray-600 text-xs">Subscriber</Label>
            <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border">
              <p className="font-mono text-xs flex-1" title={sub.subscriber}>
                {formatAddress(sub.subscriber)}
              </p>
              <button
                onClick={() => copyToClipboard(sub.subscriber)}
                className="text-gray-400 hover:text-gray-600 text-xs"
                title="Copy full address"
              >
                📋
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-600 text-xs">Recipient</Label>
            <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border">
              <p className="font-mono text-xs flex-1" title={sub.recipient}>
                {formatAddress(sub.recipient)}
              </p>
              <button
                onClick={() => copyToClipboard(sub.recipient)}
                className="text-gray-400 hover:text-gray-600 text-xs"
                title="Copy full address"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-gray-600">Amount per Interval</Label>
            <p className="font-semibold">
              {formatAmount(sub.amountPerInterval)} USDC
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Total Amount</Label>
            <p className="font-semibold">
              {formatAmount(sub.totalAmount)} USDC
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-gray-600">Remaining Amount</Label>
            <p className="font-semibold">
              {formatAmount(sub.remainingAmount)} USDC
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Periods Remaining</Label>
            <p className="font-semibold">{sub.periodsRemaining.toString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-gray-600">Next Payment</Label>
            <p className="font-semibold">
              {timeUntilDue ? formatTime(timeUntilDue) : "N/A"}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Chain</Label>
            <p className="font-semibold">{chainConfig.name}</p>
          </div>
        </div>

        {/* Action buttons based on role */}
        <div className="flex gap-2 pt-4 border-t">
          {isRecipient && isDue && sub.isActive && !sub.isPaused && (
            <Button
              onClick={processPayment}
              disabled={isPending || isConfirming}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending || isConfirming ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Process Payment"
              )}
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
                variant="destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
            {error.message}
          </div>
        )}
      </CardContent>
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

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-lg text-gray-600">
            Please connect your wallet to view subscriptions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Recurring Payments</h1>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Label>Chain:</Label>
            <select
              className="border rounded-md h-10 px-2"
              value={selectedChain}
              onChange={(e) =>
                setSelectedChain(e.target.value as SupportedChainKey)
              }
            >
              <option value="sepolia">Sepolia</option>
              <option value="arbitrumSepolia">Arbitrum Sepolia</option>
            </select>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(userSubscriptionsError || receivedSubscriptionsError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-semibold mb-2">Contract Error</h3>
          {userSubscriptionsError && (
            <p className="text-red-700 text-sm mb-1">
              User Subscriptions Error: {userSubscriptionsError.message}
            </p>
          )}
          {receivedSubscriptionsError && (
            <p className="text-red-700 text-sm">
              Received Subscriptions Error: {receivedSubscriptionsError.message}
            </p>
          )}
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Possible Solutions:</strong>
            </p>
            <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
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
        </div>
      )}

      <Tabs defaultValue="created" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100">
          <TabsTrigger
            value="created"
            className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200 hover:bg-blue-100"
          >
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Created</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
              {userSubscriptionIds?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="received"
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-200 hover:bg-purple-100"
          >
            <Users className="h-4 w-4" />
            <span className="font-medium">Received</span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
              {receivedSubscriptionIds?.length || 0}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Created Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {/* {isLoadingUserSubscriptions ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : userSubscriptionIds && userSubscriptionIds.length > 0 ? ( */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userSubscriptionIds && userSubscriptionIds.length > 0 ? userSubscriptionIds.map((id) => (
                    <SubscriptionCard
                      key={`${id}-${refreshKey}`}
                      subscriptionId={Number(id)}
                      chain={selectedChain}
                      onUpdate={handleSubscriptionUpdate}
                    />
                  )) : <div className="text-center p-8">
                    <p className="text-gray-600 mb-4">
                      No subscriptions created yet
                    </p>
                  </div>}
                </div>
              {/* ) : (
                <div className="text-center p-8">
                  <p className="text-gray-600 mb-4">
                    No subscriptions created yet
                  </p>
                </div>
              )} */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions You&apos;ve Received</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingReceivedSubscriptions ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : receivedSubscriptionIds &&
                receivedSubscriptionIds.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <p className="text-gray-600">No subscriptions received yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <Card>
        <CardHeader>
          <CardTitle>How to Manage Recurring Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">As Subscriber</h3>
              <p className="text-gray-600">
                Pause, resume, or cancel your subscriptions. Monitor payment
                status and remaining amounts.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">As Recipient</h3>
              <p className="text-gray-600">
                Process due payments when they become available. View incoming
                subscription details.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Chain Management</h3>
              <p className="text-gray-600">
                Switch between Sepolia and Arbitrum Sepolia to manage
                subscriptions on different networks.
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Powered by EIP-7702 + Nexus
            </h4>
            <p className="text-blue-800 text-sm">
              This system combines Nexus SDK for cross-chain funding with
              EIP-7702 delegation for secure recurring payments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
