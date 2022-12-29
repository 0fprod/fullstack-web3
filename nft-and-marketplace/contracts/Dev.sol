// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

error Dev__AllTokensMinted();
error Dev__NotEnoughETHToMint();

contract Dev is ERC721URIStorage {
    uint8 private immutable MAX_TOKENS = 10;
    uint8 private s_tokenCounter;
    uint256 private s_mintFee;
    mapping(address => uint8) private s_tokenMintedBy;
    string[1] private s_tokenURIs;

    constructor(
        uint256 fee,
        string[1] memory tokenUris
    ) ERC721("Developer", "DEV") {
        s_tokenCounter = 0;
        s_mintFee = fee;
        s_tokenURIs = tokenUris;
    }

    function mint() public payable {
        if (s_tokenCounter >= MAX_TOKENS) {
            revert Dev__AllTokensMinted();
        }

        if (msg.value < s_mintFee) {
            revert Dev__NotEnoughETHToMint();
        }

        _safeMint(msg.sender, s_tokenCounter);
        _setTokenURI(s_tokenCounter, s_tokenURIs[0]);

        s_tokenMintedBy[msg.sender] = s_tokenCounter;
        s_tokenCounter++;
    }

    function getTokenCounter() public view returns (uint8) {
        return s_tokenCounter;
    }

    function getTokenByMinterAddress(
        address minterAddress
    ) public view returns (uint8) {
        return s_tokenMintedBy[minterAddress];
    }

    function getMintFee() public view returns (uint256) {
        return s_mintFee;
    }

    function getMaxSuppply() public pure returns (uint8) {
        return MAX_TOKENS;
    }

    function getTokenUri(uint8 index) public view returns (string memory) {
        return s_tokenURIs[index];
    }
}
