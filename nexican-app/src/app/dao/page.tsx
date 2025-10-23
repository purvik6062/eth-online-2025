'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { CheckCircle, XCircle, Clock, Eye, Shield, Users, Target, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/card-new';
import Button from '@/components/ui/button-new';
import ProgressBar from '@/components/ui/ProgressBar';

// Static DAO member addresses - add your DAO member addresses here
const DAO_MEMBER_ADDRESSES = [
  "0xB351a70dD6E5282A8c84edCbCd5A955469b9b032"
];

const mockDaoStats = {
  totalCampaigns: 24,
  pendingVerification: 8,
  verifiedThisMonth: 12,
  activeVerifiers: 15,
};

export default function DAOPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  // Check if current address is a DAO member
  const isDaoMember = address ? DAO_MEMBER_ADDRESSES.includes(address) : false;

  useEffect(() => {
    fetchDAOCampaigns();
  }, []);

  const fetchDAOCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dao');
      const result = await response.json();

      if (result.success) {
        setCampaigns(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch DAO campaigns');
      console.error('Error fetching DAO campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (campaignId: string, action: 'approve' | 'reject') => {
    try {
      if (!address) {
        alert('Connect wallet to proceed');
        return;
      }
      const response = await fetch('/api/dao/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          action,
          verifierId: address,
          comments: action === 'reject' ? 'Please provide more details about your project' : ''
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        fetchDAOCampaigns(); // Refresh the list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error verifying campaign:', error);
      alert('Failed to verify campaign. Please try again.');
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


  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    if (filter === 'pending') return campaign.status === 'pending_verification';
    if (filter === 'verified') return campaign.status === 'approved';
    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-foreground/70">Loading DAO campaigns...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <Button onClick={fetchDAOCampaigns}>Try Again</Button>
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
              <Shield className="w-10 h-10 mr-4 text-primary" />
              DAO Verification Panel
            </h1>
            <p className="text-lg text-foreground/70">
              Review and verify campaign milestones for transparent fund distribution
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Total Campaigns</p>
                  <p className="text-2xl font-bold text-foreground">{mockDaoStats.totalCampaigns}</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Pending Verification</p>
                  <p className="text-2xl font-bold text-foreground">{mockDaoStats.pendingVerification}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Verified This Month</p>
                  <p className="text-2xl font-bold text-foreground">{mockDaoStats.verifiedThisMonth}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Active Verifiers</p>
                  <p className="text-2xl font-bold text-foreground">{mockDaoStats.activeVerifiers}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-4 mb-6">
            {[
              { key: 'all', label: 'All Campaigns', count: campaigns.length },
              { key: 'pending', label: 'Pending', count: campaigns.filter(c => c.status === 'pending_verification').length },
              { key: 'verified', label: 'Verified', count: campaigns.filter(c => c.status === 'approved').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'pending' | 'verified' | 'rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-out border-2 ${filter === tab.key
                  ? 'bg-primary text-white border-primary shadow-neobrutal-pressed'
                  : 'bg-secondary text-foreground border-foreground shadow-neobrutal hover:shadow-neobrutal-hover hover:-translate-y-1'
                  }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Campaigns List */}
          <div className="space-y-6">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.campaignId}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{campaign.name}</h3>
                    <p className="text-foreground/70 mb-4">by {campaign.userAddress}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-foreground/70">Goal</p>
                        <p className="font-semibold text-foreground">{formatAmount(campaign.goal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Raised</p>
                        <p className="font-semibold text-foreground">{formatAmount(campaign.raised)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Deadline</p>
                        <p className="font-semibold text-foreground">{campaign.deadline}</p>
                      </div>
                    </div>

                    <ProgressBar
                      progress={(campaign.raised / campaign.goal) * 100}
                      label="Funding Progress"
                      size="sm"
                    />
                  </div>

                  <div className="ml-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${campaign.status === 'pending_verification'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                      }`}>
                      {campaign.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Campaign Actions */}
                <div className="mt-6 pt-4 border-t border-foreground/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${campaign.status === 'pending_verification'
                        ? 'bg-yellow-100 text-yellow-800'
                        : campaign.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {campaign.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {campaign.daoVerificationRequired && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          DAO Required
                        </span>
                      )}
                    </div>

                    {campaign.status === 'pending_verification' && isDaoMember && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerify(campaign.campaignId, 'approve')}
                          className="cursor-pointer"
                        >   
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(campaign.campaignId, 'reject')}
                          className="cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {campaign.status === 'pending_verification' && !isDaoMember && (
                      <div className="text-sm text-foreground/60">
                        Only DAO members can approve/reject
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-foreground/20">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Request Changes
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <Card className="text-center py-12">
              <Target className="w-16 h-16 text-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No campaigns found</h3>
              <p className="text-foreground/70">
                {filter === 'all'
                  ? 'No campaigns are available for review.'
                  : `No campaigns match the "${filter}" filter.`
                }
              </p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
