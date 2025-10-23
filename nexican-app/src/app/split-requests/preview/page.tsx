"use client";

import Link from "next/link";
import { useState } from "react";
import { useNexus } from "@/providers/NexusProvider";
import { useAccount } from "wagmi";
import ConnectWallet from "@/components/blocks/connect-wallet";
import NexusInitButton from "@/components/nexus-init";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChainSelect from "@/components/blocks/chain-select";
import TokenSelect from "@/components/blocks/token-select";
import {
  SUPPORTED_CHAINS,
  type SUPPORTED_CHAINS_IDS,
  type SUPPORTED_TOKENS,
} from "@avail-project/nexus-core";
import type { Address } from "viem";

export default function SplitRequestPreviewPage() {
  const { nexusSDK } = useNexus();
  const { address } = useAccount();
  const [chain, setChain] = useState<SUPPORTED_CHAINS_IDS | null>(
    SUPPORTED_CHAINS.ETHEREUM
  );
  const [token, setToken] = useState<SUPPORTED_TOKENS | null>("ETH");
  const [amount, setAmount] = useState<string>("");

  const handlePayShare = async () => {
    if (
      !nexusSDK ||
      !nexusSDK.isInitialized() ||
      !chain ||
      !token ||
      !amount ||
      !address
    )
      return;
    try {
      await nexusSDK.transfer({
        token,
        amount,
        chainId: chain,
        recipient: address as Address,
      });
    } catch (e) {
      console.error("Pay share failed", e);
    }
  };

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-8 gap-y-6">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <h1 className="text-2xl font-semibold">Split Request – Preview</h1>
        <nav className="flex gap-4">
          <Link href="/split-requests" className="underline">
            Back
          </Link>
        </nav>
      </div>

      <div className="flex gap-x-4 items-center">
        <ConnectWallet />
        <NexusInitButton />
      </div>

      {!nexusSDK?.isInitialized() ? (
        <p className="text-sm text-gray-600">
          Connect wallet and initialize Nexus to begin.
        </p>
      ) : (
        <Card className="w-full max-w-3xl bg-transparent">
          <CardHeader>
            <CardTitle>Settle Your Share</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Chain</Label>
                <ChainSelect
                  selectedChain={chain ?? SUPPORTED_CHAINS.ETHEREUM}
                  handleSelect={setChain}
                  isTestnet
                />
              </div>
              <div className="grid gap-2">
                <Label>Token</Label>
                <TokenSelect
                  selectedChain={(
                    chain ?? SUPPORTED_CHAINS.ETHEREUM
                  ).toString()}
                  selectedToken={token ?? "ETH"}
                  handleTokenSelect={setToken}
                  isTestnet
                />
              </div>
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="25"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePayShare}>Pay Share</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
