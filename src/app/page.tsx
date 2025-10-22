"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe, Users, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BalanceCard from "@/components/campaign/BalanceCard";
import Button from "@/components/ui/button-new";
import Card from "@/components/ui/card-new";
import { useUnifiedBalance } from "@/hooks/useUnifiedBalance";
import UnifiedBalance from "@/components/UnifiedBalance";

const features = [
  {
    icon: Globe,
    title: "Cross-Chain Funding",
    description:
      "Fund projects across multiple blockchains seamlessly with Avail Nexus SDK integration.",
  },
  {
    icon: Shield,
    title: "Transparent Escrow",
    description:
      "Smart contract-based escrow ensures funds are released only when milestones are met.",
  },
  {
    icon: Zap,
    title: "EIP-7702 Automation",
    description:
      "Automated payroll streaming and milestone-based fund distribution using EIP-7702.",
  },
  {
    icon: Users,
    title: "DAO Governance",
    description:
      "Community-driven verification and approval process for campaign milestones.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-16 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center relative">
              {/* Floating background elements */}
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/10 rounded-full hero-float"></div>
              <div className="absolute -top-5 -right-10 w-16 h-16 bg-primary-light/10 rounded-full hero-float"></div>
              <div className="absolute top-20 left-1/4 w-12 h-12 bg-accent/10 rounded-full hero-float"></div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Fund across chains, effortlessly
              </h1>

              <div className="relative mb-8">
                <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  <span className="font-semibold text-primary">Nexican</span> is
                  the decentralized cross-chain crowdfunding and payroll
                  streaming platform built with{" "}
                  <span className="font-semibold">Avail Nexus SDK</span> and{" "}
                  <span className="font-semibold">EIP-7702 automation</span> for
                  the future of Web3 funding.
                </p>
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/create" className="group">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto transition-transform duration-200"
                  >
                    <span className="flex items-center">
                      Create Campaign
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  </Button>
                </Link>
                <Link href="/campaigns" className="group">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto transition-transform duration-200"
                  >
                    <span className="flex items-center">
                      Explore Campaigns
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  </Button>
                </Link>
              </div>

              {/* Technology badges */}
              {/* <div className="mt-12 flex flex-wrap justify-center gap-3">
                <span className="px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full border-2 border-primary/20 text-sm">
                  Avail Nexus SDK
                </span>
                <span className="px-4 py-2 bg-primary-light/10 text-primary-light font-semibold rounded-full border-2 border-primary-light/20 text-sm">
                  EIP-7702
                </span>
                <span className="px-4 py-2 bg-accent/10 text-accent font-semibold rounded-full border-2 border-accent/20 text-sm">
                  Cross-Chain
                </span>
                <span className="px-4 py-2 bg-secondary/50 text-foreground font-semibold rounded-full border-2 border-foreground/20 text-sm">
                  Smart Contracts
                </span>
              </div> */}
            </div>
          </div>
        </section>

        {/* Balance Summary */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <UnifiedBalance />
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Nexican?
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Built with cutting-edge Web3 technology for transparent,
                automated, and cross-chain funding.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="text-center">
                    <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 text-sm">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Top Campaigns Section */}
        {/* <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Top Active Campaigns
                </h2>
                <p className="text-lg text-foreground/70">
                  Discover and support innovative projects across the ecosystem
                </p>
              </div>
              <Link href="/campaigns">
                <Button variant="outline">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section> */}

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 gradient-primary text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Platform Statistics
              </h2>
              <p className="text-xl text-white/80">
                Trusted by thousands of creators and contributors worldwide
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
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="gradient-secondary">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Launch Your Campaign?
              </h2>
              <p className="text-lg text-foreground/70 mb-8">
                Join thousands of creators who trust Nexican for transparent,
                automated, and cross-chain crowdfunding.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create">
                  <Button size="lg">
                    <span className="flex items-center">
                      {" "}
                      Start Your Campaign
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg">
                    Learn How It Works
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
