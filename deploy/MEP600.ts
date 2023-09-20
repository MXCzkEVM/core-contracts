import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
    const [owner, secondAccount, thirdAccount] = await ethers.getSigners();
    const TOKEN_NAME = "NFCNFT Token";
    const TOKEN_SYMBOL = "NFCT";
    const TOKEN_URI = 'https://gateway.pinata.cloud/ipfs/Qmav5akQh5ZzWZ1UKAQ66LaXZZFnYqC3GYw6xVVJiXfQfu';
    const CHAINID = 5167003

    const AMOUNT_0_5 = ethers.utils.parseEther("0.5");

    // const NFCNFTMarketplace = await ethers.getContractFactory("NFCNFTMarketplace");
    // const nfcNftMarketplace = await NFCNFTMarketplace.deploy(AMOUNT_0_5);

    // await nfcNftMarketplace.deployed();
    // console.log('Verify NFCNFT Marketplace Contract.....');
    // await run("verify:verify", {
    //     address: nfcNftMarketplace.address,
    //     constructorArguments: [AMOUNT_0_5]
    // })
    // console.log(`NFC NFT Marketplace deployed to ${nfcNftMarketplace.address}`)
    
    
    const NCFNFT = await ethers.getContractFactory("NFCNFT");
    const nfcNft = await NCFNFT.deploy("0xe4E21d9191D76DA650CE5Ab247b82AFFEbF0472A", TOKEN_NAME, TOKEN_SYMBOL);

    await nfcNft.deployed()
    console.log('Verify NCFNFT Contract.....');
    await run("verify:verify", {
        address: nfcNft.address,
        constructorArguments: ["0xe4E21d9191D76DA650CE5Ab247b82AFFEbF0472A", TOKEN_NAME, TOKEN_SYMBOL]
    })
    console.log(`NFC NFT deployed to ${nfcNft.address}`)


    // MINT NFCNFT 1
    const mintNFCNFTTxn1 = await nfcNft.mintNFCNFT(TOKEN_URI);
    const mintNFCNFTTxnReceipt1: ContractReceipt = await mintNFCNFTTxn1.wait();
    // Get the transaction logs
    const mintNFCNFTTxnEvents = mintNFCNFTTxnReceipt1.events;
    const mintNFCNFTEvent = mintNFCNFTTxnEvents && mintNFCNFTTxnEvents.find(
        (event: any) => event.event === "NFCNFTMinted"
    );
    console.log("Mint NFC NFT 1 Log: ", mintNFCNFTEvent?.args?._itemId?._hex);

    // MINT NFCNFT 2
    const mintNFCNFTTxn2 = await nfcNft.mintNFCNFT(TOKEN_URI);
    const mintNFCNFTTxnReceipt2: ContractReceipt = await mintNFCNFTTxn2.wait();
    // Get the transaction logs
    const mintNFCNFTTxnEvents2 = mintNFCNFTTxnReceipt2.events;
    const mintNFCNFTEvent2 = mintNFCNFTTxnEvents2 && mintNFCNFTTxnEvents2.find(
        (event: any) => event.event === "NFCNFTMinted"
    );
    console.log("Mint NFC NFT 2 Log: ", mintNFCNFTEvent2?.args?._itemId?._hex);

    // MINT NFCNFT 3
    const mintNFCNFTTxn3 = await nfcNft.mintNFCNFT(TOKEN_URI);
    const mintNFCNFTTxnReceipt3: ContractReceipt = await mintNFCNFTTxn3.wait();
    // Get the transaction logs
    const mintNFCNFTTxnEvents3 = mintNFCNFTTxnReceipt3.events;
    const mintNFCNFTEvent3 = mintNFCNFTTxnEvents3 && mintNFCNFTTxnEvents3.find(
        (event: any) => event.event === "NFCNFTMinted"
    );

    console.log("Mint NFC NFT 3 Log: ", mintNFCNFTEvent3?.args?._itemId?._hex);

    // MINT NFCNFT 4
    // const mintNFCNFTTxn4 = await nfcNft.connect(secondAccount).mintNFCNFT(TOKEN_URI);
    // const mintNFCNFTTxnReceipt4: ContractReceipt = await mintNFCNFTTxn4.wait();
    // // Get the transaction logs
    // const mintNFCNFTTxnEvents4 = mintNFCNFTTxnReceipt4.events;
    // const mintNFCNFTEvent4 = mintNFCNFTTxnEvents4 && mintNFCNFTTxnEvents4.find(
    //     (event: any) => event.event === "NFCNFTMinted"
    // );
    // console.log("Mint NFC NFT 4 Log: ", mintNFCNFTEvent4?.args?._itemId?._hex);


    const TAG_1 = "0x5188db936900589dbdf928aa5672376cdb198a6e12672d7d681e2de51469df41"
    const TAG_2 = "0x5188db936900589dbdf928aa5672376cdb198a6e12672d7d681e2de51469d333"
    const TAG_3 = "0x5188db936900589dbdf928aa5672376cdb198a6e12672d7d681e2de51469d781"


    const provisionNFCNFTTxn1 = await nfcNft.provisionNFCNFT(1, TAG_1);
    const provisionNFCNFTTxnReceipt1: ContractReceipt = await provisionNFCNFTTxn1.wait();
    // Get the transaction logs
    const provisionNFCNFT1TxnEvents1 = provisionNFCNFTTxnReceipt1.events;
    const provisionNFCNFTEvent1 = provisionNFCNFT1TxnEvents1 && provisionNFCNFT1TxnEvents1.find(
        (event: any) => event.event === "NFCNFTProvisioned"
    );
    console.log("Provision NFC NFT 1 Log: ", provisionNFCNFTEvent1?.args);



    const provisionNFCNFTTxn2 = await nfcNft.provisionNFCNFT(2, TAG_2);
    const provisionNFCNFTTxnReceipt2: ContractReceipt = await provisionNFCNFTTxn2.wait();
    // Get the transaction logs
    const provisionNFCNFT1TxnEvents2 = provisionNFCNFTTxnReceipt2.events;
    const provisionNFCNFTEvent2 = provisionNFCNFT1TxnEvents2 && provisionNFCNFT1TxnEvents2.find(
        (event: any) => event.event === "NFCNFTProvisioned"
    );
    console.log("Provision NFC NFT 2 Log: ", provisionNFCNFTEvent2?.args);



    const provisionNFCNFTTxn3 = await nfcNft.provisionNFCNFT(3, TAG_3);
    const provisionNFCNFTTxnReceipt3: ContractReceipt = await provisionNFCNFTTxn3.wait();
    // Get the transaction logs
    const provisionNFCNFT1TxnEvents3 = provisionNFCNFTTxnReceipt3.events;
    const provisionNFCNFTEvent3 = provisionNFCNFT1TxnEvents3 && provisionNFCNFT1TxnEvents3.find(
        (event: any) => event.event === "NFCNFTProvisioned"
    );
    console.log("Provision NFC NFT 3 Log: ", provisionNFCNFTEvent3?.args);

    // // CHECK OWNER OF TOKEN ID
    // const ownerOfTokenId1 = await nfcNft.ownerOf(1);
    // console.log("Owner Of Token Id 1 Log: ", ownerOfTokenId1);

    // // CHECK OWNER OF TOKEN ID
    // const ownerOfTokenId3 = await nfcNft.ownerOf(3);
    // console.log("Owner Of Token Id 3 Log: ", ownerOfTokenId3);


    // // GET BALANCE OF CONTRACT
    // const getContractBalanceTxn1 = await nfcNftMarketplace.getContractBalance();
    // console.log("Get Balance of Contract 1 Log: ", parseFloat(ethers.utils.formatEther(getContractBalanceTxn1)));


    // /// LIST NFT FOR SALE
    // const listNFTForSaleTxn1 = await nfcNftMarketplace.listNFTForSale(nfcNft.address, 1, AMOUNT_10, { value: AMOUNT_0_5 });
    // const listNFTForSaleTxnReceipt1: ContractReceipt = await listNFTForSaleTxn1.wait();

    // const listNFTForSaleTxnEvents1 = listNFTForSaleTxnReceipt1.events;
    // const listNFTForSaleEvent1 = listNFTForSaleTxnEvents1 && listNFTForSaleTxnEvents1.find(
    //     (event: any) => event.event === "NFTListedForSale"
    // );
    // console.log("List NFT for sale 1 Log: ", listNFTForSaleEvent1?.args);

    // // GET BALANCE OF CONTRACT
    // const getContractBalanceTxn2 = await nfcNftMarketplace.getContractBalance();
    // console.log("Get Balance of Contract 2 Log: ", parseFloat(ethers.utils.formatEther(getContractBalanceTxn2)));


    // /// LIST NFT FOR SALE
    // const listNFTForSaleTxn2 = await nfcNftMarketplace.connect(secondAccount).listNFTForSale(nfcNft.address, 3, AMOUNT_10, { value: AMOUNT_0_5 });
    // const listNFTForSaleTxnReceipt2: ContractReceipt = await listNFTForSaleTxn2.wait();

    // const listNFTForSaleTxnEvents2 = listNFTForSaleTxnReceipt2.events;
    // const listNFTForSaleEvent2 = listNFTForSaleTxnEvents2 && listNFTForSaleTxnEvents2.find(
    //     (event: any) => event.event === "NFTListedForSale"
    // );
    // console.log("List NFT for sale 2 Log: ", listNFTForSaleEvent2?.args);

    // const ownerBalance0fETH = await ethers.provider.getBalance(owner.address)
    // console.log("Owner Balance 0f ETH Log: ", parseFloat(ethers.utils.formatEther(ownerBalance0fETH)));

    // const secondAccountBalance0fETH = await ethers.provider.getBalance(secondAccount.address)
    // console.log("Second Account Balance 0f ETH Log: ", parseFloat(ethers.utils.formatEther(secondAccountBalance0fETH)));

    // const thirdAccountBalance0fETH = await ethers.provider.getBalance(thirdAccount.address)
    // console.log("Second Account Balance 0f ETH Log: ", parseFloat(ethers.utils.formatEther(thirdAccountBalance0fETH)));

    // // GET BALANCE OF CONTRACT
    // const getContractBalanceTxn3 = await nfcNftMarketplace.getContractBalance();
    // console.log("Get Balance of Contract 3 Log: ", parseFloat(ethers.utils.formatEther(getContractBalanceTxn3)));

    // // CHECK OWNER OF TOKEN ID
    // const newOwnerOfTokenId1 = await nfcNft.ownerOf(1);
    // console.log("New Owner Of Token Id 1 Log: ", newOwnerOfTokenId1);

    // // CHECK OWNER OF TOKEN ID
    // const newOwnerOfTokenId3 = await nfcNft.ownerOf(3);
    // console.log("New Owner Of Token Id 3 Log: ", newOwnerOfTokenId3);



    // /// PURCHASE NFT 1
    // const purchaseNFTTxn1 = await nfcNftMarketplace.connect(thirdAccount).purchaseNFT(nfcNft.address, 1, { value: AMOUNT_10 });
    // const purchaseNFTTxnReceipt1: ContractReceipt = await purchaseNFTTxn1.wait();

    // const purchaseNFTTxnEvents1 = purchaseNFTTxnReceipt1.events;
    // const purchaseNFTEvent1 = purchaseNFTTxnEvents1 && purchaseNFTTxnEvents1.find(
    //     (event: any) => event.event === "NFTPurchased"
    // );
    // console.log("Purchase NFT 1 Log: ", purchaseNFTEvent1?.args);

    // /// PURCHASE NFT 2
    // const purchaseNFTTxn2 = await nfcNftMarketplace.connect(secondAccount).purchaseNFT(nfcNft.address, 3, { value: AMOUNT_10 });
    // const purchaseNFTTxnReceipt2: ContractReceipt = await purchaseNFTTxn2.wait();

    // const purchaseNFTTxnEvents2 = purchaseNFTTxnReceipt2.events;
    // const purchaseNFTEvent2 = purchaseNFTTxnEvents2 && purchaseNFTTxnEvents2.find(
    //     (event: any) => event.event === "NFTPurchased"
    // );
    // console.log("Purchase NFT 2 Log: ", purchaseNFTEvent2?.args);

    // const newOwnerBalance0fETH = await ethers.provider.getBalance(owner.address)
    // console.log("New Owner Balance 0f ETH Log: ", parseFloat(ethers.utils.formatEther(newOwnerBalance0fETH)));

    // const newSecondAccountBalance0fETH = await ethers.provider.getBalance(secondAccount.address)
    // console.log("New Second Account Balance 0f ETH Log: ", parseFloat(ethers.utils.formatEther(newSecondAccountBalance0fETH)));

    // const newThirdAccountBalance0fETH = await ethers.provider.getBalance(thirdAccount.address)
    // console.log("New Third Account Balance 0f ETH Log: ", parseFloat(ethers.utils.formatEther(newThirdAccountBalance0fETH)));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
