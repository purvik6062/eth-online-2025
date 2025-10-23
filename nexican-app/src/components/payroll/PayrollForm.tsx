"use client";

import { useState } from "react";
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
import { useNexus } from "@/providers/NexusProvider";
import {
  SUPPORTED_CHAINS,
  type SUPPORTED_CHAINS_IDS,
  type SUPPORTED_TOKENS,
} from "@avail-project/nexus-core";

type Recipient = { address: string; amount: string };

export default function PayrollForm() {
  const { nexusSDK } = useNexus();
  const [chain, setChain] = useState<SUPPORTED_CHAINS_IDS | null>(
    SUPPORTED_CHAINS.ETHEREUM
  );
  const [token, setToken] = useState<SUPPORTED_TOKENS | null>("ETH");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: "", amount: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const updateRecipient = (
    index: number,
    key: keyof Recipient,
    value: string
  ) => {
    setRecipients((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addRecipient = () =>
    setRecipients((prev) => [...prev, { address: "", amount: "" }]);
  const removeRecipient = (index: number) =>
    setRecipients((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!nexusSDK || !nexusSDK.isInitialized() || !chain || !token) return;
    const entries = recipients.filter((r) => r.address && r.amount);
    if (entries.length === 0) return;
    setSubmitting(true);
    try {
      // Simple sequential transfers for now; batching/intents can be integrated next
      for (const r of entries) {
        await nexusSDK.transfer({
          token,
          amount: r.amount,
          chainId: chain,
          recipient: r.address as `0x${string}`,
        });
      }
    } catch (e) {
      console.error("Payroll submission failed", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-transparent">
      <CardHeader>
        <CardTitle>Payroll Setup</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid grid-cols-2 gap-4">
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
              selectedChain={(chain ?? SUPPORTED_CHAINS.ETHEREUM).toString()}
              selectedToken={token ?? "ETH"}
              handleTokenSelect={setToken}
              isTestnet
            />
          </div>
        </div>
        <div className="grid gap-3">
          <Label>Recipients</Label>
          <div className="grid gap-3">
            {recipients.map((r, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-7 grid gap-2">
                  <Label htmlFor={`addr-${idx}`}>Address</Label>
                  <Input
                    id={`addr-${idx}`}
                    value={r.address}
                    onChange={(e) =>
                      updateRecipient(idx, "address", e.target.value)
                    }
                    placeholder="0x..."
                  />
                </div>
                <div className="col-span-3 grid gap-2">
                  <Label htmlFor={`amt-${idx}`}>Amount</Label>
                  <Input
                    id={`amt-${idx}`}
                    value={r.amount}
                    onChange={(e) =>
                      updateRecipient(idx, "amount", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeRecipient(idx)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div>
              <Button type="button" onClick={addRecipient}>
                Add recipient
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          disabled={!nexusSDK?.isInitialized() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Run Payroll"}
        </Button>
      </CardFooter>
    </Card>
  );
}
