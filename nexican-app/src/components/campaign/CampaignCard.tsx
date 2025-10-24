import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/card-new';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/button-new';

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  deadline: string;
  backers: number;
  chain: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = (campaign.raised / campaign.goal) * 100;
  const isCompleted = campaign.status === 'completed';
  const isCancelled = campaign.status === 'cancelled';

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
    <Card className="group">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-lg mb-4 relative overflow-hidden">
        <Image
          src={campaign.image}
          alt={campaign.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 border-foreground ${isCompleted
            ? 'bg-green-100 text-green-800'
            : isCancelled
              ? 'bg-red-100 text-red-800'
              : 'bg-primary text-white'
            }`}>
            {campaign.status.toUpperCase()}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-background/90 text-foreground text-xs font-medium rounded border border-foreground/20">
            {campaign.chain}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          <p className="text-foreground/70 text-sm line-clamp-2">
            {campaign.description}
          </p>
        </div>

        <div className="space-y-3">
          <ProgressBar
            progress={progress}
            label={`${formatAmount(campaign.raised)} of ${formatAmount(campaign.goal)}`}
            size="md"
          />

          <div className="flex justify-between items-center text-sm text-foreground/70">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{campaign.backers} backers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDeadline(campaign.deadline)}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 justify-between w-full">
          <Link href={`/campaigns/${campaign.id}/contribute?tab=one-time`} className="w-full">
            <Button
              variant="primary"
              size="sm"
              className="flex w-full justify-center items-center"
              disabled={isCompleted || isCancelled}
            >
              {isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Contribute'}
            </Button>
          </Link>
          <Link href={`/campaigns/${campaign.id}`} className="w-full">
            <Button variant="outline" size="sm" className="flex w-full justify-center items-center">
              View
              <ExternalLink className="ml-2w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
