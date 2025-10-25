import { ConnectKitButton } from "connectkit";
import { useNexus, type EthereumProvider } from "@avail-project/nexus-widgets";
import { useEffect } from "react";
import { useAccount } from "wagmi";

const ConnectWallet = () => {
  const { setProvider, provider, isSdkInitialized, deinitializeSdk } =
    useNexus();
  const { status, connector } = useAccount();

  const setupProvider = async () => {
    try {
      const ethProvider = await connector?.getProvider();
      if (!ethProvider) return;
      setProvider(ethProvider as EthereumProvider);
    } catch (error) {
      console.error("Failed to setup provider:", error);
    }
  };

  useEffect(() => {
    if (!provider && status === "connected") {
      setupProvider();
    }
    if (isSdkInitialized && provider && status === "disconnected") {
      console.log("deinit");
      deinitializeSdk();
    }
  }, [status, provider, isSdkInitialized]);

  return <ConnectKitButton />;
};

export default ConnectWallet;
