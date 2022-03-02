const BettingGame = artifacts.require("BettingGame.sol");

module.exports = async function (deployer) {
  await deployer.deploy(BettingGame);
  const bettingGame = await BettingGame.deployed();
  console.log("bettingGame address is: ", bettingGame.address);
};
