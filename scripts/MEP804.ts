import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";
import { check } from "prettier";

async function main() {
  const RewardContractAddress = '0x75563ca7ce9fFF747a5880e8CAEb0111C2F910Ad';
  const LPWANContractAddress = '0x750d989cacf0C18E7bE17E224FC7fb2341353272';
  const ApplicationContractAddress = '0x9631ec0491a60d500a10d61e08ac17d00823Ff39';
  const SensorProfileContractAddress1 = '0xD21D048a2A5ede22BbD82fd94C29DA9dFE0fddDa';
  const SensorProfileContractAddress2 = '0x4B8E85Fad30ba08e11360F66666ed5979078070D';
  const NFTAccountAddress1 = '0xDE3640CF0656D47139d53EF626B0cF600Ed88D0C';
  const NFTAccountAddress2 = '0xCf74f23c73Ac1C8c86dD1C60a820669270CB2636';
  const NFTAccountAddress3 = '0x4b2AB36B12efd2faF7f430EfB349057c142206FA';
  const NFTAccountAddress4 = '0xC48c7C7B7c3055042934F67f30CE8496f23e6DC6';

  const [owner, otherAccount] = await ethers.getSigners();

  const RewardContract = await ethers.getContractFactory("RewardContract");
  const rewardContract = RewardContract.attach(RewardContractAddress);

  // GET BALANCE OF CONTRACT
  const balanceOfTxn = await rewardContract.balanceOf(RewardContractAddress);
  console.log("Balance Of Txn Log: ", balanceOfTxn);

  // GET BALANCE OF LPWAN CONTRACT
  const balanceOfLPWANTxn = await rewardContract.balanceOf(LPWANContractAddress);
  console.log("Balance Of Txn Log: ", balanceOfLPWANTxn);

  // // MINT MORE REWARD
  // const mintMoreRewardTokenTxn = await rewardContract.mintMoreRewardToken(ethers.utils.parseEther("2000"));
  // const mintMoreRewardTokenTxnReceipt: ContractReceipt = await mintMoreRewardTokenTxn.wait();

  // // Get the transaction logs
  // const mintMoreRewardTokenTxnEvents = mintMoreRewardTokenTxnReceipt.events;
  // const mintMoreRewardTokenEvent = mintMoreRewardTokenTxnEvents && mintMoreRewardTokenTxnEvents.find(
  //   (event) => event.event === "MoreRewardMinted"
  // );
  // console.log("Mint More Reward Token Log: ", mintMoreRewardTokenEvent?.args);

  // GET NEW BALANCE OF CONTRACT
  const balanceOfTxn2 = await rewardContract.balanceOf(RewardContractAddress);
  console.log("Balance Of Txn 2 Log: ", balanceOfTxn2);

  // SET ALLOCATION FOR TIER
  const _tiers_ = ['child', 'adult'];
  const _amounts_ = [600, 700];
  const setTokenAllocationForTierTxn = await rewardContract.setTokenAllocationForTier(_tiers_, _amounts_);
  const setTokenAllocationForTierTxnReceipt: ContractReceipt = await setTokenAllocationForTierTxn.wait();

  // Get the transaction logs
  const setTokenAllocationForTierTxnEvents = setTokenAllocationForTierTxnReceipt.events;
  const setTokenAllocationForTierEvent = setTokenAllocationForTierTxnEvents && setTokenAllocationForTierTxnEvents.find(
    (event) => event.event === "TokenAllocationForTierSet"
  );
  console.log("Set Allocation for tier Log: ", setTokenAllocationForTierEvent?.args);


  // GET POOL AMOUNT OF CYCLE
  const poolAmountOfThisCycleTxn = await rewardContract.poolAmountOfThisCycle();
  console.log("Balance Of pOOL AMOUNT Txn Log: ", poolAmountOfThisCycleTxn);

  // SET ALLOCATION FOR TIER
  const miningPower1 = 100;
  const tokenId1 = 0;
  const setHealthMiningPowerTxn1 = await rewardContract.setHealthMiningPower(NFTAccountAddress1, SensorProfileContractAddress1, miningPower1, tokenId1);
  const setHealthMiningPowerTxn1Receipt: ContractReceipt = await setHealthMiningPowerTxn1.wait();

  // Get the transaction logs
  const setHealthMiningPowerTxn1Events = setHealthMiningPowerTxn1Receipt.events;
  const setHealthMiningPowerEvent1 = setHealthMiningPowerTxn1Events && setHealthMiningPowerTxn1Events.find(
    (event) => event.event === "HealthMiningPowerSet"
  );
  console.log("Set Health and Mining Power Log: ", setHealthMiningPowerEvent1?.args);

  const miningPower2 = 120;
  const tokenId2 = 1;
  const setHealthMiningPowerTxn2 = await rewardContract.setHealthMiningPower(NFTAccountAddress2, SensorProfileContractAddress1, miningPower2, tokenId2);
  const setHealthMiningPowerTxn2Receipt: ContractReceipt = await setHealthMiningPowerTxn2.wait();

  // Get the transaction logs
  const setHealthMiningPowerTxn2Events = setHealthMiningPowerTxn2Receipt.events;
  const setHealthMiningPowerEvent2 = setHealthMiningPowerTxn2Events && setHealthMiningPowerTxn2Events.find(
    (event) => event.event === "HealthMiningPowerSet"
  );
  console.log("Set Health and Mining Power Log: ", setHealthMiningPowerEvent2?.args);

  const miningPower3 = 180;
  const tokenId3 = 2;
  const setHealthMiningPowerTxn3 = await rewardContract.setHealthMiningPower(NFTAccountAddress3, SensorProfileContractAddress2, miningPower3, tokenId3);
  const setHealthMiningPowerTxn3Receipt: ContractReceipt = await setHealthMiningPowerTxn3.wait();

  // Get the transaction logs
  const setHealthMiningPowerTxn3Events = setHealthMiningPowerTxn3Receipt.events;
  const setHealthMiningPowerEvent3 = setHealthMiningPowerTxn3Events && setHealthMiningPowerTxn3Events.find(
    (event) => event.event === "HealthMiningPowerSet"
  );
  console.log("Set Health and Mining Power Log: ", setHealthMiningPowerEvent3?.args);

  const miningPower4 = 150;
  const tokenId4 = 3;
  const setHealthMiningPowerTxn4 = await rewardContract.setHealthMiningPower(NFTAccountAddress4, SensorProfileContractAddress2, miningPower4, tokenId4);
  const setHealthMiningPowerTxn4Receipt: ContractReceipt = await setHealthMiningPowerTxn4.wait();

  // Get the transaction logs
  const setHealthMiningPowerTxn4Events = setHealthMiningPowerTxn4Receipt.events;
  const setHealthMiningPowerEvent4 = setHealthMiningPowerTxn4Events && setHealthMiningPowerTxn4Events.find(
    (event) => event.event === "HealthMiningPowerSet"
  );
  console.log("Set Health and Mining Power Log: ", setHealthMiningPowerEvent4?.args);


  // SUBMIT REWARD
  const submitRewardTxn1 = await rewardContract.submitReward(ApplicationContractAddress, SensorProfileContractAddress1, NFTAccountAddress1);
  const submitRewardTxn1Receipt: ContractReceipt = await submitRewardTxn1.wait();

  // Get the transaction logs
  const submitRewardTxn1Events = submitRewardTxn1Receipt.events;
  const submitRewardEvent1 = submitRewardTxn1Events && submitRewardTxn1Events.find(
    (event) => event.event === "RewardSubmitted"
  );
  console.log("Submit Reward Log: ", submitRewardEvent1?.args);


  const submitRewardTxn2 = await rewardContract.submitReward(ApplicationContractAddress, SensorProfileContractAddress1, NFTAccountAddress2);
  const submitRewardTxn2Receipt: ContractReceipt = await submitRewardTxn2.wait();

  // Get the transaction logs
  const submitRewardTxn2Events = submitRewardTxn2Receipt.events;
  const submitRewardEvent2 = submitRewardTxn2Events && submitRewardTxn2Events.find(
    (event) => event.event === "RewardSubmitted"
  );
  console.log("Submit Reward Log: ", submitRewardEvent2?.args);

  const submitRewardTxn3 = await rewardContract.submitReward(ApplicationContractAddress, SensorProfileContractAddress2, NFTAccountAddress3);
  const submitRewardTxn3Receipt: ContractReceipt = await submitRewardTxn3.wait();

  // Get the transaction logs
  const submitRewardTxn3Events = submitRewardTxn3Receipt.events;
  const submitRewardEvent3 = submitRewardTxn3Events && submitRewardTxn3Events.find(
    (event) => event.event === "RewardSubmitted"
  );
  console.log("Submit Reward Log: ", submitRewardEvent3?.args);

  const submitRewardTxn4 = await rewardContract.submitReward(ApplicationContractAddress, SensorProfileContractAddress2, NFTAccountAddress4);
  const submitRewardTxn4Receipt: ContractReceipt = await submitRewardTxn4.wait();

  // Get the transaction logs
  const submitRewardTxn4Events = submitRewardTxn4Receipt.events;
  const submitRewardEvent4 = submitRewardTxn4Events && submitRewardTxn4Events.find(
    (event) => event.event === "RewardSubmitted"
  );
  console.log("Submit Reward Log: ", submitRewardEvent4?.args);

  // GET TOTAL MINING POWER LOG
  const totalMiningPower = await rewardContract.totalMiningPower();
  console.log("Total Mining Power Log: ", totalMiningPower);


  // GET REWARD LOG 1
  const rewardNFT1 = await rewardContract.reward(NFTAccountAddress1);
  console.log("reward NFT1 Log: ", rewardNFT1);

  // GET REWARD LOG 2
  const rewardNFT2 = await rewardContract.reward(NFTAccountAddress2);
  console.log("reward NFT 2 Log: ", rewardNFT2);

  // GET REWARD LOG 3
  const rewardNFT3 = await rewardContract.reward(NFTAccountAddress3);
  console.log("reward NFT 2 Log: ", rewardNFT3);

  // GET REWARD LOG 4
  const rewardNFT4 = await rewardContract.reward(NFTAccountAddress4);
  console.log("reward NFT 4 Log: ", rewardNFT4);


  // GET REWARD BALANCE OF NFT CONTRACT 1
  const balanceOfNFTTxn1 = await rewardContract.balanceOf(NFTAccountAddress1);
  console.log("Balance Of NFT Contract 1 Log: ", balanceOfNFTTxn1);


  // GET REWARD BALANCE OF NFT CONTRACT 2
  const balanceOfNFTTxn2 = await rewardContract.balanceOf(NFTAccountAddress2);
  console.log("Balance Of NFT Contract 2 Log: ", balanceOfNFTTxn2);


  // GET REWARD BALANCE OF NFT CONTRACT 3
  const balanceOfNFTTxn3 = await rewardContract.balanceOf(NFTAccountAddress3);
  console.log("Balance Of NFT Contract 3 Log: ", balanceOfNFTTxn3);


  // GET REWARD BALANCE OF NFT CONTRACT 4
  const balanceOfNFTTxn4 = await rewardContract.balanceOf(NFTAccountAddress4);
  console.log("Balance Of NFT Contract 4 Log: ", balanceOfNFTTxn4);

  // CLAIM REWARD 1
  const claimRewardTxn1 = await rewardContract.claimReward(ApplicationContractAddress, NFTAccountAddress1);
  const claimRewardTxn1Receipt: ContractReceipt = await claimRewardTxn1.wait();

  // Get the transaction logs
  const claimRewardTxn1Events = claimRewardTxn1Receipt.events;
  const claimRewardEvent1 = claimRewardTxn1Events && claimRewardTxn1Events.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward Log: ", claimRewardEvent1?.args);

  // CLAIM REWARD 2
  const claimRewardTxn2 = await rewardContract.claimReward(ApplicationContractAddress, NFTAccountAddress2);
  const claimRewardTxnReceipt2: ContractReceipt = await claimRewardTxn2.wait();

  // Get the transaction logs
  const claimRewardTxnEvents2 = claimRewardTxnReceipt2.events;
  const claimRewardEvent2 = claimRewardTxnEvents2 && claimRewardTxnEvents2.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 2 Log: ", claimRewardEvent2?.args);

  // CLAIM REWARD 3
  const claimRewardTxn3 = await rewardContract.claimReward(ApplicationContractAddress, NFTAccountAddress3);
  const claimRewardTxnReceipt3: ContractReceipt = await claimRewardTxn3.wait();

  // Get the transaction logs
  const claimRewardTxnEvents3 = claimRewardTxnReceipt3.events;
  const claimRewardEvent3 = claimRewardTxnEvents3 && claimRewardTxnEvents3.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 3 Log: ", claimRewardEvent3?.args);

  // CLAIM REWARD 4
  const claimRewardTxn4 = await rewardContract.claimReward(ApplicationContractAddress, NFTAccountAddress4);
  const claimRewardTxnReceipt4: ContractReceipt = await claimRewardTxn4.wait();

  // Get the transaction logs
  const claimRewardTxnEvents4 = claimRewardTxnReceipt4.events;
  const claimRewardEvent4 = claimRewardTxnEvents4 && claimRewardTxnEvents4.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 4 Log: ", claimRewardEvent4?.args);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 1
  const newBalanceOfNFTTxn1 = await rewardContract.balanceOf(NFTAccountAddress1);
  console.log("New Balance Of NFT Contract 1 Log: ", newBalanceOfNFTTxn1);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 2
  const newBalanceOfNFTTxn2 = await rewardContract.balanceOf(NFTAccountAddress2);
  console.log("New Balance Of NFT Contract 12 Log: ", newBalanceOfNFTTxn2);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 3
  const newBalanceOfNFTTxn3 = await rewardContract.balanceOf(NFTAccountAddress3);
  console.log("New Balance Of NFT Contract 3 Log: ", newBalanceOfNFTTxn3);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 4
  const newBalanceOfNFTTxn4 = await rewardContract.balanceOf(NFTAccountAddress4);
  console.log("New Balance Of NFT Contract 4 Log: ", newBalanceOfNFTTxn4);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
