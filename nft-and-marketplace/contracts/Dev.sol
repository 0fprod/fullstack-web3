// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "hardhat/console.sol";

error Dev__AllTokensMinted();
error Dev__NotEnoughETHToMint();

contract Dev is ERC721URIStorage, VRFConsumerBaseV2 {
    enum DevType {
        Junior,
        Medior,
        Senior
    }
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    uint8 private immutable MAX_TOKENS = 10;
    uint8 private s_tokenCounter;
    uint64 private immutable i_subscriptionId;
    uint256 private s_mintFee;
    mapping(address => uint8) private s_tokenMintedBy;
    mapping(uint256 => address) private s_requestIdToCallerAddres;
    string[] private s_tokenURIs;

    event NftRequested(uint256 indexed requestId);
    event NftMinted(DevType dev);

    constructor(
        uint256 fee,
        string[1] memory tokenUris,
        address vrfCoordinatorV2,
        uint64 subscriptionId
    ) ERC721("Developer", "DEV") VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        s_tokenCounter = 0;
        s_mintFee = fee;
        s_tokenURIs = tokenUris;
        i_subscriptionId = subscriptionId;
    }

    function mint() public payable {
        if (s_tokenCounter >= MAX_TOKENS) {
            revert Dev__AllTokensMinted();
        }

        if (msg.value < s_mintFee) {
            revert Dev__NotEnoughETHToMint();
        }

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc, // i_gasLane,
            i_subscriptionId, // i_subscriptionId,
            1, // REQUEST_CONFIRMATIONS,
            2000000, // i_callbackGasLimit,
            1 //NUMBER_OF_RANDOM_WORDS
        );
        s_requestIdToCallerAddres[requestId] = msg.sender;

        emit NftRequested(requestId);
    }

    // This is the callback called by VRF when the request is completed
    // with the id and the random number received based on wordSize
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address tokenMinterAddress = s_requestIdToCallerAddres[requestId];
        s_tokenMintedBy[tokenMinterAddress] = s_tokenCounter;
        s_tokenCounter++;
        uint256 randomBetween0and3 = randomWords[0] % s_tokenURIs.length;
        DevType dev = DevType(randomBetween0and3);
        _safeMint(tokenMinterAddress, s_tokenCounter);
        _setTokenURI(s_tokenCounter, s_tokenURIs[randomBetween0and3]);

        emit NftMinted(dev);
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

    function getNumberOfDevTypes() public view returns (uint256) {
        return s_tokenURIs.length;
    }
}
