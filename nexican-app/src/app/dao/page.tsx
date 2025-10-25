'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { CheckCircle, XCircle, Clock, Eye, Shield, Users, Target, AlertCircle, Calendar, DollarSign, User, FileText, ExternalLink, MapPin, Image as ImageIcon, Download, Link2, Award, TrendingUp, Activity, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/card-new';
import Button from '@/components/ui/button-new';
import ProgressBar from '@/components/ui/ProgressBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

// Static DAO member addresses - add your DAO member addresses here
const DAO_MEMBER_ADDRESSES = [
  "0xB351a70dD6E5282A8c84edCbCd5A955469b9b032",
  "0x7e3D3Ce78D53AaA557f38a9618976c230AEd9988"
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
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingCampaignId, setLoadingCampaignId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'approve' | 'reject' | null>(null);
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
        toast.error('Connect wallet to proceed');
        return;
      }

      setLoadingCampaignId(campaignId);
      setLoadingAction(action);

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
        toast.success(result.message);
        fetchDAOCampaigns(); // Refresh the list
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error verifying campaign:', error);
      toast.error('Failed to verify campaign. Please try again.');
    } finally {
      setLoadingCampaignId(null);
      setLoadingAction(null);
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

  const handleViewDetails = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
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
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-foreground/70">Loading DAO campaigns...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <Button onClick={fetchDAOCampaigns}>Try Again</Button>
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
                          disabled={loadingCampaignId === campaign.campaignId}
                        >
                          {loadingCampaignId === campaign.campaignId && loadingAction === 'approve' ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(campaign.campaignId, 'reject')}
                          className="cursor-pointer"
                          disabled={loadingCampaignId === campaign.campaignId}
                        >
                          {loadingCampaignId === campaign.campaignId && loadingAction === 'reject' ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-1" />
                          )}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(campaign)}
                    className="cursor-pointer"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast("Coming Soon!")}>
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

      {/* Campaign Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Campaign Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the selected campaign
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-6">
              {/* Campaign Header */}
              <div className="bg-secondary/50 p-4 rounded-lg border-2 border-foreground/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{selectedCampaign.name}</h3>
                    <div className="flex items-center gap-2 text-foreground/70 mb-3">
                      <User className="w-4 h-4" />
                      <span>by {selectedCampaign.userAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/70">
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">{selectedCampaign.chain || 'Ethereum'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCampaign.status === 'pending_verification'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedCampaign.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedCampaign.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {selectedCampaign.daoVerificationRequired && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        DAO Required
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Campaign Image */}
              {selectedCampaign.image && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Campaign Image
                  </h4>
                  <div className="relative w-full h-48 bg-secondary/30 rounded-lg border border-foreground/10 overflow-hidden">
                    <img
                      src={selectedCampaign.image}
                      alt={selectedCampaign.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Campaign Description */}
              {selectedCampaign.description && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Description
                  </h4>
                  <p className="text-foreground/70 leading-relaxed bg-secondary/30 p-4 rounded-lg border border-foreground/10">
                    {selectedCampaign.description}
                  </p>
                </div>
              )}

              {/* Financial Information */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg border border-foreground/10">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Goal</h4>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatAmount(selectedCampaign.goal)}</p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg border border-foreground/10">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-foreground">Raised</h4>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatAmount(selectedCampaign.raised)}</p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg border border-foreground/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Backers</h4>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedCampaign.backers || 0}</p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg border border-foreground/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Deadline</h4>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{selectedCampaign.deadline}</p>
                </div>
              </div>

              {/* Milestones Section */}
              {selectedCampaign.milestones && selectedCampaign.milestones.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Milestones ({selectedCampaign.milestones.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedCampaign.milestones.map((milestone: any, index: number) => (
                      <div key={milestone.id || index} className="bg-secondary/30 p-4 rounded-lg border border-foreground/10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground text-lg">{milestone.title}</h5>
                            <p className="text-foreground/70 mt-1">{milestone.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${milestone.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : milestone.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {milestone.status?.replace('-', ' ').toUpperCase() || 'PENDING'}
                            </span>
                            <span className="text-lg font-bold text-foreground">
                              {formatAmount(milestone.amount)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-foreground/60">
                          <span>Deadline: {milestone.deadline}</span>
                          <span>Milestone #{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Campaign Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Campaign Statistics
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Created</span>
                      <span className="text-foreground">{selectedCampaign.createdAt ? new Date(selectedCampaign.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-foreground/70">Last Updated</span>
                      <span className="text-foreground">{selectedCampaign.updatedAt ? new Date(selectedCampaign.updatedAt).toLocaleDateString() : 'N/A'}</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Creator</span>
                      <span className="text-foreground font-mono text-sm">{selectedCampaign.userAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Activity Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Total Milestones</span>
                      <span className="text-foreground">{selectedCampaign.milestones?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Completed Milestones</span>
                      <span className="text-foreground">
                        {selectedCampaign.milestones?.filter((m: any) => m.status === 'completed').length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Links */}
              {(selectedCampaign.website || selectedCampaign.socialLinks) && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    External Links
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.website && (
                      <a
                        href={selectedCampaign.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </a>
                    )}
                    {selectedCampaign.socialLinks && Object.entries(selectedCampaign.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors border border-foreground/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification History */}
              {selectedCampaign.verificationHistory && selectedCampaign.verificationHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Verification History
                  </h4>
                  <div className="space-y-2">
                    {selectedCampaign.verificationHistory.map((verification: any, index: number) => (
                      <div key={index} className="bg-secondary/30 p-3 rounded-lg border border-foreground/10">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${verification.action === 'approve'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {verification.action.toUpperCase()}
                          </span>
                          <span className="text-sm text-foreground/70">
                            {new Date(verification.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/70 mt-1">
                          by {verification.verifierId}
                        </p>
                        {verification.comments && (
                          <p className="text-sm text-foreground/60 mt-1 italic">
                            "{verification.comments}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
            {selectedCampaign?.status === 'pending_verification' && isDaoMember && (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    handleVerify(selectedCampaign.campaignId, 'approve');
                    closeModal();
                  }}
                  className="cursor-pointer"
                  disabled={loadingCampaignId === selectedCampaign.campaignId}
                >
                  {loadingCampaignId === selectedCampaign.campaignId && loadingAction === 'approve' ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleVerify(selectedCampaign.campaignId, 'reject');
                    closeModal();
                  }}
                  className="cursor-pointer"
                  disabled={loadingCampaignId === selectedCampaign.campaignId}
                >
                  {loadingCampaignId === selectedCampaign.campaignId && loadingAction === 'reject' ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  Reject
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
