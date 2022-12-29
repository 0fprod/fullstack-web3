import { BigNumber } from "ethers";
import { ethers } from "hardhat";

interface ContractParams {
  name: string;
  mintPrice: BigNumber;
  nftMetadataUris: string[];
}

interface ConfigHelper {
  [key: number]: ContractParams;
}

export const networkConfigHelper: ConfigHelper = {
  5: {
    name: "goerli",
    mintPrice: ethers.utils.parseEther("0.1"),
    nftMetadataUris: [],
  },
  31337: {
    name: "hardhat",
    mintPrice: ethers.utils.parseEther("0.1"),
    nftMetadataUris: ["token-uri"],
  },
};

export const isDevelopmentChain = (chainId: number) => {
  const developmentNetworkNames = ["hardhat", "localhost"];
  return developmentNetworkNames.includes(networkConfigHelper[chainId].name);
};
