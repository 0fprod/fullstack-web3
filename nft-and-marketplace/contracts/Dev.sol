// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error Dev__AllTokensMinted();

contract Dev is ERC721 {
    uint8 private immutable MAX_TOKENS = 10;
    uint8 private s_tokenCounter;
    uint256 private s_mintFee;
    mapping(address => uint8) private s_tokenMintedBy;

    constructor(uint256 fee) ERC721("Developer", "DEV") {
        s_tokenCounter = 0;
        s_mintFee = fee;
    }

    function mint() public payable {
        if (s_tokenCounter >= MAX_TOKENS) {
            revert Dev__AllTokensMinted();
        }

        if (msg.value < s_mintFee) {
            revert Dev__NotEnoughETHToMint();
        }

        _safeMint(msg.sender, s_tokenCounter);

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
}
