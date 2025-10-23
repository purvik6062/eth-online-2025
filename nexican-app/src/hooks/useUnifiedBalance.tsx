import { useNexus } from "@/providers/NexusProvider";
import { type UserAsset } from "@avail-project/nexus-core";
import { useCallback, useEffect, useState } from "react";

interface UseUnifiedBalanceReturn {
  unifiedBalance: UserAsset[] | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalBalance: number;
  formatBalance: (balance: string, decimals: number) => string;
}

/**
 * Custom hook for fetching and managing unified balance data from Nexus SDK
 * Provides loading states, error handling, and utility functions for balance formatting
 *
 * @returns {UseUnifiedBalanceReturn} Object containing balance data, loading state, error state, and utility functions
 */
export const useUnifiedBalance = (): UseUnifiedBalanceReturn => {
  const [unifiedBalance, setUnifiedBalance] = useState<UserAsset[] | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { nexusSDK } = useNexus();

  const formatBalance = useCallback((balance: string, decimals: number) => {
    const num = parseFloat(balance);
    return num.toFixed(Math.min(6, decimals));
  }, []);

  const fetchUnifiedBalance = useCallback(async () => {
    if (!nexusSDK) {
      setError("Nexus SDK not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balance = await nexusSDK.getUnifiedBalances();
      console.log("Unified Balance:", balance);
      setUnifiedBalance(balance);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error fetching unified balance";
      console.error("Error fetching unified balance:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [nexusSDK]);

  useEffect(() => {
    if (nexusSDK) {
      fetchUnifiedBalance();
    }
  }, [nexusSDK, fetchUnifiedBalance]);

  const totalBalance =
    unifiedBalance?.reduce((acc, asset) => acc + asset.balanceInFiat, 0) || 0;

  return {
    unifiedBalance,
    isLoading,
    error,
    refetch: fetchUnifiedBalance,
    totalBalance,
    formatBalance,
  };
};
