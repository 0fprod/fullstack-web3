import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import {
  isDevelopmentChain,
  networkConfigHelper,
} from "../helper-hardhat.config";
import { Dev } from "../typechain-types";
import { HARDHAT_CHAINID } from "../utils/constants";

if (isDevelopmentChain(network.config.chainId ?? HARDHAT_CHAINID)) {
  describe("Devs NFTs", () => {
    let devNftContract: Dev;
    let accounts: Array<SignerWithAddress>;

    before(async () => {
      accounts = await getBlockchainsActiveAccounts();
    });

    beforeEach(async () => {
      // Run deployments by tag
      await deployments.fixture("nft");
      // Find deployed contracts by name
      const devNftDeployment = await deployments.get("Dev");
      // Get contract instance by name & deployment address
      devNftContract = await ethers.getContractAt(
        "Dev",
        devNftDeployment.address
      );
    });

    it("sets a price for minting", async () => {
      const definedMintPrice = networkConfigHelper[HARDHAT_CHAINID].mintPrice;
      const mintFee = await devNftContract.getMintFee();

      expect(mintFee.toString()).to.eq(definedMintPrice.toString());
    });

    it("are limited only to 10", async () => {
      const getMaxSuppply = await devNftContract.getMaxSuppply();
      expect(getMaxSuppply.toString()).to.eq("10");
    });

    it("allow users to mint", async () => {
      await expect(devNftContract.mint()).to.emit(devNftContract, "Transfer");
      const numberOfMintedTokens = await devNftContract.getTokenCounter();
      expect(numberOfMintedTokens.toString()).to.eq("1");
    });

    it("reverts the tx when all the tokens are minted", async () => {
      // mint 10 times
      const mintingPromises = Array.from({ length: 10 }).map((_) =>
        devNftContract.mint()
      );

      await Promise.all(mintingPromises);

      await expect(devNftContract.mint()).to.revertedWithCustomError(
        devNftContract,
        "Dev__AllTokensMinted"
      );
    });
  });

  const getBlockchainsActiveAccounts = async (): Promise<
    Array<SignerWithAddress>
  > => {
    return await ethers.getSigners();
  };
}
