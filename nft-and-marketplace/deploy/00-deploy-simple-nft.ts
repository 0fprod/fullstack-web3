import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { isDevelopmentChain } from '../helper-hardhat.config';
import { HARDHAT_CHAINID } from '../utils/constants';

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const chainId = network.config.chainId || HARDHAT_CHAINID;
  const waitConfirmations = isDevelopmentChain(chainId) ? 1 : 5;

  log('#########################');
  log(`# Deploying NFTMarketplace Contract to: ${chainId} ...`);
  const nftContract = await deploy('SimpleNft', {
    from: deployer,
    args: [],
    waitConfirmations,
  });
  log('# SimpleNFT contract deployed at address:', nftContract.address);
  log('#########################');
};

export default deploy;
deploy.tags = ['simple-nft'];
