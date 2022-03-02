// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract BettingGame is VRFConsumerBase {
    /** !UPDATE
     *
     * assign an aggregator contract to the variable.
     */
    AggregatorV3Interface internal ethUsd;

    uint256 internal fee;
    uint256 public randomResult;

    //Network: Koven
    address constant VFRC_address = 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9; // VRF Coordinator
    address constant LINK_address = 0xa36085F69e2889c224210F603D836748e7dC0088; // LINK token

    //keyHash - one of the component from which will be generated final random value by Chainlink VFRC.
    bytes32 internal constant keyHash =
        0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;

    uint256 public gameId;
    uint256 public lastGameId;
    address payable public admin;
    mapping(uint256 => Game) public games;

    struct Game {
        uint256 id;
        uint256 bet;
        // uint256 seed;
        uint256 amount;
        address payable player;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "caller is not the admin");
        _;
    }

    modifier onlyVFRC() {
        require(msg.sender == VFRC_address, "only VFRC can call this function");
        _;
    }

    event Withdraw(address admin, uint256 amount);
    event Received(address indexed sender, uint256 amount);
    event Result(
        uint256 id,
        uint256 bet,
        uint256 amount,
        address player,
        uint256 winAmount,
        uint256 randomResult,
        uint256 time
    );

    /**
     * Constructor inherits VRFConsumerBase.
     */
    constructor() public VRFConsumerBase(VFRC_address, LINK_address) {
        fee = 0.1 * 10**18; // 0.1 LINK
        admin = payable(msg.sender);

        ethUsd = AggregatorV3Interface(
            0x9326BFA02ADD2366b30bacB125260Af641031331
        );
    }

    /* Allows this contract to receive payments */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     *
     * Returns latest ETH/USD price from Chainlink oracles.
     */
    function ethInUsd() public view returns (int256) {
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = ethUsd.latestRoundData();

        return price;
    }

    /**
     *
     * ethUsd - latest price from Chainlink oracles (ETH in USD * 10**8).
     * weiUsd - USD in Wei, received by dividing:
     *          ETH in Wei (converted to compatibility with etUsd (10**18 * 10**8)),
     *          by ethUsd.
     */
    function weiInUsd() public view returns (uint256) {
        int256 ethUsd = ethInUsd();
        int256 weiUsd = 10**26 / ethUsd;

        return uint256(weiUsd);
    }

    /**
     * Taking bets function.
     * By winning, user 2x his betAmount.
     * By losing, user lost all the betAmount.
     * By drawing, user can take their bet back.
     */
    function game(uint256 bet) public payable returns (bool) {
        /** !UPDATE
         *
         * Checking if msg.value is higher or equal than $1.
         */
        uint256 weiUsd = weiInUsd();
        require(msg.value >= weiUsd, "Error, msg.value must be >= $1");

        //bet 0 = rock, 1 = paper, 2 = scissors
        require(bet <= 2, "Error, accept only 0, 1 or 2");

        //vault balance must be at least equal to msg.value
        require(
            address(this).balance / 2 >= msg.value,
            "Error, insufficent vault balance"
        );

        //each bet has unique id
        games[gameId] = Game(gameId, bet, msg.value, payable(msg.sender));

        //increase gameId for the next bet
        gameId = gameId + 1;

        //seed is auto-generated
        getRandomNumber();

        return true;
    }

    /**
     * Request for randomness.
     */
    function getRandomNumber() internal returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator.
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness % 3;

        //send final random value to the verdict();
        verdict(randomResult);
    }

    /**
     * Send rewards to the winners.
     */
    function verdict(uint256 random) public payable onlyVFRC {
        //check bets from latest betting round, one by one
        for (uint256 i = lastGameId; i < gameId; i++) {
            //reset winAmount for current user
            uint256 winAmount = 0;
            // 0 = rock, 1 = paper, 2 = scissors
            if (
                (random == 0 && games[i].bet == 1) ||
                (random == 1 && games[i].bet == 2) ||
                (random == 2 && games[i].bet == 0)
            ) {
                winAmount = games[i].amount * 2;
                games[i].player.transfer(winAmount);
            } else if (random == games[i].bet) {
                games[i].player.transfer(games[i].amount);
            }
            emit Result(
                games[i].id,
                games[i].bet,
                games[i].amount,
                games[i].player,
                winAmount,
                random,
                block.timestamp
            );
        }
        //save current gameId to lastGameId for the next betting round
        lastGameId = gameId;
    }

    /**
     * Withdraw LINK from this contract (admin option).
     */
    function withdrawLink(uint256 amount) external onlyAdmin {
        require(LINK.transfer(msg.sender, amount), "Error, unable to transfer");
    }

    /**
     * Withdraw Ether from this contract (admin option).
     */
    function withdrawEther(uint256 amount) external payable onlyAdmin {
        require(
            address(this).balance >= amount,
            "Error, contract has insufficent balance"
        );
        admin.transfer(amount);

        emit Withdraw(admin, amount);
    }
}
