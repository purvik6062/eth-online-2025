import { useNexus } from "@/providers/NexusProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OnAllowanceHookData } from "@avail-project/nexus-core";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";

const AllowanceModal = ({ data }: { data: OnAllowanceHookData }) => {
  const { allowanceRefCallback } = useNexus();
  const { sources, allow, deny } = data;
  const [open, setOpen] = useState(true);

  const minChoices = useMemo(
    () => sources.map(() => "min" as const),
    [sources]
  );

  const handleAllowMin = async () => {
    await allow(minChoices as unknown as ("min" | "max" | string | bigint)[]);
    allowanceRefCallback.current = null;
    setOpen(false);
  };

  const handleDeny = () => {
    deny();
    allowanceRefCallback.current = null;
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDeny()}>
      <DialogContent className="gap-y-3 bg-background border-2 border-foreground/20">
        <DialogHeader>
          <DialogTitle className="text-foreground">Approve Allowances</DialogTitle>
          <DialogDescription className="text-foreground/70">
            The following allowances are required to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {sources.map((s, i) => (
            <div
              key={`${s.token}-${s.chain}-${i}`}
              className="rounded-lg border-2 border-foreground/20 bg-secondary/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="grid gap-1">
                  <Label className="font-semibold text-foreground">{s.token.symbol}</Label>
                  <span className="text-xs text-foreground/70">
                    Chain: {s.chain.name}
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground bg-primary/10 px-2 py-1 rounded">
                  Min: {s.allowance.minimum}
                </div>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="w-11/12 pt-4 mx-auto">
          <div className="flex w-full justify-center items-center gap-4">
            <Button
              variant="destructive"
              className="w-1/2 bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              onClick={handleDeny}
            >
              Deny
            </Button>
            <Button
              className="w-1/2 bg-primary hover:bg-primary/90 text-white cursor-pointer"
              onClick={handleAllowMin}
            >
              Allow minimum
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllowanceModal;
