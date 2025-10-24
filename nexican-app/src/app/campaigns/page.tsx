'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ArrowRight, Clock, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/card-new';
import Button from '@/components/ui/button-new';
import CampaignCard from '@/components/campaign/CampaignCard';

interface Campaign {
  campaignId: string;
  name: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  deadline: string;
  backers: number;
  chain: string;
  status: 'active' | 'completed' | 'pending_verification' | 'rejected' | 'approved';
  daoVerificationRequired: boolean;
  isPublic: boolean;
  createdAt: string;
  creatorWalletAddress: string;
}

const categories = [
  'All',
  'DeFi',
  'NFT',
  'Gaming',
  'Infrastructure',
  'Social',
  'AI/ML',
];

const chains = [
  'All Chains',
  'Ethereum',
  'Polygon',
  'Arbitrum',
  'Optimism',
  'Base',
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const campaignsPerPage = 9;

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns');
      const result = await response.json();

      if (result.success) {
        setCampaigns(result.data);
        setTotalPages(Math.ceil(result.data.length / campaignsPerPage));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch campaigns');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * campaignsPerPage;
  const endIndex = startIndex + campaignsPerPage;
  const currentCampaigns = campaigns.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-foreground/70">Loading campaigns...</p>
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
              <Button onClick={fetchCampaigns}>Try Again</Button>
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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore Campaigns
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Discover innovative projects and support creators across multiple blockchains
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search campaigns, creators, or keywords..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {categories.map(category => (
                      <option key={category} value={category.toLowerCase()}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Blockchain
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {chains.map(chain => (
                      <option key={chain} value={chain.toLowerCase()}>
                        {chain}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Active Only
                </Button>
                <Button variant="outline" size="sm">
                  Recently Launched
                </Button>
                <Button variant="outline" size="sm">
                  Almost Funded
                </Button>
                <Button variant="outline" size="sm">
                  High Goal
                </Button>
              </div>
            </div>
          </Card>

          {/* Campaigns Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                All Campaigns ({campaigns.length})
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-foreground/70">Sort by:</span>
                <select className="px-3 py-1 border border-foreground/30 rounded focus:outline-none focus:ring-1 focus:ring-primary/50">
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="ending">Ending Soon</option>
                  <option value="goal">Goal Amount</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCampaigns.map((campaign) => (
                <div key={campaign.campaignId} className="relative">
                  <CampaignCard
                    campaign={{
                      id: campaign.campaignId,
                      title: campaign.name,
                      description: campaign.description,
                      image: campaign.image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop',
                      goal: campaign.goal,
                      raised: campaign.raised,
                      deadline: campaign.deadline,
                      backers: campaign.backers,
                      chain: campaign.chain,
                      status: campaign.status as 'active' | 'completed' | 'cancelled'
                    }}
                  />
                  {campaign.daoVerificationRequired && campaign.status === 'pending_verification' && (
                    <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending DAO
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-outline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      const shouldShow =
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1;

                      if (!shouldShow) {
                        // Show ellipsis if there's a gap
                        const prevPage = Array.from({ length: totalPages }, (_, i) => i + 1)
                          .find(p => p < page && Math.abs(p - currentPage) <= 1);
                        if (prevPage && page - prevPage > 1) {
                          return (
                            <span key={`ellipsis-${page}`} className="px-2 text-foreground/60">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          onClick={() => handlePageChange(page)}
                          className={currentPage === page ? "btn-neobrutal" : "btn-outline"}
                          size="sm"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-outline"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Section */}
          {/* <div className="mt-16 py-12 gradient-primary text-white rounded-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Platform Impact</h2>
              <p className="text-xl text-white/80">
                Join thousands of creators and contributors building the future of Web3
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">$2.4M+</div>
                <div className="text-white/80">Total Raised</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">156</div>
                <div className="text-white/80">Active Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">8.2K</div>
                <div className="text-white/80">Contributors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">12</div>
                <div className="text-white/80">Supported Chains</div>
              </div>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
}
