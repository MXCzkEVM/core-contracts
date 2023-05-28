import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@cartesi/hardhat-verify-deployments";

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

const PRIVATE_KEY_ADMIN: string = process.env.PRIVATE_KEY_ADMIN || ""
const PRIVATE_KEY1: string = process.env.PRIVATE_KEY1 || ""

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
            tags: ["test", "upgrade"],
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
        wannsee: {
            url: "https://wannsee-rpc.mxc.com",
            chainId: 5167003,
            accounts: [PRIVATE_KEY_ADMIN, PRIVATE_KEY1],
            // gasPrice: 6000000000000,
            saveDeployments: true,
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
    etherscan: {
        apiKey: {
            mxc_testnet: "testr",
        },
        customChains: [
            {
                network: "mxc_testnet",
                chainId: 5167003,
                urls: {
                    apiURL: "http://51.222.254.9/api",
                    browserURL: "http://51.222.254.9/",
                },
            },
        ],
    },
};

export default config;
