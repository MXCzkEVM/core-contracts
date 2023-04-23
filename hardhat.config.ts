import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-solhint";
import "hardhat-gas-reporter";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "./tasks/deploy_MEP1002Token";
import "./tasks/generate_MEP1002Token";

const hardhatMnemonic =
  "test test test test test test test test test test test taik";
const config: HardhatUserConfig = {
  solidity: {
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
    version: "0.8.18",
  },
  gasReporter: {
    currency: "USD",
    enabled: true,
    gasPriceApi:
      "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    token: "ETH",
  },
  mocha: {
    timeout: 300000,
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: hardhatMnemonic,
      },
      gas: 8000000,
      allowUnlimitedContractSize: true,
    },
    mxc_testnet: {
      chainId: 5167003,
      accounts:
        process.env.PRIVATE_KEY !== undefined
          ? [process.env.PRIVATE_KEY]
          : [],
      url: process.env.MXC_TESTNET_URL || "",
    }
  }
};

export default config;
