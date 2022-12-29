// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error Dev__AllTokensMinted();

contract Dev is ERC721 {
    uint256 private s_mintFee;

    constructor(uint256 fee) ERC721("Developer", "Dev") {
        s_mintFee = fee;
    }
    function getMintFee() public view returns (uint256) {
        return s_mintFee;
    }
}
