// We only deploy mocks when necessary. e.g. We don't need to deploy mocks on testnets such as Rinkby, Polygon, or Kovan
// if we want certain data feeds because they're already there.
const { network } = require("hardhat");
const {
  developmentChain,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Once you've compiled the mock contract (using the chainlink test contract/custom)
  // make sure that it doesn't deploy unnecessarily. Specify which chains to deploy the
  // mocks to. To do that, we go back to the 'helper-hardhat-config' file.

  if (developmentChain.includes(network.name)) {
    log("Local network detected! Deploying Mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      // The args for mocks depend on the contract you're deploying. Therefore, make sure
      // you check them in the original repo.
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks deployed!");
    // This is just to signal the end of the deploy script.
    log(
      "---------------------------------------------------------------------"
    );
  }
};

module.exports.tags = ["all", "mocks"];
