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
      <DialogContent className="gap-y-3">
        <DialogHeader>
          <DialogTitle>Approve Allowances</DialogTitle>
          <DialogDescription>
            The following allowances are required to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {sources.map((s, i) => (
            <div
              key={`${s.token}-${s.chain}-${i}`}
              className="rounded-md border p-3"
            >
              <div className="flex items-center justify-between">
                <div className="grid gap-1">
                  <Label className="font-semibold">{s.token.symbol}</Label>
                  <span className="text-xs text-muted-foreground">
                    Chain: {s.chain.name}
                  </span>
                </div>
                <div className="text-sm">Min: {s.allowance.minimum}</div>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="w-11/12 pt-4 mx-auto">
          <div className="flex w-full justify-center items-center gap-4">
            <Button
              variant="destructive"
              className="w-1/2"
              onClick={handleDeny}
            >
              Deny
            </Button>
            <Button className="w-1/2" onClick={handleAllowMin}>
              Allow minimum
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllowanceModal;
