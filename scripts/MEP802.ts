import { ContractReceipt } from "ethers";
import { ethers } from "hardhat";
import { check } from "prettier";

async function main() {
  const ProvisioningContractAddress = '0x733aa0AACadB3419ce0d43A1cE8821e7Cb38ef5B';
  const ApplicationContractAddress = '0x47bEF8F10F525dC5c1aA2A6C33B33520f61b7011';
  const SensorProfileContractAddress = '0xdebBFb56b4354A3E389910088731E9702331C351';

  const [owner, otherAccount] = await ethers.getSigners();

  const EMAIL = 'aabiodunawoyemi@gmail.com';
  const PID_AMOUNT = 7;
  const TOKENID_1 = 0;
  const pID = ethers.utils.formatBytes32String('TESTPIDOOOOOOOOOOOOOOOOO');
  const pIDHash = '0x3d51c5416f078e9d8f557c14191cf1a9cb1ef0f18b808af8587eff456f419833'

  const AMOUNT_1000 = ethers.utils.parseEther('1000');
  const TOKEN_URI = 'https://gateway.pinata.cloud/ipfs/Qmav5akQh5ZzWZ1UKAQ66LaXZZFnYqC3GYw6xVVJiXfQfu';
  const CHAINID = 5167003

  const ProvisioningContract = await ethers.getContractFactory("ProvisioningContract");
  const provisioningContract = ProvisioningContract.attach(ProvisioningContractAddress);

  // PRODUCE A PID
  const producePIDTxn = await provisioningContract.producePID(EMAIL, PID_AMOUNT, ApplicationContractAddress, SensorProfileContractAddress);
  const producePIDTxnReceipt: ContractReceipt = await producePIDTxn.wait();

  // Get the transaction logs
  const producePIDTxnEvents = producePIDTxnReceipt.events;
  const producePIDEvent = producePIDTxnEvents && producePIDTxnEvents.find(
    (event) => event.event === "PIDProduced"
  );

  console.log("Produce PID Log: ", producePIDEvent?.args);

  // MINT SENSOR NFT
  const mintSensorNFTTxn = await provisioningContract.mintSensorNFT(pIDHash, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt: ContractReceipt = await mintSensorNFTTxn.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents = mintSensorNFTTxnReceipt.events;
  const mintSensorNFTEvent = mintSensorNFTTxnEvents && mintSensorNFTTxnEvents.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Log: ", mintSensorNFTEvent?.args);

  const ERC6551Registry = await ethers.getContractFactory("ERC6551Registry");
  const erc6551Registry = await ERC6551Registry.deploy();

  await erc6551Registry.deployed();

  console.log(
    `ERC6551 Registry deployed to ${erc6551Registry.address}`
  );

  const ERC6551Account = await ethers.getContractFactory("ERC6551Account");
  const erc6551Account = await ERC6551Account.deploy();

  await erc6551Account.deployed();

  console.log(
    `ERC6551 Account deployed to ${erc6551Account.address}`
  );

  // CHECK OWNER OF A TOKEN
  const ownerOfTxn = await provisioningContract.ownerOf(0);
  console.log("Owner of token id: ", ownerOfTxn);


  // COMPUTE REGISTRY ACCOUNT
  const computeAccountTxn = await erc6551Registry.account(erc6551Account.address, CHAINID, ProvisioningContractAddress, 0, 0);
  console.log("Account Txn Computed: ", computeAccountTxn);

  // CREATE CONTRACT ACCOUNT FOR NFT
  const createAccountTxn = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, ProvisioningContractAddress, 0, 0, []);

  const createAccountTxnReceipt: ContractReceipt = await createAccountTxn.wait();
  // Get the transaction logs
  const createAccountTxnEvents = createAccountTxnReceipt.events;
  const createAccountEvent = createAccountTxnEvents && createAccountTxnEvents.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent) {
    returnedNFTAccountAddress = createAccountEvent.args![0];
    console.log("Returned NFT Account Address: ", returnedNFTAccountAddress);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  const NewERC6551Account = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account = NewERC6551Account.attach(returnedNFTAccountAddress);

  const amountToSend = ethers.utils.parseEther("1.0"); // Amount of native tokens to send (1.0 ETH in this example)

    // Get the signer (account) to send the transaction
    const signer = ethers.provider.getSigner();
    const transaction = await signer.sendTransaction({
        to: returnedNFTAccountAddress,
        value: amountToSend,
    });

    // Wait for the transaction to be mined
    const transactionReceipt = await transaction.wait();

    console.log("Transaction hash: ", transactionReceipt.transactionHash);

  const checkOwnerOfNFT = await newERC6551Account.owner()
  console.log("The owner of the NFT contract account is: ", checkOwnerOfNFT);


  const checkNFTToken = await newERC6551Account.token()
  console.log("The details of the NFT token is: ", checkNFTToken);


  // Claim a Sensor NFT
  const claimSensorNFTTxn = await provisioningContract.claimSensorNFT(pID, SensorProfileContractAddress, { value: AMOUNT_1000 });
  // const claimSensorNFTTxn = await provisioningContract.claimSensorNFT(pIDHash, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt: ContractReceipt = await claimSensorNFTTxn.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents = claimSensorNFTTxnReceipt.events;
  const claimSensorNFTEvent = claimSensorNFTTxnEvents && claimSensorNFTTxnEvents.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log: ", claimSensorNFTEvent?.args);

  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn = await provisioningContract.renewDevice(pIDHash, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt: ContractReceipt = await renewDeviceTxn.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents = renewDeviceTxnReceipt.events;
  const renewDeviceEvent = renewDeviceTxnEvents && renewDeviceTxnEvents.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log: ", renewDeviceEvent?.args);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn = await provisioningContract.isValid(TOKENID_1);
  console.log("Validity of token: ", isValidTxn);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
