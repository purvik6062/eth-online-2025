'use client';

import { useAccount, useChainId } from 'wagmi';
import { useTransactionPopup } from '@blockscout/app-sdk';
import Button from '@/components/ui/button-new';
import Card from '@/components/ui/card-new';
import { History, ExternalLink, Wallet, AlertCircle } from 'lucide-react';

export default function ActivitiesPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openPopup } = useTransactionPopup();

  // Map chain IDs to their names and check if they're supported by Blockscout
  const getChainInfo = (chainId: number) => {
    const chainMap: Record<number, { name: string; supported: boolean }> = {
      1: { name: 'Ethereum Mainnet', supported: true },
      11155111: { name: 'Sepolia Testnet', supported: true },
      137: { name: 'Polygon Mainnet', supported: true },
      42161: { name: 'Arbitrum One', supported: true },
      10: { name: 'Optimism', supported: true },
      421614: { name: 'Arbitrum Sepolia', supported: true },
      84532: { name: 'Base Sepolia', supported: true },
      80002: { name: 'Polygon Amoy', supported: true },
    };

    return chainMap[chainId] || { name: `Chain ${chainId}`, supported: false };
  };

  const currentChainInfo = getChainInfo(chainId);

  const handleViewTransactions = () => {
    if (isConnected && address) {
      openPopup({
        chainId: chainId.toString(),
        address: address,
      });
    }
  };

  const handleViewAllTransactions = () => {
    openPopup({
      chainId: chainId.toString(),
    });
  };


  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Explorer</h1>
          <p className="text-muted-foreground">
            View your transaction history and activity across the blockchain
          </p>
        </div>

        {!isConnected ? (
          <Card className="max-w-md mx-auto text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view your transaction activities
            </p>
            <p className="text-sm text-muted-foreground">
              Once connected, you'll be able to see all your transactions and activities
            </p>
          </Card>
        ) : !currentChainInfo.supported ? (
          <Card className="max-w-md mx-auto text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Chain Not Supported</h2>
            <p className="text-muted-foreground mb-4">
              The current chain ({currentChainInfo.name}) is not supported by Blockscout
            </p>
            <p className="text-sm text-muted-foreground">
              Please switch to a supported chain to view transaction activities
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5" />
                <h2 className="text-xl font-bold text-foreground">Transaction History</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                View your recent transactions and activities on the blockchain
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Your Address Transactions</h3>
                  <p className="text-sm text-muted-foreground">
                    View all transactions for your connected address: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                  <Button onClick={handleViewTransactions} className="w-full">
                    <History className="w-4 h-4 mr-2" />
                    View My Transactions
                  </Button>
                </div>

                {/* <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">All Network Transactions</h3>
                  <p className="text-sm text-muted-foreground">
                    View all recent transactions on the {currentChainInfo.name}
                  </p>
                  <Button onClick={handleViewAllTransactions} variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View All Transactions
                  </Button>
                </div> */}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Network: {currentChainInfo.name}</span>
                  <span>Chain ID: {chainId}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-foreground mb-4">About Transaction History</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  The transaction history is powered by Blockscout, providing real-time updates
                  and detailed transaction information.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Real-time transaction status updates</li>
                  <li>Detailed transaction interpretations</li>
                  <li>Links to block explorer</li>
                  <li>Mobile-responsive design</li>
                  <li>Automatic status polling</li>
                </ul>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
