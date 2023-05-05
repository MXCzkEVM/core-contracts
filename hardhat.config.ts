import { HardhatUserConfig } from "hardhat/config";
import {
    EVM_VERSION,
    SOLIDITY_VERSION,
} from "@ericxstone/hardhat-blockscout-verify";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-truffle5";
import "hardhat-gas-reporter";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "./tasks";

export const archivedDeploymentPath = "./deployments/archive";

let real_accounts = undefined;
if (process.env.DEPLOYER_KEY) {
    real_accounts = [
        process.env.DEPLOYER_KEY,
        process.env.OWNER_KEY || process.env.DEPLOYER_KEY,
    ];
}

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
            tags: ["test"],
            gas: 8000000,
            saveDeployments: true,
            allowUnlimitedContractSize: true,
        },
        mxc_testnet: {
            saveDeployments: true,
            chainId: 5167003,
            accounts: real_accounts,
            url: process.env.MXC_TESTNET_URL || "",
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        owner: {
            default: 0,
        },
    },
    blockscoutVerify: {
        blockscoutURL: "https://wannsee-explorer-v1.mxc.com",
        contracts: {
            Storage: {
                compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_18, // checkout enum SOLIDITY_VERSION
                optimization: true,
                evmVersion: EVM_VERSION.EVM_LONDON, // checkout enum SOLIDITY_VERSION
                optimizationRuns: 200,
            },
        },
    },
};

export default config;
