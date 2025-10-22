'use client';

import { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';

interface Campaign {
  campaignId: string;
  name: string;
  userAddress: string;
  chain: string;
}

interface RecurringSubscriptionFormProps {
  campaign: Campaign;
  onSuccess: () => void;
}

export default function RecurringSubscriptionForm({ campaign, onSuccess }: RecurringSubscriptionFormProps) {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    recipientAddress: campaign.userAddress,
    paymentToken: 'PYUSD',
    amountPerMonth: '',
    paymentFrequency: 'Monthly',
    numberOfMonths: '6',
    startDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'approve' | 'create'>('approve');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!formData.amountPerMonth || parseFloat(formData.amountPerMonth) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign.campaignId,
          subscriberAddress: address,
          recipientAddress: formData.recipientAddress,
          paymentToken: formData.paymentToken,
          amountPerPayment: parseFloat(formData.amountPerMonth),
          paymentFrequency: formData.paymentFrequency,
          numberOfPayments: parseInt(formData.numberOfMonths),
          startDate: formData.startDate || null,
          status: 'pending'
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Subscription created successfully!');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Create Subscription
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipientAddress">Recipient Address</Label>
            <Input
              id="recipientAddress"
              value={formData.recipientAddress}
              onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
              placeholder="0x... or name.eth"
              required
            />
          </div>

          {/* Payment Token */}
          <div className="space-y-2">
            <Label htmlFor="paymentToken">Payment Token</Label>
            <Select
              value={formData.paymentToken}
              onValueChange={(value) => handleInputChange('paymentToken', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PYUSD">PYUSD</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-foreground/70">Balance: 0 {formData.paymentToken}</p>
          </div>

          {/* Amount Per Month */}
          <div className="space-y-2">
            <Label htmlFor="amountPerMonth">Amount Per Month ({formData.paymentToken})</Label>
            <Input
              id="amountPerMonth"
              type="number"
              value={formData.amountPerMonth}
              onChange={(e) => handleInputChange('amountPerMonth', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Payment Frequency */}
          <div className="space-y-2">
            <Label htmlFor="paymentFrequency">Payment Frequency</Label>
            <Select
              value={formData.paymentFrequency}
              onValueChange={(value) => handleInputChange('paymentFrequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Months */}
          <div className="space-y-2">
            <Label htmlFor="numberOfMonths">Number of Payments</Label>
            <Input
              id="numberOfMonths"
              type="number"
              value={formData.numberOfMonths}
              onChange={(e) => handleInputChange('numberOfMonths', e.target.value)}
              placeholder="6"
              min="1"
              required
            />
          </div>

          {/* Start Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <div className="relative">
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
            </div>
            <p className="text-sm text-foreground/70">Defaults to 1 hour from now</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Approve {formData.paymentToken}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.amountPerMonth}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </div>
              ) : (
                'Approve & Create Subscription'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
