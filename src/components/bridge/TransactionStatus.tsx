"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TransactionStatusProps {
  error: string | null;
  success: string | null;
  transactionHash: string | null;
  isLoading: boolean;
}

export function TransactionStatus({
  error,
  success,
  transactionHash,
  isLoading,
}: TransactionStatusProps) {
  if (!error && !success && !isLoading) return null;

  return (
    <Card>
      <CardContent className="p-4">
        {isLoading && (
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing transaction...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 text-red-600">
            <XCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Transaction Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <div className="flex-1">
              <p className="font-medium">Transaction Successful</p>
              <p className="text-sm">{success}</p>
              {transactionHash && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://etherscan.io/tx/${transactionHash}`,
                        "_blank"
                      )
                    }
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on Explorer
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
