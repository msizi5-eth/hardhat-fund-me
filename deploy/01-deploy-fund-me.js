// Be sure to pass through the Hardhat Runtime Environment when
// building out this function. If you don't, it might still
// deploy but it'll also throw an error.

const { network } = require("hardhat");
const { networkConfig, developmentChain } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

// To be specific, these are the two variables we're mainly concerned
// with. We have two options:

// 1. We can pass through 'hre' and then destructure the variable in
// the body of the function; or

// 2. We can destructure the variables by passing an object in the function
// variable (syntactic sugar).

module.exports = async ({ getNamedAccounts, deployments }) => {
  // These two destructured variables are also objects. Within these objects
  // we're interested in certain variables - that we'll destructure.

  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // This modularises our price feed. Since we defined an object in the 'helper-hardhat-config'
  // file, we're able to switch between different price feeds depending on which chain we're
  // operating on.

  // The chain ID is set at deployment (remember to include all the relevant deployment params in
  // the 'hardhat.config' file) and triggers one of the key/value pairs in the object.
  //   const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

  // Instead of hardcoding the address, we could use an if/else statement that dynamically assigns
  // the address depending on where the contract is deployed.
  let ethUsdPriceFeedAddress;
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // Mocks: If a contract doesn't exist, we deploy a minimal version of it for our local testing.

  // When using localhost or hardhat for testing, you should use mocks

  const args = [ethUsdPriceFeedAddress];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // Arguments that are directed toward the constructor.
    log: true,
    waitConfirmations: network.config.blockConfirmation || 1,
  });

  // We also want to trigger automatic verification if the contract is deployed to a live/test network.

  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }

  log(
    "-------------------------------------------------------------------------------------------------------------------------"
  );
};

module.exports.tags = ["all", "fundme"];
