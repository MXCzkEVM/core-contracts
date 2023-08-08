import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
    const ApplicationContractAddress = '0x68214FdEf3cb834457A29C74978639fa7da68864';
    const ProvisioningContractAddress = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';
    const LPWANContractAddress = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';
    const SensorProfileContractAddress1 = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';
    const SensorProfileContractAddress2 = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';
    const NAME = 'MXC Reward Token';
    const SYMBOL = 'MRT';
    const AMOUNT = ethers.utils.parseEther("3000");
    const XToEarnFormula = { x: "y", a: "b" }

    const [owner, otherAccount] = await ethers.getSigners();

    const TOKEN_NAME = 'Walk Sensor Provisioning';
    const TOKEN_SYMBOL = 'WSP'
    const AMOUNT_1000 = ethers.utils.parseEther('1000');
    const BLOCK_1 = 2591865;

    const LPWANMock = await ethers.getContractFactory("LPWANMock");
    const lpwanMock = await LPWANMock.deploy();

    await lpwanMock.deployed();

    console.log('Verifying LPWAN mock.....')

    await run("verify:verify", {
        address: lpwanMock.address,
        constructorArguments: []
    })

    console.log(
        `LPWAN Mock deployed to ${lpwanMock.address}`
    );

    // CREATE MEP802
    const createMEP802Txn = await lpwanMock.createMEP802(TOKEN_NAME, TOKEN_SYMBOL, AMOUNT_1000, BLOCK_1, ApplicationContractAddress);
    const createMEP802TxnReceipt: ContractReceipt = await createMEP802Txn.wait();

    // Get the transaction logs
    const createMEP802TxnEvents = createMEP802TxnReceipt.events;
    const createMEP802Event = createMEP802TxnEvents && createMEP802TxnEvents.find(
        (event) => event.event === "MEP802Created"
    );

    // Retrieve the contract addresses
    const provisioningContractAddress = await lpwanMock.provisioningContractAddress(1);

    console.log('Verifying Provisioning Contract.....');
    await run("verify:verify", {
        address: provisioningContractAddress,
        constructorArguments: [
            TOKEN_NAME,
            TOKEN_SYMBOL,
            AMOUNT_1000,
            BLOCK_1,
            ApplicationContractAddress,
            lpwanMock.address
        ]
    })

    console.log("Create Application Log: ", createMEP802Event?.args);
    console.log("Provisioning Contract Address: ", provisioningContractAddress);




    // CREATE MEP804
    const createMEP804Txn = await lpwanMock.createMEP804(

        ApplicationContractAddress,
        ProvisioningContractAddress, owner.address, LPWANContractAddress,
        [SensorProfileContractAddress1, SensorProfileContractAddress2],
        XToEarnFormula, NAME, SYMBOL, AMOUNT

    );
    const createMEP804TxnReceipt: ContractReceipt = await createMEP804Txn.wait();

    // Get the transaction logs
    const createMEP804TxnEvents = createMEP804TxnReceipt.events;
    const createMEP804Event = createMEP804TxnEvents && createMEP804TxnEvents.find(
        (event) => event.event === "MEP804Created"
    );

    // Retrieve the contract addresses
    const rewardContractAddress = await lpwanMock.rewardContractAddress(1);

    console.log('Verifying Reward Contract.....');
    await run("verify:verify", {
        address: rewardContractAddress,
        constructorArguments: [
            ApplicationContractAddress, ProvisioningContractAddress, owner.address,
            LPWANContractAddress, [SensorProfileContractAddress1, SensorProfileContractAddress2],
            XToEarnFormula, NAME, SYMBOL, AMOUNT
        ]
    })

    console.log("Create Application Log: ", createMEP804Event?.args);
    console.log("Reward Contract Address: ", rewardContractAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
