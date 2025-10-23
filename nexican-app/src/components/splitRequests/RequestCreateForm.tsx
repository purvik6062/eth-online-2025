"use client";

import { useMemo, useState } from "react";
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
import Link from "next/link";

type Payer = { address: string; share: string };

export default function RequestCreateForm() {
  const { nexusSDK } = useNexus();
  const [chain, setChain] = useState<SUPPORTED_CHAINS_IDS | null>(
    SUPPORTED_CHAINS.SEPOLIA
  );
  const [token, setToken] = useState<SUPPORTED_TOKENS | null>("ETH");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [payers, setPayers] = useState<Payer[]>([{ address: "", share: "" }]);
  const [creating, setCreating] = useState(false);

  const percentTotal = useMemo(
    () => payers.reduce((acc, p) => acc + (parseFloat(p.share || "0") || 0), 0),
    [payers]
  );

  const updatePayer = (index: number, key: keyof Payer, value: string) => {
    setPayers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addPayer = () =>
    setPayers((prev) => [...prev, { address: "", share: "" }]);
  const removePayer = (index: number) =>
    setPayers((prev) => prev.filter((_, i) => i !== index));

  const handleCreate = async () => {
    if (!nexusSDK || !nexusSDK.isInitialized() || !chain || !token) return;
    if (!title || !totalAmount) return;
    const participants = payers.filter((p) => p.address && p.share);
    if (participants.length === 0) return;
    setCreating(true);
    try {
      // In a full implementation, persist this to backend and route to detail page
      // For now, no chain action required to "create" a request.
      console.log("Created split request", {
        title,
        chain,
        token,
        totalAmount,
        participants,
      });
    } catch (e) {
      console.error("Create request failed", e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-transparent">
      <CardHeader>
        <CardTitle>Create Split Request</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event dinner, Hackathon fees, ..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Chain</Label>
            <ChainSelect
              selectedChain={chain ?? SUPPORTED_CHAINS.SEPOLIA}
              handleSelect={setChain}
            />
          </div>
          <div className="grid gap-2">
            <Label>Token</Label>
            <TokenSelect
              selectedChain={(chain ?? SUPPORTED_CHAINS.SEPOLIA).toString()}
              selectedToken={token ?? "ETH"}
              handleTokenSelect={setToken}
            />
          </div>
          <div className="grid gap-2">
            <Label>Total Amount</Label>
            <Input
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="100"
            />
          </div>
        </div>
        <div className="grid gap-3">
          <Label>Payers (as % of total)</Label>
          <div className="grid gap-3">
            {payers.map((p, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-7 grid gap-2">
                  <Label htmlFor={`addr-${idx}`}>Address</Label>
                  <Input
                    id={`addr-${idx}`}
                    value={p.address}
                    onChange={(e) =>
                      updatePayer(idx, "address", e.target.value)
                    }
                    placeholder="0x..."
                  />
                </div>
                <div className="col-span-3 grid gap-2">
                  <Label htmlFor={`share-${idx}`}>Percent %</Label>
                  <Input
                    id={`share-${idx}`}
                    value={p.share}
                    onChange={(e) => updatePayer(idx, "share", e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removePayer(idx)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="text-sm text-muted-foreground">
              Total: {percentTotal}%
            </div>
            <div>
              <Button type="button" onClick={addPayer}>
                Add payer
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium mb-2">How it works</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Payers can fulfill from any chain/token; Nexus will bridge as
              needed.
            </li>
            <li>
              Partial settlements are supported; balances tracked until
              completion.
            </li>
            <li>Use the detail view to settle shares and monitor progress.</li>
          </ul>
          <div className="mt-2">
            <Link href="/split-requests/preview" className="underline">
              Preview detail flow
            </Link>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          disabled={!nexusSDK?.isInitialized() || creating}
          onClick={handleCreate}
        >
          {creating ? "Creating..." : "Create Request"}
        </Button>
      </CardFooter>
    </Card>
  );
}
