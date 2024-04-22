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
  11155111: {
    name: 'sepolia',
    mintPrice: ethers.utils.parseEther('0.01'),
    nftMetadataUris: [
      'ipfs://QmPpew49diwW6hLhPXiWsWLwxSRJJBp8KRp6A1eYucvLDp', // Junior
      'ipfs://bafybeieefb7gwrxc5ijq3mf6bm6odkwcdgvbjrfalssije7ow4okf4q2g4/', // Medior
      'ipfs://QmVkZEJkeZ4PxQwCmAp1NZkkBiKwNvmDVHJ3odBTmxCe2H', // Senior
    ],
    vrfCoordinatorAddress: '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625',
    vrfSubscriptionId: '11311',
    vrfGasLane: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
    vrfCallbackLimit: '500000',
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
