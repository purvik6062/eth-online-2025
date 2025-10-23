import {
  type SUPPORTED_CHAINS_IDS,
  TESTNET_CHAINS,
  MAINNET_CHAINS,
  CHAIN_METADATA,
} from "@avail-project/nexus-core";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import Image from "next/image";

const ChainSelect = ({
  selectedChain,
  handleSelect,
  chainLabel = "Destination Chain",
  isTestnet = false,
  disabled = false,
}: {
  selectedChain: SUPPORTED_CHAINS_IDS;
  handleSelect?: (chainId: SUPPORTED_CHAINS_IDS) => void;
  chainLabel?: string;
  isTestnet?: boolean;
  disabled?: boolean;
}) => {
  const chains = isTestnet ? TESTNET_CHAINS : MAINNET_CHAINS;
  const chainData = CHAIN_METADATA;
  return (
    <Select
      value={selectedChain?.toString() ?? ""}
      onValueChange={(value) => {
        if (!disabled) {
          handleSelect(parseInt(value) as SUPPORTED_CHAINS_IDS);
        }
      }}
    >
      <div className="flex flex-col items-start gap-y-1">
        {chainLabel && (
          <Label className="text-black text-sm font-semibold">
            {chainLabel}
          </Label>
        )}
        <SelectTrigger
          disabled={disabled}
          className={disabled ? "bg-gray-50 text-gray-800" : ""}
        >
          <SelectValue>
            {!!selectedChain && (
              <div className="flex items-center gap-x-2">
                <Image
                  src={CHAIN_METADATA[selectedChain]?.logo}
                  alt={CHAIN_METADATA[selectedChain]?.name ?? ""}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className={`test-sm ${disabled ? "text-gray-800" : ""}`}>
                  {CHAIN_METADATA[selectedChain]?.name}
                </p>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
      </div>

      <SelectContent>
        <SelectGroup>
          {chains.map((chainId) => {
            return (
              <SelectItem key={chainId} value={chainId.toString()}>
                <div className="flex items-center gap-x-2 my-1">
                  <Image
                    src={CHAIN_METADATA[chainId]?.logo}
                    alt={chainData[chainId]?.name ?? ""}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <p className="test-sm text-gray-800">
                    {chainData[chainId]?.name}
                  </p>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ChainSelect;
