import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  isDevelopmentChain,
  networkConfigHelper,
} from "../helper-hardhat.config";
import { HARDHAT_CHAINID } from "../utils/constants";
import { verify } from "../utils/verify";

const deploy = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId || HARDHAT_CHAINID;
  const { mintPrice, nftMetadataUris } = networkConfigHelper[HARDHAT_CHAINID];

  log("#########################");
  log(`# Deploying NFT Contract to: ${chainId} ...`);
  const nftContract = await deploy("Dev", {
    from: deployer,
    args: [mintPrice, nftMetadataUris],
    waitConfirmations: 1,
  });
  log("# Devs contract deployed at address:", nftContract.address);
  log("#########################");

  if (!isDevelopmentChain(chainId)) {
    await verify("", []);
  }
};

export default deploy;
deploy.tags = ["all", "nft"];
