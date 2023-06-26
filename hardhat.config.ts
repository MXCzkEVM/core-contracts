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

const real_accounts = [
    process.env.DEPLOYER_KEY || "",
    process.env.OTHER_ACCOUNT || "",
    process.env.OWNER_KEY || process.env.DEPLOYER_KEY || "",
    process.env.PRIVATE_KEY_NOPERMISSION || process.env.PRIVATE_KEY || "",
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
        mxc_testnet: {
            saveDeployments: true,
            chainId: 5167003,
            // accounts: real_accounts,
            gas: 6000000,
            accounts: [process.env.DEPLOYER_KEY] as HttpNetworkAccountsUserConfig | undefined,
            url: process.env.MXC_TESTNET_URL || "",
        },
        wannsee: {
            url: "https://wannsee-rpc.mxc.com",
            chainId: 5167003,
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
