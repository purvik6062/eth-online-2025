"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
} from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NexusProvider from "./NexusProvider";
import { NexusWidgetsProvider } from "./NexusWidgetsProvider";
import {
  NotificationProvider,
  TransactionPopupProvider,
} from "@blockscout/app-sdk";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const config = createConfig(
  getDefaultConfig({
    chains: [
      sepolia,
      baseSepolia,
      arbitrumSepolia,
      optimismSepolia,
      polygonAmoy,
    ],
    transports: {
      [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_SEPOLIA!),
      [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_BASE_SEPOLIA!),
      [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_ARBITRUM_SEPOLIA!),
      [optimismSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_OPTIMISM_SEPOLIA!),
      [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_RPC_POLYGON_AMOY!),
    },

    walletConnectProjectId: walletConnectProjectId!,

    // Required App Info
    appName: "Avail Nexus",

    // Optional App Info
    appDescription: "Avail Nexus",
    appUrl: "https://www.availproject.org/",
    appIcon:
      "https://www.availproject.org/_next/static/media/avail_logo.9c818c5a.png",
  })
);
const queryClient = new QueryClient();

const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="retro" mode="light">
          <NotificationProvider>
            <TransactionPopupProvider>
              <NexusProvider>
                <NexusWidgetsProvider>{children}</NexusWidgetsProvider>
              </NexusProvider>
            </TransactionPopupProvider>
          </NotificationProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
