'use client';

import { useState, useEffect } from 'react';
import { User, Wallet, Target, TrendingUp, Clock, DollarSign, Users, Activity } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/card-new';
import Button from '@/components/ui/button-new';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAccount } from 'wagmi';
import UnifiedBalance from '@/components/UnifiedBalance';

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
    created: any[];
    contributed: any[];
  };
  recentActivity: any[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      fetchProfile();
    }
  }, [address]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (!address) {
        setError('Connect your wallet to view your profile');
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/users/profile?walletAddress=${address}`);
      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-foreground/70">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error: {error || 'Profile not found'}</p>
              <Button onClick={fetchProfile}>Try Again</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center">
              <User className="w-10 h-10 mr-4 text-primary" />
              User Profile
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
                    <h2 className="text-2xl font-bold text-foreground mb-2">{profile.user.name}</h2>
                    <p className="text-foreground/70 mb-2">{profile.user.email}</p>
                    <div className="flex items-center space-x-4 text-sm text-foreground/60">
                      <span className="flex items-center">
                        <Wallet className="w-4 h-4 mr-1" />
                        {profile.user.walletAddress}
                      </span>
                      <div className="cursor-pointer" onClick={() => navigator.clipboard.writeText(profile.user.walletAddress)}>Copy</div>
                      {/* <span>Joined {formatDate(profile.user.joinedAt)}</span> */}
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
              <>
                <UnifiedBalance />
              </>

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
                    <div className="text-foreground/70">Campaigns Supported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {profile.stats.totalContributions}
                    </div>
                    <div className="text-foreground/70">Total Contributions</div>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-3" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {profile.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-foreground/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'campaign_created'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                          }`}>
                          {activity.type === 'campaign_created' ? <Target className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {activity.type === 'campaign_created' ? 'Created campaign' : 'Contributed to campaign'}
                          </p>
                          <p className="text-sm text-foreground/70">{activity.campaignName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatAmount(activity.amount)}</p>
                        <p className="text-sm text-foreground/60">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => window.location.href = '/create'}>
                    <Target className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/campaigns'}>
                    <Users className="w-4 h-4 mr-2" />
                    Browse Campaigns
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/dao'}>
                    <Target className="w-4 h-4 mr-2" />
                    DAO Panel
                  </Button>
                </div>
              </Card>

              {/* Created Campaigns */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Your Campaigns</h3>
                <div className="space-y-3">
                  {profile.campaigns.created.map((campaign) => (
                    <div key={campaign.campaignId} className="p-3 border border-foreground/20 rounded-lg">
                      <h4 className="font-medium text-foreground text-sm mb-1">{campaign.name}</h4>
                      <div className="flex justify-between items-center text-xs text-foreground/60">
                        <span>{formatAmount(campaign.raised)} raised</span>
                        <span className={`px-2 py-1 rounded-full ${campaign.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'pending_verification'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {profile.campaigns.created.length === 0 && (
                    <p className="text-foreground/60 text-sm">No campaigns created yet</p>
                  )}
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
