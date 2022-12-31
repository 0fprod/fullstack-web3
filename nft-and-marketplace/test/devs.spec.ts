import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { deployments, ethers, network } from 'hardhat';
import { isDevelopmentChain, networkConfigHelper } from '../helper-hardhat.config';
import { Dev, VRFCoordinatorV2Mock } from '../typechain-types';
import { HARDHAT_CHAINID } from '../utils/constants';

if (isDevelopmentChain(network.config.chainId ?? HARDHAT_CHAINID)) {
  describe('Devs NFTs', () => {
    let devNftContract: Dev;
    let vrfCoordinatorV2Contract: VRFCoordinatorV2Mock;
    let accounts: Array<SignerWithAddress>;
    const oneEther = ethers.utils.parseEther('1');

    before(async () => {
      accounts = await ethers.getSigners();
    });

    beforeEach(async () => {
      // Run deployments by tag
      await deployments.fixture('nft');
      // Find deployed contracts by name
      const { address: devNftAddress } = await deployments.get('Dev');
      const { address: vrfCoordinatorMockAddress } = await deployments.get('VRFCoordinatorV2Mock');
      // Get contract instance by name & deployment address
      devNftContract = await ethers.getContractAt('Dev', devNftAddress);
      vrfCoordinatorV2Contract = await ethers.getContractAt(
        'VRFCoordinatorV2Mock',
        vrfCoordinatorMockAddress
      );
    });

    it('initializes with correct name, symbol and token uris', async () => {
      expect(await devNftContract.name()).to.eq('Developer');
      expect(await devNftContract.symbol()).to.eq('DEV');
      expect(await devNftContract.getTokenUri(0)).to.eq('token-uri');
    });

    it('sets a price for minting', async () => {
      const definedMintPrice = networkConfigHelper[HARDHAT_CHAINID].mintPrice;
      const mintFee = await devNftContract.getMintFee();

      expect(mintFee.toString()).to.eq(definedMintPrice.toString());
    });

    it('are limited only to 10', async () => {
      const getMaxSuppply = await devNftContract.getMaxSuppply();
      expect(getMaxSuppply.toString()).to.eq('10');
    });

    it('allow users to mint', async () => {
      await new Promise<void>(async (resolve, reject) => {
        devNftContract.once('NftMinted', async (devType: number) => {
          try {
            const numberOfMintedTokens = await devNftContract.getTokenCounter();
            const numebrOfDevTypes = await devNftContract.getNumberOfDevTypes();

            expect(numberOfMintedTokens.toString()).to.eq('1');
            expect(devType).to.be.lte(numebrOfDevTypes);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        // This fires requestRandomWords and returns the requestId
        // We must emit the requestId and pass it to fullfillRandomWords
        await mintAndFullfillRandomWords(devNftContract);
      });
    });

    it('contract balance increases after minting', async () => {
      const contractStartingBalance = await devNftContract.provider.getBalance(
        devNftContract.address
      );
      await mintAndFullfillRandomWords(devNftContract);
      const contractEndingBalance = await devNftContract.provider.getBalance(
        devNftContract.address
      );

      expect(contractStartingBalance.toString()).to.eq('0');
      expect(contractEndingBalance.toString()).to.eq(oneEther.toString());
    });

    it('reverts the tx when all the tokens are minted', async () => {
      // mint 10 times
      const mintingPromises = Array.from({ length: 10 }).map((_) =>
        mintAndFullfillRandomWords(devNftContract)
      );
      await Promise.all(mintingPromises);

      await expect(devNftContract.requestNft({ value: oneEther })).to.revertedWithCustomError(
        devNftContract,
        'Dev__AllTokensMinted'
      );
    });

    it('reverts the tx when the minting fee is lower than MIN_FEE', async () => {
      const invalidFee = ethers.utils.parseEther('0.0001');
      await expect(devNftContract.requestNft({ value: invalidFee })).to.revertedWithCustomError(
        devNftContract,
        'Dev__NotEnoughETHToMint'
      );
    });

    it('stores the minter address of the tokenId', async () => {
      await mintAndFullfillRandomWords(devNftContract);
      // connect and mint with another account
      devNftContract = devNftContract.connect(accounts[1]);
      await mintAndFullfillRandomWords(devNftContract);

      const firstTokenMinter = await devNftContract.getTokenMinterById(0);
      const secondTokenMinter = await devNftContract.getTokenMinterById(1);
      const totalMinted = await devNftContract.getTokenCounter();

      expect(firstTokenMinter.toString()).to.eq(accounts[0].address);
      expect(secondTokenMinter.toString()).to.eq(accounts[1].address);
      expect(totalMinted.toString()).to.eq('2');
    });

    it('each NFT trade rewards the minter', async () => {
      // address 4 mints the tokenId 0
      devNftContract = devNftContract.connect(accounts[4]);
      await mintAndFullfillRandomWords(devNftContract);
      // tansfer nft from acc4 to acc3
      await devNftContract.transferFrom(accounts[4].address, accounts[3].address, 0);
      // tansfer nft from acc3 to acc2
      devNftContract = devNftContract.connect(accounts[3]);
      const acc4BalanceBeforeTransfer = await accounts[4].getBalance();
      await devNftContract.transferFrom(accounts[3].address, accounts[2].address, 0);
      const acc4BalanceAfterTransfer = await accounts[4].getBalance();
      // calculate results
      const newOwner = await devNftContract.ownerOf(0);
      const rewardForAcc4 = acc4BalanceAfterTransfer.sub(acc4BalanceBeforeTransfer).toString();
      // assert
      expect(newOwner).to.eq(accounts[2].address);
      expect(rewardForAcc4).to.eq(ethers.utils.parseEther('0.0025').toString());
    });

    async function mintAndFullfillRandomWords(devNftContract: Dev) {
      const reqTx = await devNftContract.requestNft({ value: oneEther });
      const reqTxReceipt = await reqTx.wait(1);
      const requestId = reqTxReceipt.events![1].args![0];
      await vrfCoordinatorV2Contract.fulfillRandomWords(requestId, devNftContract.address);
    }
  });
}
