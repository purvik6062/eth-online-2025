'use client';

import Image from 'next/image';
import { Clock, Users, Target, ExternalLink, Share2, Heart, Shield, Zap, Globe } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/card-new';
import Button from '@/components/ui/button-new';
import ProgressBar from '@/components/ui/ProgressBar';

// Mock data - in a real app, this would come from an API
const mockCampaign = {
  id: '1',
  title: 'DeFi Protocol Upgrade',
  description: 'Building the next generation of decentralized finance with cross-chain compatibility and enhanced security features. Our protocol will enable seamless asset transfers across multiple blockchains while maintaining the highest security standards.',
  longDescription: `
    We are developing a revolutionary DeFi protocol that addresses the current limitations in cross-chain interoperability. Our solution leverages cutting-edge technology including Avail Nexus SDK and EIP-7702 automation to create a truly decentralized and efficient financial ecosystem.

    ## Key Features:
    - Cross-chain asset transfers with minimal fees
    - Automated liquidity management
    - Enhanced security through smart contract audits
    - Community governance integration
    - Real-time streaming payments

    ## Technical Implementation:
    Our protocol is built on a robust architecture that ensures scalability, security, and user-friendly experience. We utilize the latest Web3 technologies to create a seamless bridge between different blockchain networks.

    ## Roadmap:
    - Q1 2024: Core protocol development
    - Q2 2024: Security audits and testing
    - Q3 2024: Beta launch on testnets
    - Q4 2024: Mainnet deployment
  `,
  image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
  goal: 50000,
  raised: 32500,
  deadline: '2024-12-31',
  backers: 127,
  chain: 'Ethereum',
  status: 'active' as const,
  creator: {
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    verified: true,
  },
  milestones: [
    {
      id: '1',
      title: 'Core Protocol Development',
      description: 'Complete the basic protocol architecture and smart contracts',
      amount: 15000,
      deadline: '2024-03-31',
      status: 'completed' as const,
    },
    {
      id: '2',
      title: 'Security Audits',
      description: 'Conduct comprehensive security audits with leading firms',
      amount: 20000,
      deadline: '2024-06-30',
      status: 'in-progress' as const,
    },
    {
      id: '3',
      title: 'Beta Testing',
      description: 'Launch beta version on testnets for community testing',
      amount: 10000,
      deadline: '2024-09-30',
      status: 'pending' as const,
    },
    {
      id: '4',
      title: 'Mainnet Launch',
      description: 'Deploy the protocol on mainnet with full functionality',
      amount: 5000,
      deadline: '2024-12-31',
      status: 'pending' as const,
    },
  ],
  sponsors: [
    { name: 'CryptoVentures', amount: 10000, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face' },
    { name: 'DeFi Capital', amount: 8500, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
    { name: 'Blockchain Fund', amount: 7500, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
    { name: 'Web3 Angels', amount: 6500, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
  ],
  escrow: {
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    status: 'active',
    streamingEnabled: true,
    totalStreamed: 15000,
  },
};

export default function CampaignDetail() {

  const progress = (mockCampaign.raised / mockCampaign.goal) * 100;

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

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Campaign Header */}
              <Card>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-lg mb-6 relative overflow-hidden">
                  <Image
                    src={mockCampaign.image}
                    alt={mockCampaign.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full border-2 border-white">
                      {mockCampaign.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 bg-background/90 text-foreground text-sm font-medium rounded border border-foreground/20">
                      {mockCampaign.chain}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                      {mockCampaign.title}
                    </h1>
                    <p className="text-lg text-foreground/70 leading-relaxed">
                      {mockCampaign.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" size="sm" className="group">
                      <Share2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="group">
                      <Heart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="group">
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
                  <div dangerouslySetInnerHTML={{ __html: mockCampaign.longDescription.replace(/\n/g, '<br>') }} />
                </div>
              </Card>

              {/* Milestones */}
              <Card>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-3" />
                  Milestones
                </h2>
                <div className="space-y-4">
                  {mockCampaign.milestones.map((milestone) => (
                    <div key={milestone.id} className="border-2 border-foreground/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${milestone.status === 'completed'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : milestone.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          {milestone.status.replace('-', ' ').toUpperCase()}
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

              {/* Sponsors */}
              <Card>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Top Sponsors
                </h2>
                <div className="space-y-3">
                  {mockCampaign.sponsors.map((sponsor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-foreground/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={sponsor.avatar}
                          alt={sponsor.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="font-medium text-foreground">{sponsor.name}</span>
                      </div>
                      <span className="font-semibold text-primary">{formatAmount(sponsor.amount)}</span>
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
                    {formatAmount(mockCampaign.raised)}
                  </div>
                  <div className="text-foreground/70">
                    raised of {formatAmount(mockCampaign.goal)} goal
                  </div>
                </div>

                <ProgressBar
                  progress={progress}
                  size="lg"
                  className="mb-6"
                />

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-foreground/70">
                    <span>{mockCampaign.backers} backers</span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDeadline(mockCampaign.deadline)}
                    </span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => console.log('Contribute clicked')}
                  >
                    Contribute Now
                  </Button>
                </div>
              </Card>

              {/* Creator Info */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Created by</h3>
                <div className="flex items-center space-x-3">
                  <Image
                    src={mockCampaign.creator.avatar}
                    alt={mockCampaign.creator.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{mockCampaign.creator.name}</span>
                      {mockCampaign.creator.verified && (
                        <Shield className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <span className="text-sm text-foreground/70">Verified Creator</span>
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
                      {mockCampaign.escrow.address}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Status:</span>
                    <span className="text-green-600 font-medium capitalize">{mockCampaign.escrow.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Streaming:</span>
                    <span className="text-green-600 font-medium">
                      {mockCampaign.escrow.streamingEnabled ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Streamed:</span>
                    <span className="font-medium">{formatAmount(mockCampaign.escrow.totalStreamed)}</span>
                  </div>
                </div>
              </Card>

              {/* Technology Stack */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Technology
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Cross-chain:</span>
                    <span className="font-medium">Avail Nexus SDK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Automation:</span>
                    <span className="font-medium">EIP-7702</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Escrow:</span>
                    <span className="font-medium">Smart Contracts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Streaming:</span>
                    <span className="font-medium">Real-time</span>
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
