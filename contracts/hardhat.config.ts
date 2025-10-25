import type { HardhatUserConfig } from "hardhat/config";
import "dotenv/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import { configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-ignition";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      production: {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    },
  },

  networks: {
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || ""],
      chainId: 11155111,
    },
    baseSepolia: {
      type: "http",
      chainType: "generic",
      url: process.env.BASE_SEPOLIA_RPC_URL || "",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || ""],
      chainId: 84532,
    },
    arbitrumSepolia: {
      type: "http",
      chainType: "generic",
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || ""],
      chainId: 421614,
    },
    optimismSepolia: {
      type: "http",
      chainType: "generic",
      url: process.env.OPTIMISM_SEPOLIA_RPC_URL || "",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || ""],
      chainId: 11155420,
    },
    polygonAmoy: {
      type: "http",
      chainType: "generic",
      url: process.env.POLYGON_AMOY_RPC_URL || "",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || ""],
      chainId: 80002,
    },
    // arbitrumOne: {
    //   type: "http",
    //   chainType: "generic",
    //   url: process.env.ARBITRUM_ONE_RPC_URL || "",
    //   accounts: [process.env.ARBITRUM_ONE_PRIVATE_KEY || ""],
    // },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY || "",
      enabled: true,
    },

  },
};

export default config;
