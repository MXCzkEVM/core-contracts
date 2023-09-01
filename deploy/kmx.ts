import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
    const KMXImplementation = await ethers.getContractFactory("KMXImplementation");
    const kmxImplementation = await KMXImplementation.deploy();

    await kmxImplementation.deployed()
    // console.log('Verify NCFNFT Contract.....');
    // await run("verify:verify", {
    //     address: kmxImplementation.address,
    //     constructorArguments: []
    // })
    console.log(`KMX Implementation deployed to ${kmxImplementation.address}`)


    // check kmx Implementation
    const kmxImplementationTxn1 = await kmxImplementation.kmxPrice();
    console.log("kmx Implementation Txn1 Log: ", ethers.utils.formatUnits(kmxImplementationTxn1, 18));


    // UPDATE KMX PRICE
    const updateKMXPriceTxn = await kmxImplementation.updateKMXPrice(4500);
    const updateKMXPriceTxnReceipt: ContractReceipt = await updateKMXPriceTxn.wait();
    const updateKMXPriceTxnEvents = updateKMXPriceTxnReceipt.events;
    const updateKMXPriceEvent = updateKMXPriceTxnEvents && updateKMXPriceTxnEvents.find(
        (event: any) => event.event === "KMXPriceUpdated"
    );
    console.log("Update KMX Price Log: ", updateKMXPriceEvent?.args);

    // check kmx Implementation
    const kmxImplementationTxn2 = await kmxImplementation.kmxPrice();
    console.log("kmx Implementation Txn2 Log: ", ethers.utils.formatUnits(kmxImplementationTxn2, 18));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
