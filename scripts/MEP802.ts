import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";
import { check } from "prettier";


// MEP801: https://wannsee-explorer.mxc.com/address/0x68214FdEf3cb834457A29C74978639fa7da68864
// lpwan: https://wannsee-explorer.mxc.com/address/0xD6d0949355030aF3b237f0DE0a2283166DeA7653
// MEP802: https://wannsee-explorer.mxc.com/address/0xc2C4181211f0554c893672701DB063791040d8Fb
// MEP803: https://wannsee-explorer.mxc.com/address/0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f

async function main() {
  const ProvisioningContractAddress = '0xc2C4181211f0554c893672701DB063791040d8Fb';
  const ApplicationContractAddress = '0x68214FdEf3cb834457A29C74978639fa7da68864';
  const SensorProfileContractAddress = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';
  const SensorProfileContractAddress2 = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';

  const [owner, otherAccount] = await ethers.getSigners();

  const EMAIL = 'aabiodunawoyemi@gmail.com';
  const PID_AMOUNT = 7;
  const TOKENID_1 = 0;
  const TOKENID_2 = 1;
  // const pID = ethers.utils.formatBytes32String('TESTPIDOOOOOOOOOOOOOOOOO');
  const pID1 = 'TESTPIDOOOOOOOOOOOOOOOOO';
  const pID2 = 'TESTPID11111111111111111';
  const pIDHash1 = '0x47773d91e4913a3a9fa9b096553bc866e1cfaf7c89980b4c9f6de80446daf604'
  const pIDHash2 = '0x47bc69b4685cacbd5f8733224b0e5724a1a098eeaa5b5d2acf81705ac6a4de51'

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

  // MINT SENSOR NFT 1
  const mintSensorNFTTxn = await provisioningContract.mintSensorNFT(pIDHash1, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt: ContractReceipt = await mintSensorNFTTxn.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents = mintSensorNFTTxnReceipt.events;
  const mintSensorNFTEvent = mintSensorNFTTxnEvents && mintSensorNFTTxnEvents.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Log: ", mintSensorNFTEvent?.args);

  // MINT SENSOR NFT 2
  const mintSensorNFTTxn2 = await provisioningContract.mintSensorNFT(pIDHash2, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt2: ContractReceipt = await mintSensorNFTTxn2.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents2 = mintSensorNFTTxnReceipt2.events;
  const mintSensorNFTEvent2 = mintSensorNFTTxnEvents2 && mintSensorNFTTxnEvents2.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Two Log: ", mintSensorNFTEvent2?.args);

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

  // CHECK OWNER OF A TOKEN
  const ownerOfTxn2 = await provisioningContract.ownerOf(1);
  console.log("Owner of token id 1: ", ownerOfTxn2);


  // COMPUTE REGISTRY ACCOUNT
  const computeAccountTxn = await erc6551Registry.account(erc6551Account.address, CHAINID, ProvisioningContractAddress, 0, 0);
  console.log("Account Txn Computed: ", computeAccountTxn);

  // COMPUTE REGISTRY ACCOUNT 2
  const computeAccountTxn2 = await erc6551Registry.account(erc6551Account.address, CHAINID, ProvisioningContractAddress, 1, 0);
  console.log("Account Txn Computed 2: ", computeAccountTxn2);

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

  console.log('Verify NFT Contract 1.....');
  await run("verify:verify", {
    address: returnedNFTAccountAddress,
    constructorArguments: [
      erc6551Account.address,
      CHAINID,
      ProvisioningContractAddress,
      0,
      0,
      []
    ]
  })


  // CREATE CONTRACT ACCOUNT FOR NFT
  const createAccountTxn2 = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, ProvisioningContractAddress, 0, 0, []);

  const createAccountTxnReceipt2: ContractReceipt = await createAccountTxn2.wait();
  // Get the transaction logs
  const createAccountTxnEvents2 = createAccountTxnReceipt2.events;
  const createAccountEvent2 = createAccountTxnEvents2 && createAccountTxnEvents2.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress2: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent2) {
    returnedNFTAccountAddress2 = createAccountEvent2.args![0];
    console.log("Returned NFT Account Address 2: ", returnedNFTAccountAddress2);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  console.log('Verify NFT Contract 2.....');
  await run("verify:verify", {
    address: returnedNFTAccountAddress2,
    constructorArguments: [
      erc6551Account.address,
      CHAINID,
      ProvisioningContractAddress,
      1,
      0,
      []
    ]
  })


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





  const NewERC6551Account2 = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account2 = NewERC6551Account.attach(returnedNFTAccountAddress2);

  const amountToSend2 = ethers.utils.parseEther("1.0"); // Amount of native tokens to send (1.0 ETH in this example)


  const transaction2 = await signer.sendTransaction({
    to: returnedNFTAccountAddress2,
    value: amountToSend,
  });

  // Wait for the transaction to be mined
  const transactionReceipt2 = await transaction2.wait();

  console.log("Transaction hash: ", transactionReceipt2.transactionHash);

  const checkOwnerOfNFT2 = await newERC6551Account2.owner()
  console.log("The owner of the NFT contract account is: ", checkOwnerOfNFT2);


  const checkNFTToken2 = await newERC6551Account2.token()
  console.log("The details of the NFT token 2 is: ", checkNFTToken2);



  // Claim a Sensor NFT
  const claimSensorNFTTxn = await provisioningContract.claimSensorNFT(pID1, SensorProfileContractAddress, { value: AMOUNT_1000 });
  // const claimSensorNFTTxn = await provisioningContract.claimSensorNFT(pIDHash, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt: ContractReceipt = await claimSensorNFTTxn.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents = claimSensorNFTTxnReceipt.events;
  const claimSensorNFTEvent = claimSensorNFTTxnEvents && claimSensorNFTTxnEvents.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log: ", claimSensorNFTEvent?.args);


  // Claim a Sensor NFT 2
  const claimSensorNFTTxn2 = await provisioningContract.claimSensorNFT(pID2, SensorProfileContractAddress2, { value: AMOUNT_1000 });
  // const claimSensorNFTTxn = await provisioningContract.claimSensorNFT(pIDHash, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt2: ContractReceipt = await claimSensorNFTTxn2.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents2 = claimSensorNFTTxnReceipt2.events;
  const claimSensorNFTEvent2 = claimSensorNFTTxnEvents2 && claimSensorNFTTxnEvents2.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 2: ", claimSensorNFTEvent2?.args);


  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn = await provisioningContract.renewDevice(pIDHash1, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt: ContractReceipt = await renewDeviceTxn.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents = renewDeviceTxnReceipt.events;
  const renewDeviceEvent = renewDeviceTxnEvents && renewDeviceTxnEvents.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log: ", renewDeviceEvent?.args);


  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn2 = await provisioningContract.renewDevice(pIDHash1, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt2: ContractReceipt = await renewDeviceTxn2.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents2 = renewDeviceTxnReceipt2.events;
  const renewDeviceEvent2 = renewDeviceTxnEvents2 && renewDeviceTxnEvents2.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log 2: ", renewDeviceEvent2?.args);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn = await provisioningContract.isValid(TOKENID_1);
  console.log("Validity of token: ", isValidTxn);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn2 = await provisioningContract.isValid(TOKENID_2);
  console.log("Validity of token: ", isValidTxn2);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
