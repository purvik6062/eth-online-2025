import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '@/components/ui/card-new';

interface BalanceCardProps {
  totalBalance: number;
  change24h: number;
  chains: Array<{
    name: string;
    balance: number;
    symbol: string;
  }>;
}

export default function BalanceCard({ totalBalance, change24h, chains }: BalanceCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const isPositive = change24h >= 0;

  return (
    <Card className="gradient-primary text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Unified Balance</h3>
            <p className="text-white/80 text-sm">Cross-chain via Avail Nexus SDK</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{formatAmount(totalBalance)}</div>
          <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-green-200' : 'text-red-200'
            }`}>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{isPositive ? '+' : ''}{change24h.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">24h Change</span>
          <span className={`font-semibold ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
            {isPositive ? '+' : ''}{formatAmount(totalBalance * (change24h / 100))}
          </span>
        </div>

        <div className="border-t border-white/20 pt-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/80">Chain Breakdown</span>
            <TrendingUp className="w-4 h-4 text-white/60" />
          </div>
          <div className="space-y-2">
            {chains.map((chain, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                  <span className="text-white/90">{chain.name}</span>
                </div>
                <span className="text-white font-medium">
                  {formatAmount(chain.balance)} {chain.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
