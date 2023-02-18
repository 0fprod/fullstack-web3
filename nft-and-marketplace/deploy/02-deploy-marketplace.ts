import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { isDevelopmentChain } from '../helper-hardhat.config';
import { HARDHAT_CHAINID } from '../utils/constants';
import { verify } from '../utils/verify';

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const chainId = network.config.chainId || HARDHAT_CHAINID;
  const waitConfirmations = isDevelopmentChain(chainId) ? 1 : 5;

  log('#########################');
  log(`# Deploying NFTMarketplace Contract to: ${chainId} ...`);
  const marketplaceContract = await deploy('DevMarketplace', {
    from: deployer,
    args: [],
    waitConfirmations,
  });
  log('# Devs contract deployed at address:', marketplaceContract.address);
  log('#########################');

  if (!isDevelopmentChain(chainId)) {
    await verify(marketplaceContract.address, []);
  }
};

export default deploy;
deploy.tags = ['all', 'marketplace'];
