"use client";

import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Zap,
  Users,
  Shield,
  Layers,
  Wallet,
  Clock,
  CheckCircle,
  TrendingUp,
  Split,
  ArrowRightLeft,
  Eye,
  Smartphone,
  Database,
  Lock,
  ArrowDown,
  ArrowDownRight,
  ArrowDownLeft,
} from "lucide-react";
import Button from "@/components/ui/button-new";
import Card from "@/components/ui/card-new";

const features = [
  {
    icon: Globe,
    title: "Cross-Chain Funding",
    description:
      "Fund projects across multiple blockchains seamlessly with Avail Nexus SDK integration.",
    details: [
      "Unified balance across all supported chains",
      "One-click cross-chain transfers",
      "Support for Ethereum, Polygon, Arbitrum, Optimism, and Base",
      "Real-time balance synchronization",
    ],
  },
  {
    icon: Zap,
    title: "EIP-7702 Automation",
    description:
      "Automated payroll streaming and milestone-based fund distribution using EIP-7702.",
    details: [
      "Recurring payment subscriptions",
      "Automated payroll distribution",
      "Time-based delegation management",
      "Smart contract automation",
    ],
  },
  {
    icon: Users,
    title: "DAO Governance",
    description:
      "Community-driven verification and approval process for campaign milestones.",
    details: [
      "Decentralized campaign verification",
      "Community voting on milestones",
      "Transparent approval process",
      "DAO member permissions",
    ],
  },
  {
    icon: Split,
    title: "Smart Splits",
    description:
      "Automatically distribute contributions among team members with flexible split options.",
    details: [
      "Equal distribution splits",
      "Percentage-based allocations",
      "Custom amount distributions",
      "Team member management",
    ],
  },
  {
    icon: ArrowRightLeft,
    title: "Cross-Chain Bridge",
    description:
      "Seamlessly move assets between different blockchains with our integrated bridge.",
    details: [
      "Multi-chain asset transfers",
      "Real-time transaction tracking",
      "Gas optimization",
      "Transaction status monitoring",
    ],
  },
  {
    icon: Eye,
    title: "Transaction Explorer",
    description:
      "Explore and track all transactions with integrated Blockscout SDK.",
    details: [
      "Real-time transaction monitoring",
      "Cross-chain transaction history",
      "Detailed transaction analytics",
      "Explorer integration",
    ],
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Campaign",
    description:
      "Set up your crowdfunding campaign with detailed information, milestones, and team members.",
    icon: Smartphone,
    details: [
      "Campaign details and description",
      "Funding goals and deadlines",
      "Milestone planning",
      "Team member setup",
      "Document uploads",
    ],
  },
  {
    number: "02",
    title: "DAO Verification",
    description:
      "High-value campaigns undergo community verification for transparency and trust.",
    icon: Shield,
    details: [
      "Automatic DAO review for campaigns >$10K",
      "Community member verification",
      "Transparent approval process",
      "Campaign validation",
    ],
  },
  {
    number: "03",
    title: "Cross-Chain Contributions",
    description:
      "Contributors can fund from any supported chain using their unified balance.",
    icon: Globe,
    details: [
      "Unified balance management",
      "Cross-chain contribution flow",
      "One-time and recurring options",
      "Automatic chain detection",
    ],
  },
  {
    number: "04",
    title: "Smart Distribution",
    description:
      "Funds are automatically distributed among team members based on your split configuration.",
    icon: Split,
    details: [
      "Automatic fund splitting",
      "Flexible distribution options",
      "Real-time balance updates",
      "Team member notifications",
    ],
  },
  {
    number: "05",
    title: "Recurring Payments",
    description:
      "Set up automated recurring contributions using EIP-7702 delegation.",
    icon: Clock,
    details: [
      "Subscription-based funding",
      "Automated recurring payments",
      "Time-based delegation",
      "Flexible payment schedules",
    ],
  },
  {
    number: "06",
    title: "Milestone Tracking",
    description:
      "Track progress and release funds based on achieved milestones.",
    icon: TrendingUp,
    details: [
      "Progress monitoring",
      "Milestone-based releases",
      "Transparent reporting",
      "Community oversight",
    ],
  },
];

