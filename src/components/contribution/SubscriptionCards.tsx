'use client';

import { Calendar, User, DollarSign, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressBar from '@/components/ui/ProgressBar';

interface Subscription {
  _id: string;
  subscriptionId: string;
  campaignId: string;
  subscriberAddress: string;
  recipientAddress: string;
  paymentToken: string;
  amountPerPayment: number;
  paymentFrequency: string;
  numberOfPayments: number;
  completedPayments: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  startDate: string;
  createdAt: string;
}

interface SubscriptionCardsProps {
  subscriptions: Subscription[];
}

export default function SubscriptionCards({ subscriptions }: SubscriptionCardsProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const formatAddress = (address: string) => {
    if (address.endsWith('.eth')) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map((subscription, index) => (
        <Card key={subscription._id} className="bg-cream border-2 border-foreground/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Subscription #{index + 1}
              </CardTitle>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subscription.status)}`}>
                {subscription.status === 'completed' ? 'Completed/Cancelled' : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-foreground/70">
                  {subscription.completedPayments}/{subscription.numberOfPayments} periods
                </span>
              </div>
              <ProgressBar
                progress={getProgressPercentage(subscription.completedPayments, subscription.numberOfPayments)}
                size="sm"
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-foreground/70" />
                  <div>
                    <div className="font-medium">
                      Subscriber: {formatAddress(subscription.subscriberAddress)}
                      <span className="text-foreground/60 ml-1">(You)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-foreground/70" />
                  <div>
                    <div className="font-medium">
                      Amount Per Payment: {formatAmount(subscription.amountPerPayment)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-foreground/70" />
                  <div>
                    <div className="font-medium">
                      Remaining Amount: {formatAmount((subscription.numberOfPayments - subscription.completedPayments) * subscription.amountPerPayment)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-foreground/70" />
                  <div>
                    <div className="font-medium">
                      Recipient: {formatAddress(subscription.recipientAddress)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-foreground/70" />
                  <div>
                    <div className="font-medium">
                      Frequency: {subscription.paymentFrequency}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-foreground/70" />
                  <div>
                    <div className="font-medium">
                      Periods Left: {subscription.numberOfPayments - subscription.completedPayments} of {subscription.numberOfPayments}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {subscription.status === 'active' ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Subscription is active
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Subscription is not active
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
