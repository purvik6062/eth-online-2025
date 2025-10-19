import { Search, Filter, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/card-new';
import Button from '@/components/ui/button-new';
import CampaignCard from '@/components/campaign/CampaignCard';

// Mock data - in a real app, this would come from an API
const mockCampaigns = [
  {
    id: '1',
    title: 'DeFi Protocol Upgrade',
    description: 'Building the next generation of decentralized finance with cross-chain compatibility and enhanced security features.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop',
    goal: 50000,
    raised: 32500,
    deadline: '2024-12-31',
    backers: 127,
    chain: 'Ethereum',
    status: 'active' as const,
  },
  {
    id: '2',
    title: 'NFT Marketplace Launch',
    description: 'Creating a revolutionary NFT marketplace with zero-fee trading and cross-chain support.',
    image: 'https://images.unsplash.com/photo-1639322537504-6427a16b612b786?w=500&h=300&fit=crop',
    goal: 75000,
    raised: 75000,
    deadline: '2024-11-15',
    backers: 89,
    chain: 'Polygon',
    status: 'completed' as const,
  },
  {
    id: '3',
    title: 'Gaming DAO Infrastructure',
    description: 'Developing infrastructure for gaming DAOs with automated governance and reward distribution.',
    image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=500&h=300&fit=crop',
    goal: 100000,
    raised: 45000,
    deadline: '2025-01-20',
    backers: 203,
    chain: 'Arbitrum',
    status: 'active' as const,
  },
  {
    id: '4',
    title: 'Cross-Chain Bridge Protocol',
    description: 'Building a secure and efficient bridge for seamless asset transfers across multiple blockchains.',
    image: 'https://images.unsplash.com/photo-1639322537504-6427a16b612b786?w=500&h=300&fit=crop',
    goal: 120000,
    raised: 85000,
    deadline: '2025-02-28',
    backers: 156,
    chain: 'Ethereum',
    status: 'active' as const,
  },
  {
    id: '5',
    title: 'Decentralized Social Media',
    description: 'Creating a censorship-resistant social media platform with user-owned data and content.',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
    goal: 80000,
    raised: 32000,
    deadline: '2025-03-15',
    backers: 78,
    chain: 'Polygon',
    status: 'active' as const,
  },
  {
    id: '6',
    title: 'AI-Powered DeFi Analytics',
    description: 'Developing machine learning tools for DeFi risk assessment and yield optimization.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop',
    goal: 60000,
    raised: 60000,
    deadline: '2024-10-30',
    backers: 92,
    chain: 'Arbitrum',
    status: 'completed' as const,
  },
];

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
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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
                All Campaigns ({mockCampaigns.length})
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
              {mockCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Campaigns
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Stats Section */}
          <div className="mt-16 py-12 gradient-primary text-white rounded-2xl">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
