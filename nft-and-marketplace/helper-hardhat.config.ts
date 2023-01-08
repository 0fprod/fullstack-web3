import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

interface ContractParams {
  name: string;
  mintPrice: BigNumber;
  nftMetadataUris: string[];
  vrfCoordinatorAddress: string;
  vrfSubscriptionId: string;
  vrfGasLane: string;
  vrfCallbackLimit: string;
}

interface ConfigHelper {
  [key: number]: ContractParams;
}

export const networkConfigHelper: ConfigHelper = {
  5: {
    name: 'goerli',
    mintPrice: ethers.utils.parseEther('0.1'),
    nftMetadataUris: [
      'ipfs://QmPpew49diwW6hLhPXiWsWLwxSRJJBp8KRp6A1eYucvLDp', // Junior
      'ipfs://bafybeieefb7gwrxc5ijq3mf6bm6odkwcdgvbjrfalssije7ow4okf4q2g4/', // Medior
      'ipfs://QmVkZEJkeZ4PxQwCmAp1NZkkBiKwNvmDVHJ3odBTmxCe2H', // Senior
    ],
    vrfCoordinatorAddress: '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
    vrfSubscriptionId: '8113',
    vrfGasLane: '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
    vrfCallbackLimit: '20000',
  },
  31337: {
    name: 'hardhat',
    mintPrice: ethers.utils.parseEther('0.1'),
    nftMetadataUris: ['token-uri'],
    vrfCoordinatorAddress: '', // Overritten in deploy
    vrfSubscriptionId: '', // Overritten in deploy
    vrfGasLane: '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc',
    vrfCallbackLimit: '500000', // 500,000 gas
  },
};

export const isDevelopmentChain = (chainId: number) => {
  const developmentNetworkNames = ['hardhat', 'localhost'];
  return developmentNetworkNames.includes(networkConfigHelper[chainId].name);
};
