import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Card from "@/components/ui/card-new";
import { useState } from "react";

interface ChainBreakdown {
  chain: {
    id: number;
    name: string;
    logo?: string;
  };
  balance: string;
  balanceInFiat: number;
  decimals: number;
}

interface AssetData {
  symbol: string;
  balance: string;
  balanceInFiat: number;
  breakdown: ChainBreakdown[];
}

interface BalanceCardProps {
  totalBalance: number;
  change24h: number;
  assets: AssetData[];
}

export default function BalanceCard({
  totalBalance,
  change24h,
  assets,
}: BalanceCardProps) {
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    return num.toFixed(Math.min(6, decimals));
  };

  const isPositive = change24h >= 0;

  const toggleAssetExpansion = (symbol: string) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(symbol)) {
      newExpanded.delete(symbol);
    } else {
      newExpanded.add(symbol);
    }
    setExpandedAssets(newExpanded);
  };

  return (
    <Card className="gradient-primary text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Unified Balance</h3>
            <p className="text-white/80 text-sm">
              Cross-chain via Avail Nexus SDK
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{formatAmount(totalBalance)}</div>
          <div
            className={`flex items-center space-x-1 text-sm ${
              isPositive ? "text-green-200" : "text-red-200"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">24h Change</span>
          <span
            className={`font-semibold ${
              isPositive ? "text-green-200" : "text-red-200"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatAmount(totalBalance * (change24h / 100))}
          </span>
        </div>

        <div className="border-t border-white/20 pt-3">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-white/80">Asset Breakdown</span>
            <TrendingUp className="w-4 h-4 text-white/60" />
          </div>
          <div className="space-y-3">
            {assets
              .filter((asset) => parseFloat(asset.balance) > 0)
              .map((asset) => (
                <div key={asset.symbol} className="bg-white/10 rounded-lg p-3">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleAssetExpansion(asset.symbol)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white/60 rounded-full" />
                      <div>
                        <span className="text-white/90 font-medium">
                          {asset.symbol}
                        </span>
                        <p className="text-xs text-white/70">
                          ${asset.balanceInFiat.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        {formatBalance(asset.balance, 6)}
                      </span>
                      {expandedAssets.has(asset.symbol) ? (
                        <ChevronDown className="w-4 h-4 text-white/60" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white/60" />
                      )}
                    </div>
                  </div>

                  {expandedAssets.has(asset.symbol) && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="space-y-2">
                        {asset.breakdown
                          .filter((chain) => parseFloat(chain.balance) > 0)
                          .map((chain, index) => (
                            <div
                              key={chain.chain.id}
                              className="flex items-center justify-between px-2 py-1"
                            >
                              <div className="flex items-center space-x-2">
                                {chain.chain.logo && (
                                  <img
                                    src={chain.chain.logo}
                                    alt={chain.chain.name}
                                    className="w-5 h-5 rounded-full"
                                  />
                                )}
                                <span className="text-sm text-white/90">
                                  {chain.chain.name}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-white">
                                  {formatBalance(chain.balance, chain.decimals)}
                                </p>
                                <p className="text-xs text-white/70">
                                  ${chain.balanceInFiat.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
