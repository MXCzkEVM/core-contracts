import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@cartesi/hardhat-verify-deployments";
// import "@nomicfoundation/hardhat-verify";

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

const real_accounts = [
    process.env.DEPLOYER_KEY || "",
    process.env.OWNER_KEY || process.env.DEPLOYER_KEY || "",
    process.env.PRIVATE_KEY_NOPERMISSION || process.env.PRIVATE_KEY || "",
    process.env.OTHER_ACCOUNT || "",
] as string[]

type HttpNetworkAccountsUserConfig = /*unresolved*/ any

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
            chainId: 5167003,
            gas: 8000000,
            saveDeployments: true,
            allowUnlimitedContractSize: true,
        },
        mxc: {
            url: 'https://rpc.mxc.com',
            saveDeployments: true,
            chainId: 18686,
            accounts: real_accounts,
            gasPrice: 500000000000000
        },
        mxc_testnet: {
            saveDeployments: true,
            chainId: 5167003,
            // accounts: real_accounts,
            gas: 6000000,
            accounts: [process.env.DEPLOYER_KEY] as HttpNetworkAccountsUserConfig | undefined,
            url: process.env.MXC_TESTNET_URL || "",
        },
        wannsee: {
            url: "http://207.246.99.8:8545",
            chainId: 5167003,
            // accounts: real_accounts,
            accounts: [process.env.DEPLOYER_KEY] as HttpNetworkAccountsUserConfig | undefined,
            gasPrice: 6000000000000,
            saveDeployments: true,
        },
        sepolia: {
            url: "https://eth-sepolia.g.alchemy.com/v2/gSjO4iw0TH4xnWrpobKxM9E-l323GFcP",
            chainId: 11155111,
            // accounts: real_accounts,
            accounts: [process.env.DEPLOYER_KEY] as HttpNetworkAccountsUserConfig | undefined,
            // gasPrice: 6000000000000,
            saveDeployments: true,
        },
    },
    namedAccounts: {
        deployer: 0,
        owner: 1,
        nopermission: 2
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
        customChains: [
            {
                network: "mxc_testnet",
                chainId: 5167003,
                urls: {
                    apiURL: "https://wannsee-explorer-v1.mxc.com/api",
                    browserURL: "https://wannsee-explorer.mxc.com/",
                },
            },
        ],
    },
};

export default config;
