# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy_MEP1002Token.ts
```


## Interaction Step with MEP801 - MEP804

- DEPLOY MEP801
    - Deploy MEP801 ```npx hardhat run deploy/MEP801/deployMEP801.ts --network mxc_testnet```

- DEPLOY MEP803: to deploy MEP803, you need to add the application address from deploying MEP801 into this script
    - Default Tier ```npx hardhat run deploy/MEP803/defaultTier.ts --network mxc_testnet```
    - Child Tier ```npx hardhat run deploy/MEP803/childTier.ts --network mxc_testnet```
    - Adult Tier ```npx hardhat run deploy/MEP803/adultTier.ts --network mxc_testnet```

- DEPLOY LPWAN contract to deploy MEP802 and MEP804
    - Deploy LPWAN ```npx hardhat run deploy/LPWAN/lpwanMock.ts --network mxc_testnet```
    - Deploy MEP802 uisng LPWAN: add/update the application address from deploying MEP801 into this script ```npx hardhat run deploy/LPWAN/lpwanMockDeployMEP802.ts --network mxc_testnet```

- Run interaction script for MEP802: add/update the required contract addresses
    - Interact with MEP802: produce pID and mint NFT ```npx hardhat run scripts/MEP802/01_MEP802MintNFT.ts --network mxc_testnet```

- Deploy MEP804 uisng LPWAN: add/update the required contract addresses ```npx hardhat run deploy/LPWAN/lpwanMockDeployMEP804.ts --network mxc_testnet```

- Run interaction script for MEP802: add/update the required contract addresses
    - Interact with MEP802: claim NFT ```npx hardhat run scripts/MEP802/02_MEP802ClaimNFT.ts --network mxc_testnet```
    - Interact with MEP802: renew NFT ```npx hardhat run scripts/MEP802/03_MEP802RenewNFT.ts --network mxc_testnet```

- Run interaction script for MEP804: add/update the required contract addresses
    - Interact with MEP804 ```npx hardhat run scripts/MEP804.ts --network mxc_testnet```


## Interaction Step with MEP600
- Deploy mep600 and interact with it. The mock marketplace is already available ```npx hardhat run deploy/MEP600.ts --network mxc_testnet```

MEP600 flow:
 - The user scan the nfc tag.
 - The user mints the nft by providing the nfc tag. Here the nfc tag is identified by the nft on the blockchain. We have [tokenId(nft) -> nfc tag]

 The NFC tag should be based on NTAG 424 DNA (NT4H2421Gx) from NXP - from the docs.

After scanning the hardware, the data scanned is the tag, so that is what will be converted to a byte and saved on the blockchain while provisioning.

So, to get the NFC that correspond to nft, you scan the device again, convert the tag to a byte and call a function on the blockchain, with the bytes, and the token id of the nft would be returned to you. Token Id is unique to nft.


## Interaction Step with KMX Implementation
- Deploy kms implementation ```npx hardhat run deploy/kmx.ts --network mxc_testnet```

