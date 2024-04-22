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
  let {
    mintPrice,
    nftMetadataUris,
    vrfCoordinatorAddress,
    vrfSubscriptionId,
    vrfGasLane,
    vrfCallbackLimit,
  } = networkConfigHelper[chainId];

  if (isDevelopmentChain(chainId)) {
    let { address, subscriptionId } = await deployVRFCoordinatorMock(hre);
    vrfCoordinatorAddress = address;
    vrfSubscriptionId = subscriptionId;
  }

  log('#########################');
  log(`# Deploying NFT Contract to: ${chainId} ...`);
  const nftContract = await deploy('Dev', {
    from: deployer,
    args: [
      mintPrice,
      nftMetadataUris,
      vrfCoordinatorAddress,
      vrfSubscriptionId,
      vrfCallbackLimit,
      vrfGasLane,
    ],
    waitConfirmations,
  });
  log('# Devs contract deployed at address:', nftContract.address);
  log('#########################');

  if (isDevelopmentChain(chainId)) {
    // For live deployment this should be done by hand throught https://vrf.chain.link/
    log('#########################');
    log('# Adding consumer to VRFMock...');
    const vrfCoordinatorV2Mock = await ethers.getContractAt(
      'VRFCoordinatorV2Mock',
      vrfCoordinatorAddress
    );
    await vrfCoordinatorV2Mock.addConsumer(vrfSubscriptionId, nftContract.address);
    log('# Done.');
    log('#########################');
  }

  if (!isDevelopmentChain(chainId)) {
    await verify(nftContract.address, [
      mintPrice,
      nftMetadataUris,
      vrfCoordinatorAddress,
      vrfSubscriptionId,
      vrfCallbackLimit,
      vrfGasLane,
    ]);
  }
};

const deployVRFCoordinatorMock = async (
  hre: HardhatRuntimeEnvironment
): Promise<{ address: string; subscriptionId: string }> => {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const baseFee = ethers.utils.parseEther('0.25'); // 0.25Link is premium https://docs.chain.link/vrf/v2/subscription/supported-networks#sepolia-testnet
  const gasPriceLink = 1e9; // based on the gas price of the chain. Its like LINKs per GAS unit

  log('#########################');
  log(`# Deploying VRFCoordinatorMock Contract...`);
  const { address } = await deploy('VRFCoordinatorV2Mock', {
    from: deployer,
    args: [baseFee, gasPriceLink],
    waitConfirmations: 1,
  });
  log('# Mock deployed to: ', address);
  log('# Creating VRF subscription...');
  const contractInstance = await ethers.getContractAt('VRFCoordinatorV2Mock', address);
  const txResponse = await contractInstance.createSubscription();
  const txReceipt = await txResponse.wait(1);
  const subscriptionId = txReceipt.events![0].args!.subId; // @chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol#179
  log('# Funding VRF subscription...');
  await contractInstance.fundSubscription(subscriptionId, ethers.utils.parseEther('300'));
  log('# Mock deployment & funding completed.');
  log('#########################');

  return { address, subscriptionId };
};

export default deploy;
deploy.tags = ['all', 'nft'];
