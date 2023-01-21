// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

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
    uint8 private constant NUMBER_OF_RANDOM_WORDS = 1;
    uint8 private constant REQUEST_CONFIRMATIONS = 3;
    uint8 private s_tokenCounter;
    uint32 private immutable i_callbackGasLimit;
    uint64 private immutable i_subscriptionId;
    uint256 private s_mintFee;
    bytes32 private immutable i_gasLane;
    mapping(uint256 => address) private s_tokenIdMinter;
    mapping(uint256 => address) private s_requestIdToCallerAddres;
    string[] private s_tokenURIs;

    event NftRequested(uint256 indexed requestId);
    event NftMinted(DevType dev);

    constructor(
        uint256 fee,
        string[] memory tokenUris,
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        bytes32 gasLane
    ) ERC721("Developer", "DEV") VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        s_tokenCounter = 0;
        s_mintFee = fee;
        s_tokenURIs = tokenUris;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_gasLane = gasLane;
    }

    function transferFrom(
        address from,
        address to,
        uint tokenId
    ) public override {
        require(from != address(0x0), "invalid from address");
        require(to != address(0x0), "invalid to address");
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "msgSender is not the owner of the token"
        );

        address minter = s_tokenIdMinter[uint8(tokenId)];
        rewardMinter(minter);

        _transfer(from, to, tokenId);
    }

    function rewardMinter(address minter) internal {
        address payable receiver = payable(minter);
        (bool sent, ) = receiver.call{value: 0.0025 ether}("");
        require(sent, "Failed to send Ether");
    }

    function requestNft() public payable {
        if (s_tokenCounter >= MAX_TOKENS) {
            revert Dev__AllTokensMinted();
        }

        if (msg.value < s_mintFee) {
            revert Dev__NotEnoughETHToMint();
        }

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUMBER_OF_RANDOM_WORDS
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
        s_tokenIdMinter[s_tokenCounter] = tokenMinterAddress;
        uint256 randomBetween0and3 = randomWords[0] % s_tokenURIs.length;
        DevType dev = DevType(randomBetween0and3);
        _safeMint(tokenMinterAddress, s_tokenCounter);
        _setTokenURI(s_tokenCounter, s_tokenURIs[randomBetween0and3]);
        emit NftMinted(dev);
        s_tokenCounter++;
    }

    function getTokenCounter() public view returns (uint8) {
        return s_tokenCounter;
    }

    function getTokenMinterById(uint8 tokenId) public view returns (address) {
        return s_tokenIdMinter[tokenId];
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
