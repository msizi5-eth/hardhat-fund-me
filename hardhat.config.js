require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // This is how we allow solidity to compile different versions of contracts.
  // It's especially useful when certain contracts you need weren't updated.
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
  },
  // Always remember that when adding a default network, it should be outside
  // of the 'networks' flag.
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: process.env.INFURA_API_KEY,
      accounts: [ROPSTEN_PRIVATE_KEY],
      chainId: 4,
      // These confirmations are the delay before the verification process begins.
      // Similar to the '.wait()' methodology used in the simple-storage deployment
      // pattern.
      blockConfirmation: 3,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API,
    token: "ETH",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      // We can also specify which account will be used as the default deployer
      // on different chains. i.e. use the chainID.

      // This would make the first account the default deployer address on the
      // Ropsten testnet.

      // 3: 1,
    },
    user: {
      default: 1,
    },
  },
};
