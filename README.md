# Fullstack web3 project

This project is an NFT Marketplace. Users can mint randomly a "Dev" NFT by paying a minimun fee. Users can List and Unlist the NFT they own, and of course, buy nft from other sellers.

## Components:

### 1 - NFT

- Each NFT saves the first owner and send him 1% of each sell.
- Total supply 10 devs.
- There are 3 types of devs (Junior, Medior, Senior)
- Users can mint a random NFT paying a fee

### 2 - Marketplace

- Users can buy/sell NFTS
- Marketplace owner can withdraw benefits

### 3 - User interface

- WebUI written with NextJS + TS, where users can interact with the SmartContracts (using moralis sdk)

### 4 - TheGraph

- There's a subgraph listening to events. This way the project can keep track of NFT traded and published to be sold.

## Tech stack used

- Solidity
- Hardhat
- Typescript
- NextJS
- Web3UIKit
- TheGraph
- Chainlink VRF

## Links

- [Verified NFT Contract](https://sepolia.etherscan.io/address/0x8e0f233306b0b6d18e59135d6eb5394b91609463)
- [Verified Marketplace Contract](https://sepolia.etherscan.io/address/0x38E915aa7BdEBf0638aCdBCE97baCaEE56872f80)
- [Web app](https://fullstack-web3.onrender.com/)
