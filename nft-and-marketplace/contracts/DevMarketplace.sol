// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

error DevMarketplace__SenderIsNotOwnerOfNFT();
error DevMarketplace__PriceMustBeGreaterThanZero();
error DevMarketplace__MarketplaceIsNotApproved();
error DevMarketplace__TokenIdAlreadyListed();
error DevMarketplace__TokenIdNotListed();
error DevMarketplace__NotEnoughETH();

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract DevMarketplace is ReentrancyGuard {
    struct ListedNft {
        address seller;
        uint256 price;
    }

    mapping(address => mapping(uint256 => ListedNft)) listed;
    mapping(address => uint256) sellersBenefits;

    event NFTListed(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price,
        address seller
    );

    event NFTUnlisted(
        address nftContractAddress,
        uint256 tokenId,
        address owner
    );

    event NFTBought(
        address buyerAddress,
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
    );

    constructor() {}

    modifier isOwner(address nftContractAddress, uint256 tokenId) {
        IERC721 nft = IERC721(nftContractAddress);
        address owner = nft.ownerOf(tokenId);

        if (owner != msg.sender) {
            revert DevMarketplace__SenderIsNotOwnerOfNFT();
        }
        _;
    }

    modifier hasApproval(address nftContractAddress, uint256 tokenId) {
        IERC721 nft = IERC721(nftContractAddress);
        address approver = nft.getApproved(0);

        if (approver != address(this)) {
            revert DevMarketplace__MarketplaceIsNotApproved();
        }
        _;
    }

    function listItem(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        isOwner(nftContractAddress, tokenId)
        hasApproval(nftContractAddress, tokenId)
    {
        if (price <= 0) {
            revert DevMarketplace__PriceMustBeGreaterThanZero();
        }

        if (listed[nftContractAddress][tokenId].price > 0) {
            revert DevMarketplace__TokenIdAlreadyListed();
        }

        listed[nftContractAddress][tokenId].seller = msg.sender;
        listed[nftContractAddress][tokenId].price = price;
        emit NFTListed(nftContractAddress, tokenId, price, msg.sender);
    }

    function buyItem(
        address nftContractAddress,
        uint256 tokenId
    ) external payable nonReentrant {
        if (listed[nftContractAddress][tokenId].price == 0) {
            revert DevMarketplace__TokenIdNotListed();
        }

        if (listed[nftContractAddress][tokenId].price > msg.value) {
            revert DevMarketplace__NotEnoughETH();
        }

        IERC721 nft = IERC721(nftContractAddress);
        address seller = listed[nftContractAddress][tokenId].seller;
        sellersBenefits[seller] += msg.value;
        delete listed[nftContractAddress][tokenId];
        nft.transferFrom(seller, msg.sender, tokenId);
        emit NFTBought(msg.sender, nftContractAddress, tokenId, msg.value);
    }

    function unlistItem(
        address nftContractAddress,
        uint256 tokenId
    ) external isOwner(nftContractAddress, tokenId) {
        if (listed[nftContractAddress][tokenId].price <= 0) {
            revert DevMarketplace__TokenIdNotListed();
        }
        delete listed[nftContractAddress][tokenId];

        emit NFTUnlisted(nftContractAddress, tokenId, msg.sender);
    }

    function updatePrice(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
    ) external isOwner(nftContractAddress, tokenId) {
        if (price <= 0) {
            revert DevMarketplace__PriceMustBeGreaterThanZero();
        }

        if (listed[nftContractAddress][tokenId].price > 0) {
            listed[nftContractAddress][tokenId].price = price;
            emit NFTListed(nftContractAddress, tokenId, price, msg.sender);
        }
    }

    function withdraw() external payable {
        uint256 amount = sellersBenefits[msg.sender];
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send ether");
        delete sellersBenefits[msg.sender];
    }

    function getListedNft(
        address nftAddress,
        uint256 tokenId
    ) external view returns (ListedNft memory) {
        return listed[nftAddress][tokenId];
    }

    function getBenefits(address seller) external view returns (uint256) {
        return sellersBenefits[seller];
    }
}
