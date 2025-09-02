// contracts/Roulette.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

contract Roulette is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;

    uint64 public s_subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit;
    uint16 public requestConfirmations;
    uint32 public numWords;

    address public owner;
    uint256 public houseEdge = 200; // 2%
    uint256 public minBet = 0.01 ether;

    struct Bet {
        address player;
        string username;
        uint8 number;
        uint256 amount;
    }

    mapping(uint256 => Bet) public bets;

    event BetPlaced(address indexed player, string username, uint8 number, uint256 amount);
    event BetResult(address indexed player, string username, uint8 winningNumber, bool won);

    constructor(
        address vrfCoordinator,
        uint64 subId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _confirmations,
        uint32 _numWords
    ) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _confirmations;
        numWords = _numWords;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function placeBet(string calldata username, uint8 number) external payable {
        require(number < 37, "Choose number 0-36");
        require(msg.value >= minBet, "Bet must be at least minBet");

        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        bets[requestId] = Bet(msg.sender, username, number, msg.value);
        emit BetPlaced(msg.sender, username, number, msg.value);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        Bet memory bet = bets[requestId];
        require(bet.player != address(0), "Bet not found");

        uint8 result = uint8(randomWords[0] % 37);
        bool won = (bet.number == result);

        if (won) {
            uint256 payout = (bet.amount * 36 * (10000 - houseEdge)) / 10000;
            payable(bet.player).transfer(payout);
        }

        emit BetResult(bet.player, bet.username, result, won);
        delete bets[requestId];
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {}
}
