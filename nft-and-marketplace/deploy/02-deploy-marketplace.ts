import { ethers, network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { isDevelopmentChain, networkConfigHelper } from '../helper-hardhat.config';
import { HARDHAT_CHAINID } from '../utils/constants';
import { verify } from '../utils/verify';

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const chainId = network.config.chainId || HARDHAT_CHAINID;
  const waitConfirmations = isDevelopmentChain(chainId) ? 1 : 5;
  // let {
  //   mintPrice,
  //   nftMetadataUris,
  //   vrfCoordinatorAddress,
  //   vrfSubscriptionId,
  //   vrfGasLane,
  //   vrfCallbackLimit,
  // } = networkConfigHelper[chainId];

  log('#########################');
  log(`# Deploying NFTMarketplace Contract to: ${chainId} ...`);
  const nftContract = await deploy('DevMarketplace', {
    from: deployer,
    args: [],
    waitConfirmations,
  });
  log('# Devs contract deployed at address:', nftContract.address);
  log('#########################');

  if (!isDevelopmentChain(chainId)) {
    await verify(nftContract.address, []);
  }
};

export default deploy;
deploy.tags = ['all', 'marketplace'];
