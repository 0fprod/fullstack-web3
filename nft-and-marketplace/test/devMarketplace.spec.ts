import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers, network, deployments } from 'hardhat';
import { isDevelopmentChain } from '../helper-hardhat.config';
import { DevMarketplace, SimpleNft } from '../typechain-types';
import { HARDHAT_CHAINID } from '../utils/constants';

if (isDevelopmentChain(network.config.chainId ?? HARDHAT_CHAINID)) {
  describe('Devs Marketplace', () => {
    let simpleNFTUser: SignerWithAddress;
    let contractsDeployer0: SignerWithAddress;
    let devMarketplaceContract: DevMarketplace;
    let simpleNftContract: SimpleNft;
    const oneEther = ethers.utils.parseEther('1');

    before(async () => {
      const accounts = await ethers.getSigners();
      contractsDeployer0 = accounts[0];
      simpleNFTUser = accounts[1];
    });

    beforeEach(async () => {
      // Run deployments by tag
      await deployments.fixture(['simple-nft', 'marketplace']);
      // Find deployed contracts by name
      const { address: devAddress } = await deployments.get('SimpleNft');
      const { address: devMarketplaceAddress } = await deployments.get('DevMarketplace');
      // Get contract instance by name & deployment address
      simpleNftContract = await ethers.getContractAt('SimpleNft', devAddress);
      devMarketplaceContract = await ethers.getContractAt('DevMarketplace', devMarketplaceAddress);

      // devDeployer mints so tokenId 0 exists
      simpleNftContract = simpleNftContract.connect(simpleNFTUser);
      simpleNftContract.mintNft();
    });

    it('reverts if an account tries to list an NFT that doesnt own', async () => {
      await expect(
        devMarketplaceContract.listItem(simpleNftContract.address, 0, 1)
      ).to.be.revertedWithCustomError(
        devMarketplaceContract,
        'DevMarketplace__SenderIsNotOwnerOfNFT'
      );
    });

    it('reverts if the marketplace is not approved to sell the NFT', async () => {
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      await expect(
        devMarketplaceContract.listItem(simpleNftContract.address, 0, 1)
      ).to.be.revertedWithCustomError(
        devMarketplaceContract,
        'DevMarketplace__MarketplaceIsNotApproved'
      );
    });

    it('reverts if an account tries to list with price <= 0', async () => {
      await simpleNftContract.approve(devMarketplaceContract.address, 0);
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      await expect(
        devMarketplaceContract.listItem(simpleNftContract.address, 0, 0)
      ).to.be.revertedWithCustomError(
        devMarketplaceContract,
        'DevMarketplace__PriceMustBeGreaterThanZero'
      );
    });

    it('reverts if an account tries to list an NFT that its already listed', async () => {
      // marketplace has approval over token 0
      await simpleNftContract.approve(devMarketplaceContract.address, 0);
      // connect simpleNFT user (owner of token 0)
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      // owner of token 0 lists token 0
      devMarketplaceContract.listItem(simpleNftContract.address, 0, 1);
      // tries to list again
      await expect(
        devMarketplaceContract.listItem(simpleNftContract.address, 0, 1)
      ).to.be.revertedWithCustomError(
        devMarketplaceContract,
        'DevMarketplace__TokenIdAlreadyListed'
      );
    });

    it('emits an event when an NFT is listed', async () => {
      // marketplace has approval over token 0
      await simpleNftContract.approve(devMarketplaceContract.address, 0);
      // connect simpleNFT user (owner of token 0)
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      // owner of token 0 lists token 0
      await expect(devMarketplaceContract.listItem(simpleNftContract.address, 0, 1)).to.emit(
        devMarketplaceContract,
        'NFTListed'
      );
    });

    it('reverts if an account buys an NFT that is not listed', async () => {
      await expect(
        devMarketplaceContract.buyItem(simpleNftContract.address, 0, { value: oneEther })
      ).to.be.revertedWithCustomError(devMarketplaceContract, 'DevMarketplace__TokenIdNotListed');
    });

    it('reverts if an account buys an NFT with a lower price than listed', async () => {
      // marketplace has approval over token 0
      await simpleNftContract.approve(devMarketplaceContract.address, 0);
      // connect simpleNFT user (owner of token 0)
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      // owner of token 0 lists token 0
      devMarketplaceContract.listItem(simpleNftContract.address, 0, oneEther);

      await expect(
        devMarketplaceContract.buyItem(simpleNftContract.address, 0, { value: oneEther.sub(1) })
      ).to.be.revertedWithCustomError(devMarketplaceContract, 'DevMarketplace__NotEnoughETH');
    });

    it('buys an NFT', async () => {
      // marketplace has approval over token 0
      await simpleNftContract.approve(devMarketplaceContract.address, 0);
      // connect simpleNFT user (owner of token 0)
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      // owner of token 0 lists token 0
      devMarketplaceContract.listItem(simpleNftContract.address, 0, oneEther);
      devMarketplaceContract = devMarketplaceContract.connect(contractsDeployer0);
      await devMarketplaceContract.buyItem(simpleNftContract.address, 0, { value: oneEther });

      const newOwner = await simpleNftContract.ownerOf('0');
      expect(newOwner).to.be.eq(contractsDeployer0.address);
    });

    it('removes an NFT', async () => {
      // marketplace has approval over token 0
      await simpleNftContract.approve(devMarketplaceContract.address, 0);
      // connect simpleNFT user (owner of token 0)
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      // owner of token 0 lists token 0
      devMarketplaceContract.listItem(simpleNftContract.address, 0, oneEther);

      await expect(devMarketplaceContract.unlistItem(simpleNftContract.address, 0)).to.emit(
        devMarketplaceContract,
        'NFTUnlisted'
      );
    });

    it('reverts if not the owner tries to unlist', async () => {
      // marketplace has approval over token 0
      await simpleNftContract.approve(devMarketplaceContract.address, 0);
      // connect simpleNFT user (owner of token 0)
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      // owner of token 0 lists token 0
      devMarketplaceContract.listItem(simpleNftContract.address, 0, oneEther);
      // Connect another user
      devMarketplaceContract = devMarketplaceContract.connect(contractsDeployer0);

      await expect(
        devMarketplaceContract.unlistItem(simpleNftContract.address, 0)
      ).to.to.be.revertedWithCustomError(
        devMarketplaceContract,
        'DevMarketplace__SenderIsNotOwnerOfNFT'
      );
    });

    it('reverts if tries to unlist a unlisted item', async () => {
      // marketplace has approval over token 0
      await simpleNftContract.approve(devMarketplaceContract.address, 0);
      // connect simpleNFT user (owner of token 0)
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      // owner of token 0 lists token 0
      devMarketplaceContract.listItem(simpleNftContract.address, 0, oneEther);
      await devMarketplaceContract.unlistItem(simpleNftContract.address, 0);

      await expect(
        devMarketplaceContract.unlistItem(simpleNftContract.address, 0)
      ).to.to.be.revertedWithCustomError(
        devMarketplaceContract,
        'DevMarketplace__TokenIdNotListed'
      );
    });

    it.skip('updates an NFT listing price');

    it('allow users to withdraw revenue from their sells', async () => {
      // marketplace has approval over token 0
      await simpleNftContract.approve(devMarketplaceContract.address, 0);
      // connect simpleNFT user (owner of token 0)
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      // owner of token 0 lists token 0
      devMarketplaceContract.listItem(simpleNftContract.address, 0, oneEther);
      // Connect another user
      const listingBalance = await simpleNFTUser.provider?.getBalance(simpleNFTUser.address);
      devMarketplaceContract = devMarketplaceContract.connect(contractsDeployer0);
      // the other user buys token 0
      await devMarketplaceContract.buyItem(simpleNftContract.address, 0, { value: oneEther });
      // connect seller
      devMarketplaceContract = devMarketplaceContract.connect(simpleNFTUser);
      await devMarketplaceContract.withdraw();
      const balance = await simpleNFTUser.provider?.getBalance(simpleNFTUser.address);
      expect(listingBalance).to.be.lessThan(balance);
    });
  });
}
