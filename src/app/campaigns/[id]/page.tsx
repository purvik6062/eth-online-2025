'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Users, Target, ExternalLink, Share2, Heart, Shield, Zap, Globe, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/card-new';
import Button from '@/components/ui/button-new';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';

interface Campaign {
  campaignId: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  deadline: string;
  backers: number;
  chain: string;
  status: 'active' | 'completed' | 'pending_verification' | 'rejected' | 'approved';
  userAddress: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    deadline: string;
    status: 'completed' | 'in-progress' | 'pending';
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

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  userAddress: string | undefined;
}

function ContributionModal({ isOpen, onClose, campaign, userAddress }: ContributionModalProps) {
  const [contributionType, setContributionType] = useState<'one-time' | 'recurring'>('one-time');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAddress) {
      toast.error('Please connect your wallet to contribute');
      return;
    }

    // Check if user is a team member
    const isTeamMember = campaign.teamMembers.some(member =>
      member.wallet.toLowerCase() === userAddress.toLowerCase()
    );

    if (isTeamMember) {
      toast.error('Team members cannot contribute to their own projects');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign.campaignId,
          userId: userAddress,
          amount: Number(amount),
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
          type: contributionType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Contribution of $${amount} ${contributionType === 'recurring' ? 'recurring' : 'one-time'} recorded!`);
        onClose();
        setAmount('');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error creating contribution:', error);
      toast.error('Failed to create contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border-2 border-foreground rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">Contribute to Campaign</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contribution Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Contribution Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="one-time"
                  checked={contributionType === 'one-time'}
                  onChange={(e) => setContributionType(e.target.value as 'one-time' | 'recurring')}
                  className="mr-2"
                />
                One-time
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="recurring"
                  checked={contributionType === 'recurring'}
                  onChange={(e) => setContributionType(e.target.value as 'one-time' | 'recurring')}
                  className="mr-2"
                />
                Recurring
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border-2 border-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              min="1"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !amount}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Contributing...
                </div>
              ) : (
                `Contribute $${amount || '0'}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CampaignDetail() {
  const { address } = useAccount();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
    const campaignId = useParams().id;

  console.log("campaignId:: ",campaignId);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

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
      setError('Failed to fetch campaign');
      console.error('Error fetching campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
              <p className="text-foreground/70">Loading campaign...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error: {error || 'Campaign not found'}</p>
              <Button onClick={fetchCampaign}>Try Again</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = (campaign.raised / campaign.goal) * 100;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    return `${diffDays} days left`;
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        campaign={campaign}
        userAddress={address}
      />

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Campaign Header */}
              <Card>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-lg mb-6 relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop"
                    alt={campaign.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full border-2 border-white">
                      {campaign.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 bg-background/90 text-foreground text-sm font-medium rounded border border-foreground/20">
                      {campaign.chain}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                      {campaign.name}
                    </h1>
                    <p className="text-lg text-foreground/70 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" size="sm" className="group cursor-pointer">
                      <Share2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="group cursor-pointer">
                      <Heart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="group cursor-pointer">
                      <ExternalLink className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                      View on Explorer
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Campaign Details */}
              <Card>
                <h2 className="text-2xl font-bold text-foreground mb-6">Campaign Details</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-foreground/70 leading-relaxed">
                    {campaign.description}
                  </p>
                </div>
              </Card>

              {/* Milestones */}
              <Card>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-3" />
                  Milestones
                </h2>
                <div className="space-y-4">
                  {campaign.milestones.map((milestone) => (
                    <div key={milestone.id} className="border-2 border-foreground/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${milestone.status === 'completed'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : milestone.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          {milestone?.status?.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-foreground/70 mb-2">{milestone.description}</p>
                      <div className="flex justify-between items-center text-sm text-foreground/60">
                        <span>{formatAmount(milestone.amount)}</span>
                        <span>{milestone.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contribution Card */}
              <Card>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {formatAmount(campaign.raised)}
                  </div>
                  <div className="text-foreground/70">
                    raised of {formatAmount(campaign.goal)} goal
                  </div>
                </div>

                <ProgressBar
                  progress={progress}
                  size="lg"
                  className="mb-6"
                />

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-foreground/70">
                    <span>{campaign.backers} backers</span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDeadline(campaign.deadline)}
                    </span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full cursor-pointer"
                    onClick={() => setShowContributionModal(true)}
                    disabled={!address}
                  >
                    {address ? 'Contribute Now' : 'Connect Wallet to Contribute'}
                  </Button>
                </div>
              </Card>

              {/* Creator Info */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Created by</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {campaign.userAddress.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground font-mono text-sm">
                        {campaign.userAddress.slice(0, 6)}...{campaign.userAddress.slice(-4)}
                      </span>
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/70">Campaign Creator</span>
                  </div>
                </div>
              </Card>

              {/* Escrow Info */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Escrow Contract
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-foreground/70">Address:</span>
                    <div className="font-mono text-xs bg-secondary/50 p-2 rounded mt-1 break-all">
                      {campaign.userAddress}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Status:</span>
                    <span className="text-green-600 font-medium capitalize">{campaign.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Streaming:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Raised:</span>
                    <span className="font-medium">{formatAmount(campaign.raised)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
