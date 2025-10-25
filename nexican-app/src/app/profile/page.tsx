"use client";

import { useState, useEffect } from "react";
import {
  User,
  Wallet,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Activity,
  Share2,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/card-new";
import Button from "@/components/ui/button-new";
import LinkButton from "@/components/ui/link-button";
import ProgressBar from "@/components/ui/ProgressBar";
import { useAccount } from "wagmi";
import UnifiedBalance from "@/components/UnifiedBalance";
import CampaignSplitsForm from "@/components/splits/CampaignSplitsForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useNexus } from "@/providers/NexusProvider";

interface Campaign {
  campaignId: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  deadline: string;
  backers: number;
  chain: string;
  status:
    | "active"
    | "completed"
    | "pending_verification"
    | "rejected"
    | "approved";
  createdAt: string;
  teamMembers?: Array<{
    id: string;
    name: string;
    wallet: string;
    percentage: number;
  }>;
}

interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    walletAddress: string;
    avatar: string;
    verified: boolean;
    joinedAt: string;
  };
  stats: {
    campaignsCreated: number;
    campaignsContributed: number;
    totalContributions: number;
  };
  balance: {
    totalContributed: number;
    totalRaised: number;
    totalEarned: number;
    netBalance: number;
  };
  campaigns: {
    created: Campaign[];
    contributed: Campaign[];
  };
  recentActivity: any[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [splitFundsOpen, setSplitFundsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { address } = useAccount();
  const { nexusSDK } = useNexus();

  useEffect(() => {
    if (address) {
      fetchProfile();
    }
  }, [address]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (!address) {
        setError("Connect your wallet to view your profile");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `/api/users/profile?walletAddress=${address}`
      );
      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_verification":
        return "Pending Verification";
      case "approved":
        return "Active";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const calculateRemainingAmount = (goal: number, raised: number) => {
    return Math.max(0, goal - raised);
  };

  const calculateProgress = (goal: number, raised: number) => {
    return Math.min(100, (raised / goal) * 100);
  };

  const handleSplitFunds = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setSplitFundsOpen(true);
  };

  const handleSplitComplete = () => {
    setSplitFundsOpen(false);
    setSelectedCampaign(null);
    // Refresh profile data
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-foreground/70">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">
                Error: {error || "Profile not found"}
              </p>
              <Button onClick={fetchProfile}>Try Again</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center">
              <User className="w-10 h-10 mr-4 text-primary" />
              Dashboard
            </h1>
            <p className="text-lg text-foreground/70">
              Manage your campaigns, contributions, and earnings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Info */}
              <Card>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {profile.user.name}
                    </h2>
                    <p className="text-foreground/70 mb-2">
                      {profile.user.email}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-foreground/60">
                      <span className="flex items-center">
                        <Wallet className="w-4 h-4 mr-1" />
                        {profile.user.walletAddress}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            profile.user.walletAddress
                          );
                          setCopied(true);
                          setTimeout(() => {
                            setCopied(false);
                          }, 2000);
                        }}
                        className="btn-outline text-xs px-3 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-1 text-green-500" />{" "}
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {profile.user.verified && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Verified
                    </div>
                  )}
                </div>
              </Card>

              {/* Unified Balance */}
              <UnifiedBalance />

              {/* Stats Overview */}
              <Card>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3" />
                  Activity Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {profile.stats.campaignsCreated}
                    </div>
                    <div className="text-foreground/70">Campaigns Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {profile.stats.campaignsContributed}
                    </div>
                    <div className="text-foreground/70">
                      Campaigns Supported
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {profile.stats.totalContributions}
                    </div>
                    <div className="text-foreground/70">
                      Total Contributions
                    </div>
                  </div>
                </div>
              </Card>

              {/* Created Campaigns - Enhanced */}
              <Card>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center">
                    <Target className="w-6 h-6 mr-3" />
                    Your Campaigns
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.campaigns.created.map((campaign) => {
                    const remainingAmount = calculateRemainingAmount(
                      campaign.goal,
                      campaign.raised
                    );
                    const progress = calculateProgress(
                      campaign.goal,
                      campaign.raised
                    );

                    return (
                      <div
                        key={campaign.campaignId}
                        className="border border-foreground/20 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
                              {campaign.name}
                            </h4>
                            <p className="text-foreground/70 text-sm line-clamp-2 mb-3">
                              {campaign.description}
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  campaign.status
                                )}`}
                              >
                                {getStatusText(campaign.status)}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                {campaign.chain}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {campaign.raised > 0 && (
                              <Button
                                size="sm"
                                onClick={() => handleSplitFunds(campaign)}
                                className="flex items-center"
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                Split
                              </Button>
                            )}
                            <Link href={`/campaigns/${campaign.campaignId}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm text-foreground/70 mb-2">
                              <span>Progress</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <ProgressBar progress={progress} size="sm" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-foreground/70 mb-1">
                                Raised
                              </div>
                              <div className="font-bold text-green-600">
                                {formatAmount(campaign.raised)}
                              </div>
                            </div>
                            <div>
                              <div className="text-foreground/70 mb-1">
                                Goal
                              </div>
                              <div className="font-bold text-foreground">
                                {formatAmount(campaign.goal)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-foreground/70 mb-1">
                                Remaining
                              </div>
                              <div className="font-bold text-orange-600">
                                {formatAmount(remainingAmount)}
                              </div>
                            </div>
                            <div>
                              <div className="text-foreground/70 mb-1">
                                Backers
                              </div>
                              <div className="font-bold text-foreground">
                                {campaign.backers}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-foreground/10">
                            <div className="flex justify-between text-xs text-foreground/60">
                              <span>
                                Created {formatDate(campaign.createdAt)}
                              </span>
                              <span>Ends {formatDate(campaign.deadline)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {profile.campaigns.created.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                    <p className="text-foreground/60 mb-4">
                      No campaigns created yet
                    </p>
                    <Link href="/create" className="w-full">
                      <Button
                        variant="outline"
                        className="gradient-primary !text-white"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Create Your First Campaign
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <LinkButton
                    href="/create"
                    variant="outline"
                    className="w-full gradient-primary !text-white"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Create Campaign
                  </LinkButton>
                  <LinkButton
                    href="/campaigns"
                    variant="outline"
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Browse Campaigns
                  </LinkButton>
                  <LinkButton href="/dao" variant="outline" className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    DAO Panel
                  </LinkButton>
                  <LinkButton
                    href="/manage-payment"
                    variant="outline"
                    className="w-full"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    My contributions
                  </LinkButton>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {profile.recentActivity.slice(0, 4).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-foreground/20 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            activity.type === "campaign_created"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {activity.type === "campaign_created" ? (
                            <Target className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">
                            {activity.type === "campaign_created"
                              ? "Created campaign"
                              : "Contributed to campaign"}
                          </p>
                          <p className="text-xs text-foreground/70 truncate">
                            {activity.campaignName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-sm">
                          {formatAmount(activity.amount)}
                        </p>
                        <p className="text-xs text-foreground/60">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {profile.recentActivity.length === 0 && (
                    <p className="text-foreground/60 text-sm text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      {/* Campaign Split Funds Modal */}
      <Dialog open={splitFundsOpen} onOpenChange={setSplitFundsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Split Funds for {selectedCampaign?.name}</DialogTitle>
            <DialogDescription>
              Distribute the raised funds among your team members.
            </DialogDescription>
          </DialogHeader>
          {nexusSDK?.isInitialized() && (
            <div className="w-full max-w-4xl">
              <UnifiedBalance />
            </div>
          )}
          {selectedCampaign && (
            <CampaignSplitsForm
              campaignId={selectedCampaign.campaignId}
              campaignName={selectedCampaign.name}
              maxAmount={selectedCampaign.raised}
              onSplitComplete={handleSplitComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
