import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";
import { check } from "prettier";

async function main() {
  const RewardContractAddress = '0xc2C4181211f0554c893672701DB063791040d8Fb';
  const ApplicationContractAddress = '0x68214FdEf3cb834457A29C74978639fa7da68864';
  const SensorProfileContractAddress = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';
  const SensorProfileContractAddress2 = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';
  const NFTContractAddress1 = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';
  const NFTContractAddress2 = '0xF0ea6262FB7353E1d1D159C251D917C0fa88cA3f';

  const [owner, otherAccount] = await ethers.getSigners();


  const RewardContract = await ethers.getContractFactory("RewardContract");
  const rewardContract = RewardContract.attach(RewardContractAddress);

  // GET BALANCE OF CONTRACT
  const balanceOfTxn = await rewardContract.balanceOf(RewardContractAddress);
  console.log("Balance Of Txn Log: ", balanceOfTxn);

  // MINT MORE REWARD
  const mintMoreRewardTxn = await rewardContract.mintMoreReward(ethers.utils.parseEther("2000"));
  const mintMoreRewardTxnReceipt: ContractReceipt = await mintMoreRewardTxn.wait();

  // Get the transaction logs
  const mintMoreRewardTxnEvents = mintMoreRewardTxnReceipt.events;
  const mintMoreRewardEvent = mintMoreRewardTxnEvents && mintMoreRewardTxnEvents.find(
    (event) => event.event === "MoreRewardMinted"
  );
  console.log("Mint More Reward Log: ", mintMoreRewardEvent?.args);


  // GET NEW BALANCE OF CONTRACT
  const balanceOfTxn2 = await rewardContract.balanceOf(RewardContractAddress);
  console.log("Balance Of Txn 2 Log: ", balanceOfTxn2);


  // SET MINING POWER
  const setMiningPowerTxn = await rewardContract.setMiningPower([SensorProfileContractAddress, SensorProfileContractAddress2],[300,650]);
  const setMiningPowerTxnReceipt: ContractReceipt = await setMiningPowerTxn.wait();

  // Get the transaction logs
  const setMiningPowerTxnEvents = setMiningPowerTxnReceipt.events;
  const setMiningPowerEvent = setMiningPowerTxnEvents && setMiningPowerTxnEvents.find(
    (event) => event.event === "MiningPower"
  );
  console.log("Mint More Reward Log: ", setMiningPowerEvent?.args);


  // GET TOTAL MINING POWER LOG
  const totalMiningPower = await rewardContract.calculateTotalMiningPower();
  console.log("Total Mining Power Log: ", totalMiningPower);


  // SUBMIT REWARD 1
  const submitRewardTxn = await rewardContract.submitReward(ApplicationContractAddress, NFTContractAddress1);
  const submitRewardTxnReceipt: ContractReceipt = await submitRewardTxn.wait();

  // Get the transaction logs
  const submitRewardTxnEvents = submitRewardTxnReceipt.events;
  const submitRewardEvent = submitRewardTxnEvents && submitRewardTxnEvents.find(
    (event) => event.event === "RewardSubmitted"
  );
  console.log("SUBMIT Reward Log: ", submitRewardEvent?.args);



  // SUBMIT REWARD 2
  const submitRewardTxn2 = await rewardContract.submitReward(ApplicationContractAddress, NFTContractAddress2);
  const submitRewardTxnReceipt2: ContractReceipt = await submitRewardTxn2.wait();

  // Get the transaction logs
  const submitRewardTxnEvents2 = submitRewardTxnReceipt2.events;
  const submitRewardEvent2 = submitRewardTxnEvents2 && submitRewardTxnEvents2.find(
    (event) => event.event === "RewardSubmitted"
  );
  console.log("SUBMIT Reward 2 Log: ", submitRewardEvent2?.args);






  // GET REWARD LOG 1
  const rewardNFT1 = await rewardContract.reward(NFTContractAddress1);
  console.log("reward NFT1 Log: ", rewardNFT1);




  // GET REWARD LOG 2
  const rewardNFT2 = await rewardContract.reward(NFTContractAddress2);
  console.log("reward NFT 2 Log: ", rewardNFT2);




  // GET REWARD BALANCE OF NFT CONTRACT 1
  const balanceOfNFTTxn1 = await rewardContract.balanceOf(NFTContractAddress1);
  console.log("Balance Of NFT Contract 1 Log: ", balanceOfNFTTxn1);


  // GET REWARD BALANCE OF NFT CONTRACT 2
  const balanceOfNFTTxn2 = await rewardContract.balanceOf(NFTContractAddress2);
  console.log("Balance Of NFT Contract 2 Log: ", balanceOfNFTTxn2);






  // CLAIM REWARD 1
  const claimRewardTxn = await rewardContract.claimReward(ApplicationContractAddress, NFTContractAddress1);
  const claimRewardTxnReceipt: ContractReceipt = await claimRewardTxn.wait();

  // Get the transaction logs
  const claimRewardTxnEvents = claimRewardTxnReceipt.events;
  const claimRewardEvent = claimRewardTxnEvents && claimRewardTxnEvents.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward Log: ", claimRewardEvent?.args);



  // CLAIM REWARD 2
  const claimRewardTxn2 = await rewardContract.claimReward(ApplicationContractAddress, NFTContractAddress2);
  const claimRewardTxnReceipt2: ContractReceipt = await claimRewardTxn2.wait();

  // Get the transaction logs
  const claimRewardTxnEvents2 = claimRewardTxnReceipt2.events;
  const claimRewardEvent2 = claimRewardTxnEvents2 && claimRewardTxnEvents2.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 2 Log: ", claimRewardEvent2?.args);



  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 1
  const balanceOfNFTTxn11 = await rewardContract.balanceOf(NFTContractAddress1);
  console.log("Balance Of NFT Contract 11 Log: ", balanceOfNFTTxn11);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 2
  const balanceOfNFTTxn12 = await rewardContract.balanceOf(NFTContractAddress2);
  console.log("Balance Of NFT Contract 12 Log: ", balanceOfNFTTxn12);



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
