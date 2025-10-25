import React from "react";
import { useUnifiedBalance } from "@/hooks/useUnifiedBalance";
import Card from "@/components/ui/card-new";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet, AlertCircle, Loader2 } from "lucide-react";
import BalanceCard from "./campaign/BalanceCard";
import { useNexus } from "@avail-project/nexus-widgets";

interface UnifiedBalanceProps {
  /**
   * Whether to show the total balance at the top
   */
  showTotal?: boolean;
  /**
   * Whether to show individual asset balances
   */
  showAssets?: boolean;
  /**
   * Whether to show a refresh button
   */
  showRefresh?: boolean;
  /**
   * Custom title for the balance card
   */
  title?: string;
  /**
   * Size variant for the component
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether to show the component in a card layout
   */
  cardLayout?: boolean;
  /**
   * Custom className for styling
   */
  className?: string;
  /**
   * Whether to show fiat values
   */
  showFiat?: boolean;
  /**
   * Maximum number of assets to display (0 = show all)
   */
  maxAssets?: number;
}

/**
 * Reusable UnifiedBalance component that displays user's unified balance
 * Can be customized with various props for different use cases
 */
export const UnifiedBalance: React.FC<UnifiedBalanceProps> = () => {
  const {
    unifiedBalance,
    isLoading,
    error,
    refetch,
    totalBalance,
    formatBalance,
  } = useUnifiedBalance();

  // Add nexus-widgets integration for enhanced balance functionality
  const { isSdkInitialized, sdk } = useNexus();

  const balanceData = unifiedBalance
    ? {
        totalBalance: totalBalance,
        change24h: 0, // This would need to be calculated from historical data
        assets: unifiedBalance
          .filter((token) => parseFloat(token.balance) > 0)
          .map((token) => ({
            symbol: token.symbol,
            balance: token.balance,
            balanceInFiat: token.balanceInFiat,
            breakdown: token.breakdown || [],
          })),
      }
    : {
        totalBalance: 0,
        change24h: 0,
        assets: [],
      };

  return (
    <div className="max-w-7xl mx-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading your balance...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Unable to load balance</p>
            <p className="text-sm text-muted-foreground/70">{error}</p>
          </div>
        </div>
      ) : (
        <BalanceCard {...balanceData} />
      )}
    </div>
  );
};

export default UnifiedBalance;
