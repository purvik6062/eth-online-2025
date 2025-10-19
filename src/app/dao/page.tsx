'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Shield, Users, Target, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/card-new';
import Button from '@/components/ui/button-new';
import ProgressBar from '@/components/ui/ProgressBar';

// Mock data for DAO verification
const mockCampaigns = [
  {
    id: '1',
    title: 'DeFi Protocol Upgrade',
    creator: 'Alex Chen',
    goal: 50000,
    raised: 32500,
    deadline: '2024-12-31',
    status: 'pending_verification' as const,
    milestones: [
      {
        id: '1',
        title: 'Core Protocol Development',
        description: 'Complete the basic protocol architecture and smart contracts',
        amount: 15000,
        deadline: '2024-03-31',
        status: 'completed' as const,
        verificationStatus: 'verified' as const,
        submittedAt: '2024-03-25',
        verifiedAt: '2024-03-28',
        verifier: 'DAO Member #1',
      },
      {
        id: '2',
        title: 'Security Audits',
        description: 'Conduct comprehensive security audits with leading firms',
        amount: 20000,
        deadline: '2024-06-30',
        status: 'pending_verification' as const,
        verificationStatus: 'pending' as const,
        submittedAt: '2024-06-15',
        verifiedAt: null,
        verifier: null,
      },
    ],
    documents: [
      { name: 'Technical Specification', type: 'pdf', url: '#' },
      { name: 'Security Audit Report', type: 'pdf', url: '#' },
      { name: 'Code Repository', type: 'link', url: '#' },
    ],
  },
  {
    id: '2',
    title: 'NFT Marketplace Launch',
    creator: 'Sarah Kim',
    goal: 75000,
    raised: 75000,
    deadline: '2024-11-15',
    status: 'active' as const,
    milestones: [
      {
        id: '1',
        title: 'Smart Contract Development',
        description: 'Develop and deploy marketplace smart contracts',
        amount: 30000,
        deadline: '2024-08-15',
        status: 'completed' as const,
        verificationStatus: 'verified' as const,
        submittedAt: '2024-08-10',
        verifiedAt: '2024-08-12',
        verifier: 'DAO Member #2',
      },
      {
        id: '2',
        title: 'Frontend Development',
        description: 'Build user interface and integrate with smart contracts',
        amount: 25000,
        deadline: '2024-10-15',
        status: 'completed' as const,
        verificationStatus: 'verified' as const,
        submittedAt: '2024-10-10',
        verifiedAt: '2024-10-12',
        verifier: 'DAO Member #3',
      },
    ],
    documents: [
      { name: 'Smart Contract Code', type: 'link', url: '#' },
      { name: 'Frontend Demo', type: 'link', url: '#' },
      { name: 'User Testing Report', type: 'pdf', url: '#' },
    ],
  },
];

const mockDaoStats = {
  totalCampaigns: 24,
  pendingVerification: 8,
  verifiedThisMonth: 12,
  activeVerifiers: 15,
};

export default function DAOPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleVerify = (campaignId: string, milestoneId: string) => {
    // In a real app, this would make an API call
    console.log('Verifying milestone:', campaignId, milestoneId);
  };

  const handleReject = (campaignId: string, milestoneId: string) => {
    // In a real app, this would make an API call
    console.log('Rejecting milestone:', campaignId, milestoneId);
  };

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    if (filter === 'all') return true;
    if (filter === 'pending') return campaign.status === 'pending_verification';
    if (filter === 'verified') return campaign.status === 'active';
    return false;
  });

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
              { key: 'all', label: 'All Campaigns', count: mockCampaigns.length },
              { key: 'pending', label: 'Pending', count: mockCampaigns.filter(c => c.status === 'pending_verification').length },
              { key: 'verified', label: 'Verified', count: mockCampaigns.filter(c => c.status === 'active').length },
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
              <Card key={campaign.id}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{campaign.title}</h3>
                    <p className="text-foreground/70 mb-4">by {campaign.creator}</p>

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

                {/* Milestones */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Milestones</h4>
                  {campaign.milestones.map((milestone) => (
                    <div key={milestone.id} className="border-2 border-foreground/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground mb-1">{milestone.title}</h5>
                          <p className="text-sm text-foreground/70 mb-2">{milestone.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-foreground/60">
                            <span>{formatAmount(milestone.amount)}</span>
                            <span>Due: {milestone.deadline}</span>
                            <span>Submitted: {milestone.submittedAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${milestone.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : milestone.verificationStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {milestone.verificationStatus}
                          </span>

                          {milestone.verificationStatus === 'pending' && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={() => handleVerify(campaign.id, milestone.id)}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(campaign.id, milestone.id)}
                                className="border-red-500 text-red-500 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="mt-3">
                        <p className="text-sm text-foreground/70 mb-2">Documents:</p>
                        <div className="flex flex-wrap gap-2">
                          {campaign.documents.map((doc, index) => (
                            <a
                              key={index}
                              href={doc.url}
                              className="inline-flex items-center px-3 py-1 bg-secondary text-foreground text-sm rounded-full hover:bg-secondary/80 transition-colors"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              {doc.name}
                            </a>
                          ))}
                        </div>
                      </div>

                      {milestone.verifiedAt && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Verified by:</strong> {milestone.verifier} on {milestone.verifiedAt}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
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
