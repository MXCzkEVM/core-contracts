import { ContractReceipt } from "ethers";
import { ethers } from "hardhat";

async function main() {
    const ApplicationContractAddress = '0x32e50C7761F6C4107663c8247E49f7aa2A0F1941';

    const TOKEN_NAME = 'Walk Sensor Provisioning';
    const TOKEN_SYMBOL = 'WSP'
    const AMOUNT_500 = ethers.utils.parseEther('500');
    const AMOUNT_1000 = ethers.utils.parseEther('1000');
    const AMOUNT_2500 = ethers.utils.parseEther('2500');
    const BLOCK_1 = 2591865;
    const BLOCK_2 = 5183730;
    const BLOCK_5 = 12959325;

    const LPWANMock = await ethers.getContractFactory("LPWANMock");
    const lpwanMock = await LPWANMock.deploy();

    await lpwanMock.deployed();

    console.log(
        `LPWAN Mock deployed to ${lpwanMock.address}`
    );

    // CREATE MEP802
    const createMEP802Txn = await lpwanMock.createMEP802(TOKEN_NAME, TOKEN_SYMBOL, AMOUNT_500, AMOUNT_1000, AMOUNT_2500, BLOCK_1, BLOCK_2, BLOCK_5, ApplicationContractAddress);
    const createMEP802TxnReceipt: ContractReceipt = await createMEP802Txn.wait();

    // Get the transaction logs
    const createMEP802TxnEvents = createMEP802TxnReceipt.events;
    const createMEP802Event = createMEP802TxnEvents && createMEP802TxnEvents.find(
        (event) => event.event === "MEP802Created"
    );

    // Retrieve the contract addresses
    const provisioningContractAddress = await lpwanMock.provisioningContractAddress(1);

    console.log("Create Application Log: ", createMEP802Event?.args);
    console.log("Provisioning Contract Address: ", provisioningContractAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
