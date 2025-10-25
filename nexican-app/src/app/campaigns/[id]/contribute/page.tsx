"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Calendar, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/card-new";
import Button from "@/components/ui/button-new";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import CampaignSplitsForm from "@/components/contribution/CampaignSplitsForm";
import RecurringSubscriptionForm from "@/components/contribution/RecurringSubscriptionForm";
import SubscriptionCards from "@/components/contribution/SubscriptionCards";
import UnifiedBalance from "@/components/UnifiedBalance";
import BalanceCard from "@/components/campaign/BalanceCard";
import { useUnifiedBalance } from "@/hooks/useUnifiedBalance";
import RecurringPayments from "@/components/RecurringPayments";

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
  userAddress: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    deadline: string;
    status: "completed" | "in-progress" | "pending";
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    wallet: string;
    percentage: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

type ContributionTab = "one-time" | "recurring";

export default function ContributionPage() {
  const { address } = useAccount();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContributionTab>("one-time");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const {
    unifiedBalance,
    isLoading,
    error: unifiedBalanceError,
    totalBalance,
  } = useUnifiedBalance();

  useEffect(() => {
    fetchCampaign();
    fetchSubscriptions();
  }, [campaignId, address]);

  // Handle query string for tab selection
  useEffect(() => {
    const tab = searchParams.get('tab') as ContributionTab;
    if (tab && (tab === 'one-time' || tab === 'recurring')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}`);
      const result = await response.json();

      if (result.success) {
        setCampaign(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch campaign");
      console.error("Error fetching campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/subscriptions?user=${address}`);
      const result = await response.json();

      if (result.success) {
        setSubscriptions(result.data);
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    }
  };

  const handleSubscriptionCreated = () => {
    fetchSubscriptions();
    setShowSubscriptions(true);
    toast.success("Subscription created successfully!");
  };

  const handleTabChange = (tab: ContributionTab) => {
    setActiveTab(tab);
    // Update URL with query string
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
              <p className="text-foreground/70">Loading campaign...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">
                Error: {error || "Campaign not found"}
              </p>
              <Button onClick={fetchCampaign}>Try Again</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <p className="text-foreground/70 mb-4">
                Please connect your wallet to contribute
              </p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Check if user is a team member
  const isTeamMember = campaign.teamMembers.some(
    (member) => member.wallet.toLowerCase() === address.toLowerCase()
  );

  if (isTeamMember) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">
                Team members cannot contribute to their own projects
              </p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign
            </Button>

            <div className="flex items-center py-4">
              <Calendar className="w-6 h-6 mr-3 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Contribute to {campaign.name}
              </h1>
            </div>
          </div>

          <div className="pb-12">
            <UnifiedBalance />
          </div>

          {/* Tabs */}
          <Card className="mb-8">
            <div className="border-b border-foreground/20">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => handleTabChange("one-time")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "one-time"
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/70 hover:text-foreground hover:border-foreground/20"
                    }`}
                >
                  One Time
                </button>
                <button
                  onClick={() => handleTabChange("recurring")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "recurring"
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/70 hover:text-foreground hover:border-foreground/20"
                    }`}
                >
                  Recurring
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "one-time" ? (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    One-Time Contribution
                  </h2>
                  <p className="text-foreground/70 mb-6">
                    Make a single contribution to this campaign. The funds will
                    be distributed using our split mechanism.
                  </p>
                  <CampaignSplitsForm
                    campaign={campaign}
                    onSuccess={() => {
                      toast.success("Contribution completed successfully!");
                      router.push(`/campaigns/${campaignId}`);
                    }}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Recurring Subscription
                  </h2>
                  <p className="text-foreground/70 mb-6">
                    Set up a recurring payment to support this campaign over
                    time.
                  </p>
                  <RecurringPayments
                    campaign={campaign}
                    onSuccess={handleSubscriptionCreated}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Show subscriptions if any exist */}
          {showSubscriptions && subscriptions.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Your Created Subscriptions
                </h2>
                <SubscriptionCards subscriptions={subscriptions} />
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
