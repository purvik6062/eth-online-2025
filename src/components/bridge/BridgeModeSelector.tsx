"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type BridgeMode = "bridge" | "swap";

interface BridgeModeSelectorProps {
  mode: BridgeMode;
  onModeChange: (mode: BridgeMode) => void;
}

export function BridgeModeSelector({
  mode,
  onModeChange,
}: BridgeModeSelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-2">
          <Button
            variant={mode === "bridge" ? "default" : "outline"}
            onClick={() => onModeChange("bridge")}
            className="flex-1"
          >
            🌉 Bridge
          </Button>
          <Button
            variant={mode === "swap" ? "default" : "outline"}
            onClick={() => onModeChange("swap")}
            className="flex-1"
          >
            🔄 Swap
          </Button>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          {mode === "bridge" ? (
            <p>Bridge tokens from one chain to another</p>
          ) : (
            <p>Swap tokens within your unified balance or across chains</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
