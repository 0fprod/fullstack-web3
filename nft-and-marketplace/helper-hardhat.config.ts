import { BigNumber } from "ethers";
import { ethers } from "hardhat";

interface ContractParams {
  name: string;
  mintPrice: BigNumber;
  nftMetadataUris: string[];
  vrfCoordinatorAddress: string;
  vrfSubscriptionId: string;
}

interface ConfigHelper {
  [key: number]: ContractParams;
}

export const networkConfigHelper: ConfigHelper = {
  5: {
    name: "goerli",
    mintPrice: ethers.utils.parseEther("0.1"),
    nftMetadataUris: [],
    vrfCoordinatorAddress: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    vrfSubscriptionId: "0",
  },
  31337: {
    name: "hardhat",
    mintPrice: ethers.utils.parseEther("0.1"),
    nftMetadataUris: ["token-uri"],
    vrfCoordinatorAddress: "", // Overritten in deploy
    vrfSubscriptionId: "", // Overritten in deploy
  },
};

export const isDevelopmentChain = (chainId: number) => {
  const developmentNetworkNames = ["hardhat", "localhost"];
  return developmentNetworkNames.includes(networkConfigHelper[chainId].name);
};
