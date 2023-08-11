import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
    const ApplicationContractAddress = '0x9631ec0491a60d500a10d61e08ac17d00823Ff39';
    const LPWANContractAddress = '0x750d989cacf0C18E7bE17E224FC7fb2341353272';
    const SensorProfileContractAddress1 = '0xD21D048a2A5ede22BbD82fd94C29DA9dFE0fddDa';
    const SensorProfileContractAddress2 = '0x4B8E85Fad30ba08e11360F66666ed5979078070D';
    const NAME = 'MXC Reward Token';
    const SYMBOL = 'MRT';
    const AMOUNT = ethers.utils.parseEther("3000");
    const XToEarnFormula = { x: 'y', a: 'b' }

    const [owner, otherAccount] = await ethers.getSigners();

    const LPWANMock = await ethers.getContractFactory("LPWANMock");
    const lpwanMock = LPWANMock.attach(LPWANContractAddress);

    // CREATE MEP804
    const createMEP804Txn = await lpwanMock.createMEP804(
        ApplicationContractAddress, owner.address, LPWANContractAddress,
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
    const rewardContractAddress = await lpwanMock.rewardContractAddresses(1);

    console.log('Verifying Reward Contract.....');
    await run("verify:verify", {
        address: rewardContractAddress,
        constructorArguments: [
            ApplicationContractAddress, owner.address, LPWANContractAddress,
            [SensorProfileContractAddress1, SensorProfileContractAddress2],
            XToEarnFormula, NAME, SYMBOL, AMOUNT
        ]
    })

    console.log("Create mep804 Log: ", createMEP804Event?.args);
    console.log("Reward Contract Address: ", rewardContractAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