const benefits = [
  {
    icon: Lock,
    title: "Secure & Transparent",
    description:
      "All transactions are secured by smart contracts with full transparency.",
  },
  {
    icon: Layers,
    title: "Multi-Chain Support",
    description:
      "Support for major blockchains with seamless cross-chain functionality.",
  },
  {
    icon: Database,
    title: "Unified Experience",
    description:
      "Manage all your assets and campaigns from a single, intuitive interface.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
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
                How Nexican Works?
              </h1>

              {/* <div className="relative mb-8">
                <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  Discover how our{" "}
                  <span className="font-semibold text-primary">
                    cross-chain crowdfunding platform
                  </span>{" "}
                  revolutionizes Web3 funding with
                  <span className="font-semibold"> Avail Nexus SDK</span>,{" "}
                  <span className="font-semibold">EIP-7702 automation</span>,
                  and
                  <span className="font-semibold"> DAO governance</span>.
                </p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
              </div> */}

              {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/create" className="group">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto transition-transform duration-200"
                  >
                    <span className="flex items-center">
                      Start Your Campaign
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
              </div> */}
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Platform Features
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Built with cutting-edge Web3 technology for transparent,
                automated, and cross-chain funding.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="h-full">
                    <div className="p-6">
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-foreground/70 text-sm mb-4">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-center text-sm text-foreground/60"
                          >
                            <CheckCircle className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Steps */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                A simple 6-step process to launch and manage your cross-chain
                crowdfunding campaign.
              </p>
            </div>

            {/* Hexagonal Steps Layout */}
            <div className="relative max-w-6xl mx-auto">
              {/* Steps in Hexagonal Pattern */}
              <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCenter = index === 2 || index === 5; // Steps 3 and 6 are center
                  const isLeft = index === 0 || index === 3; // Steps 1 and 4 are left
                  const isRight = index === 1 || index === 4; // Steps 2 and 5 are right

                  return (
                    <div
                      key={index}
                      className={`relative ${
                        isLeft
                          ? "lg:col-start-1"
                          : isCenter
                          ? "lg:col-start-2"
                          : "lg:col-start-3"
                      } ${index >= 3 ? "lg:mt-16" : ""}`}
                    >
                      {/* Floating Step Card */}
                      <Card className="relative group hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                        {/* Step Number Badge */}
                        <div className="absolute -top-4 -right-4 w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg z-10">
                          {step.number}
                        </div>

                        {/* Icon Container */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        <div className="pt-12 p-6">
                          <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                            {step.title}
                          </h3>
                          <p className="text-foreground/70 text-center mb-4 text-sm">
                            {step.description}
                          </p>

                          {/* Step Details */}
                          <div className="space-y-2">
                            {step.details.map((detail, detailIndex) => (
                              <div
                                key={detailIndex}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-foreground/60 leading-relaxed">
                                  {detail}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Technology Stack
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Built on the latest Web3 technologies for maximum security,
                efficiency, and user experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <div className="p-6">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Avail Nexus SDK
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    Cross-chain infrastructure for seamless multi-blockchain
                    operations
                  </p>
                </div>
              </Card>
              <Card className="text-center">
                <div className="p-6">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    EIP-7702 Protocol
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    Account abstraction for automated recurring payments and
                    delegation
                  </p>
                </div>
              </Card>
              <Card className="text-center">
                <div className="p-6">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Smart Contracts
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    Secure, transparent, and automated fund management with
                    milestone-based releases
                  </p>
                </div>
              </Card>
              <Card className="text-center">
                <div className="p-6">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Blockscout SDK
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    Real-time transaction monitoring and blockchain analytics
                    integration
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Nexican?
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Experience the future of Web3 crowdfunding with our innovative
                platform.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="text-center">
                    <div className="p-6">
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-foreground/70 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-primary gradient-secondary">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-foreground/70 mb-8">
                Join the future of cross-chain crowdfunding. Create your
                campaign today and experience seamless Web3 funding.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create">
                  <Button size="lg">
                    <span className="flex items-center">
                      Create Your Campaign
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  </Button>
                </Link>
                <Link href="/campaigns">
                  <Button variant="outline" size="lg">
                    Explore Campaigns
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
