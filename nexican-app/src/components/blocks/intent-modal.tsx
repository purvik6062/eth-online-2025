import { useNexus } from "@/providers/NexusProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  CHAIN_METADATA,
  type OnIntentHookData,
} from "@avail-project/nexus-core";
import { useEffect, useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

const IntentModal = ({ intent }: { intent: OnIntentHookData }) => {
  const { intentRefCallback } = useNexus();
  const { intent: intentData, refresh, allow, deny } = intent;
  const [open, setOpen] = useState(!!intent);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [closedByAllow, setClosedByAllow] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [allowError, setAllowError] = useState<string | null>(null);

  const formatCost = (cost: string) => {
    const numCost = parseFloat(cost);
    if (numCost === 0) return "Free";
    if (numCost < 0.001) return "< 0.001";
    return numCost.toFixed(6);
  };

  const handleAllow = async () => {
    if (isRefreshing) return;
    setAllowError(null);
    setClosedByAllow(true);
    if (refreshTimer) {
      clearInterval(refreshTimer);
      setRefreshTimer(null);
    }
    try {
      await allow();
      setOpen(false);
    } catch (error) {
      console.error("Error allowing intent:", error);
      // Reset the state to allow retry
      setClosedByAllow(false);
      setAllowError(
        error instanceof Error
          ? error.message
          : "Transaction failed. Please try again."
      );
    }
  };

  const handleDeny = () => {
    console.log("deny called", intentRefCallback.current);
    deny();
    intentRefCallback.current = null;
    setOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  useEffect(() => {
    // start periodic refresh until user accepts/denies
    const interval = setInterval(() => {
      if (!closedByAllow) handleRefresh();
    }, 5000);
    setRefreshTimer(interval as unknown as NodeJS.Timeout);
    return () => clearInterval(interval);
  }, [closedByAllow]);
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (refreshTimer) {
            clearInterval(refreshTimer);
            setRefreshTimer(null);
          }
          if (!closedByAllow) handleDeny();
        }
      }}
    >
      <DialogContent className="gap-y-3 bg-background border-2 border-foreground/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Confirm Transaction
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Please review the details of this transaction carefully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 py-2">
          {/* Transaction Route */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-1 text-xs">
              {/* Multiple Source Chains */}
              <div className="flex flex-col gap-y-2 flex-1">
                {intentData.sources &&
                  intentData.sources.map((source, index) => (
                    <div
                      key={`${source.chainID}-${index}`}
                      className="flex flex-col justify-center items-center gap-y-1 px-3 py-2"
                    >
                      <img
                        src={CHAIN_METADATA[source.chainID]?.logo ?? ""}
                        alt={source.chainName ?? ""}
                        width={24}
                        height={24}
                        className="rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="flex items-center gap-x-2">
                        <div className="text-foreground font-bold text-center text-sm bg-primary/10 px-2 py-1 rounded">
                          {source.amount} {intentData.token?.symbol}
                        </div>
                      </div>
                    </div>
                  ))}
                {/* Show total if multiple sources */}
                {intentData.sources &&
                  intentData.sources.length > 1 &&
                  intentData.sourcesTotal && (
                    <div className="text-xs text-center text-muted-foreground font-bold border-t border-muted pt-2">
                      Total: {intentData.sourcesTotal}{" "}
                      {intentData.token?.symbol}
                    </div>
                  )}
              </div>

              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

              {intentData.token && intentData.token.logo && (
                <img
                  src={intentData.token.logo}
                  alt={intentData.token.symbol}
                  className="rounded-full"
                  width={24}
                  height={24}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

              {/* Destination Chain */}
              <div className="flex flex-col justify-center items-center gap-y-1 px-3 py-2 flex-1">
                {intentData.destination && (
                  <>
                    <img
                      src={
                        CHAIN_METADATA[intentData.destination.chainID]?.logo ??
                        ""
                      }
                      alt={intentData.destination.chainName ?? ""}
                      width={24}
                      height={24}
                      className="rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="text-foreground font-bold text-center text-sm bg-primary/10 px-2 py-1 rounded">
                      {intentData.destination.amount} {intentData.token?.symbol}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fees Section */}
          {intentData.fees && (
            <div className="space-y-3 mt-6">
              <div className="p-4 space-y-3 bg-secondary/30 border-2 border-foreground/10 rounded-lg">
                {/* Individual Fees */}
                <div className="space-y-2 font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70">
                      Network Gas
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCost(intentData.fees.caGas ?? "0")}{" "}
                      {intentData.token?.symbol}
                    </span>
                  </div>

                  {intentData.fees.solver &&
                    parseFloat(intentData.fees.solver) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground/70">
                          Solver Fee
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatCost(intentData.fees.solver)}{" "}
                          {intentData.token?.symbol}
                        </span>
                      </div>
                    )}

                  {intentData.fees.protocol &&
                    parseFloat(intentData.fees.protocol) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground/70">
                          Protocol Fee
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatCost(intentData.fees.protocol)}{" "}
                          {intentData.token?.symbol}
                        </span>
                      </div>
                    )}

                  {intentData.fees.gasSupplied &&
                    parseFloat(intentData.fees.gasSupplied) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground/70">
                          Additional Gas
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatCost(intentData.fees.gasSupplied)}{" "}
                          {intentData.token?.symbol}
                        </span>
                      </div>
                    )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">
                      Total Gas Cost
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatCost(intentData.fees.total ?? "0")}{" "}
                      {intentData.token?.symbol}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total Cost */}
                <div className="flex justify-between items-center bg-primary/10 p-3 rounded-lg">
                  <span className="text-sm font-semibold text-primary">
                    Total Cost
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {formatCost(intentData.sourcesTotal ?? "0")}{" "}
                    {intentData.token?.symbol}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="w-11/12 pt-4 mx-auto">
          {allowError && (
            <div className="text-red-500 text-sm bg-red-50 border-2 border-red-200 p-3 rounded-lg mb-3">
              {allowError}
            </div>
          )}
          <div className="flex w-full justify-center items-center gap-4">
            <Button
              variant={"destructive"}
              onClick={handleDeny}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold w-1/2 cursor-pointer"
            >
              Deny
            </Button>
            <Button
              onClick={handleAllow}
              disabled={isRefreshing}
              className={cn(
                "font-semibold w-1/2 cursor-pointer",
                isRefreshing ? "bg-gray-500 cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-white"
              )}
            >
              {isRefreshing ? "Refreshing..." : "Allow"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IntentModal;
