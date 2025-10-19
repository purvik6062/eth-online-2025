'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Pause, Settings, TrendingUp, Users, DollarSign, Clock, Zap } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressBar from '@/components/ui/ProgressBar';

// Mock data for streaming visualization
const mockStreams = [
  {
    id: '1',
    campaign: 'DeFi Protocol Upgrade',
    teamMember: 'Alex Chen',
    role: 'Lead Developer',
    percentage: 40,
    hourlyRate: 50,
    totalStreamed: 12500,
    monthlyStreamed: 8000,
    status: 'active' as const,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '2',
    campaign: 'DeFi Protocol Upgrade',
    teamMember: 'Sarah Kim',
    role: 'Smart Contract Developer',
    percentage: 30,
    hourlyRate: 45,
    totalStreamed: 9500,
    monthlyStreamed: 6000,
    status: 'active' as const,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '3',
    campaign: 'DeFi Protocol Upgrade',
    teamMember: 'Mike Johnson',
    role: 'Frontend Developer',
    percentage: 20,
    hourlyRate: 40,
    totalStreamed: 6200,
    monthlyStreamed: 4000,
    status: 'paused' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '4',
    campaign: 'DeFi Protocol Upgrade',
    teamMember: 'Lisa Wang',
    role: 'UI/UX Designer',
    percentage: 10,
    hourlyRate: 35,
    totalStreamed: 3100,
    monthlyStreamed: 2000,
    status: 'active' as const,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
];

const mockStreamingData = [
  { time: '00:00', amount: 0 },
  { time: '04:00', amount: 200 },
  { time: '08:00', amount: 450 },
  { time: '12:00', amount: 750 },
  { time: '16:00', amount: 1100 },
  { time: '20:00', amount: 1450 },
  { time: '24:00', amount: 1800 },
];

export default function PayrollPage() {
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  const totalStreamed = mockStreams.reduce((sum, stream) => sum + stream.totalStreamed, 0);
  const monthlyStreamed = mockStreams.reduce((sum, stream) => sum + stream.monthlyStreamed, 0);
  const activeStreams = mockStreams.filter(stream => stream.status === 'active').length;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleStream = (streamId: string) => {
    // In a real app, this would make an API call
    console.log('Toggling stream:', streamId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Payroll Streaming
            </h1>
            <p className="text-lg text-foreground/70">
              Real-time visualization and management of automated payroll streams
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Total Streamed</p>
                  <p className="text-2xl font-bold text-foreground">{formatAmount(totalStreamed)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-foreground">{formatAmount(monthlyStreamed)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Active Streams</p>
                  <p className="text-2xl font-bold text-foreground">{activeStreams}</p>
                </div>
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Team Members</p>
                  <p className="text-2xl font-bold text-foreground">{mockStreams.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stream Visualization */}
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-2xl font-bold text-foreground mb-6">Real-time Streaming</h2>

                {/* Streaming Chart */}
                <div className="bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Cumulative Streamed Amount</h3>
                    <div className="flex items-center space-x-2 text-sm text-foreground/70">
                      <Clock className="w-4 h-4" />
                      <span>Last 24 hours</span>
                    </div>
                  </div>

                  {/* Simple line chart representation */}
                  <div className="relative h-32">
                    <svg className="w-full h-full" viewBox="0 0 400 100">
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        points={mockStreamingData.map((point, index) =>
                          `${index * (400 / (mockStreamingData.length - 1))},${100 - (point.amount / 20)}`
                        ).join(' ')}
                        className="text-primary"
                      />
                      {mockStreamingData.map((point, index) => (
                        <circle
                          key={index}
                          cx={index * (400 / (mockStreamingData.length - 1))}
                          cy={100 - (point.amount / 20)}
                          r="3"
                          fill="currentColor"
                          className="text-primary"
                        />
                      ))}
                    </svg>
                  </div>

                  <div className="flex justify-between text-xs text-foreground/60 mt-2">
                    {mockStreamingData.map((point, index) => (
                      <span key={index}>{point.time}</span>
                    ))}
                  </div>
                </div>

                {/* Stream Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="group">
                      <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Resume All
                    </Button>
                    <Button variant="outline" size="sm" className="group">
                      <Pause className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Pause All
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="group">
                    <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                    Settings
                  </Button>
                </div>
              </Card>
            </div>

            {/* Team Members List */}
            <div>
              <Card>
                <h2 className="text-2xl font-bold text-foreground mb-6">Team Members</h2>
                <div className="space-y-4">
                  {mockStreams.map((stream) => (
                    <div
                      key={stream.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedStream === stream.id
                        ? 'border-primary bg-primary/5'
                        : 'border-foreground/20 hover:border-primary/50'
                        }`}
                      onClick={() => setSelectedStream(stream.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={stream.avatar}
                            alt={stream.teamMember}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-foreground">{stream.teamMember}</p>
                            <p className="text-sm text-foreground/70">{stream.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stream.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {stream.status}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: any) => {
                              e.stopPropagation();
                              toggleStream(stream.id);
                            }}
                          >
                            {stream.status === 'active' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">Percentage:</span>
                          <span className="font-medium">{stream.percentage}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">Hourly Rate:</span>
                          <span className="font-medium">{formatAmount(stream.hourlyRate)}/hr</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">Total Streamed:</span>
                          <span className="font-medium">{formatAmount(stream.totalStreamed)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">This Month:</span>
                          <span className="font-medium">{formatAmount(stream.monthlyStreamed)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Detailed Stream Table */}
          <Card className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Stream Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-foreground/20">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Team Member</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Campaign</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Percentage</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Hourly Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Total Streamed</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStreams.map((stream) => (
                    <tr key={stream.id} className="border-b border-foreground/10">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={stream.avatar}
                            alt={stream.teamMember}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-foreground">{stream.teamMember}</p>
                            <p className="text-sm text-foreground/70">{stream.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-foreground">{stream.campaign}</td>
                      <td className="py-4 px-4">
                        <ProgressBar progress={stream.percentage} size="sm" showPercentage={false} />
                      </td>
                      <td className="py-4 px-4 text-foreground">{formatAmount(stream.hourlyRate)}/hr</td>
                      <td className="py-4 px-4 text-foreground font-medium">{formatAmount(stream.totalStreamed)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stream.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {stream.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStream(stream.id)}
                          >
                            {stream.status === 'active' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
