import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { BigNumber, constants } from "ethers";
import {
    MEP1002Token,
    MEP1004Token,
    MEP1004TokenMock,
    MEP1004TokenMock__factory,
    NameWrapperMock,
    NameWrapperMock__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getAddress } from "@ethersproject/address";

function bn(x: number): BigNumber {
    return BigNumber.from(x);
}

const ADDRESS_ZERO = constants.AddressZero;

// test.mxc name wrapper tokenid

const setupTest = deployments.createFixture(
    async ({ deployments, getNamedAccounts, ethers }, options) => {
        await deployments.fixture(); // ensure you start from a fresh deployments
        const { deployer } = await getNamedAccounts();
        const MEP1004Token = await ethers.getContract<MEP1004Token>(
            "MEP1004Token"
        );
        const NameWrapperMockFactory =
            await ethers.getContractFactory<NameWrapperMock__factory>(
                "NameWrapperMock"
            );
        const NameWrapperMock = await NameWrapperMockFactory.deploy();
        await MEP1004Token.setMNSToken(NameWrapperMock.address);
        const MEP1002Token = await ethers.getContract<MEP1002Token>(
            "MEP1002Token"
        );
        await MEP1004Token.setMEP1002Addr(MEP1002Token.address);
        return {
            MEP1002Token,
            MEP1004Token,
            NameWrapperMock,
        };
    }
);

describe("MEP1004Token", function () {
    let MEP1004Token: MEP1004Token;
    let NameWrapperMock: NameWrapperMock;
    let MEP1004TokenMock: MEP1004TokenMock;
    let MEP1004TokenMockFactory: MEP1004TokenMock__factory;
    let MEP1002Token: MEP1002Token;
    let owner: SignerWithAddress;
    let tokenOwner: SignerWithAddress;
    let addrs: SignerWithAddress[];
    beforeEach(async function () {
        [owner, tokenOwner, ...addrs] = await ethers.getSigners();
        ({ MEP1004Token, NameWrapperMock, MEP1002Token } = await setupTest());
        MEP1004TokenMockFactory =
            await ethers.getContractFactory<MEP1004TokenMock__factory>(
                "MEP1004TokenMock"
            );
    });

    const testDotMXCTokenId = BigNumber.from(
        "68949889097187516169332801510365581835791041465326974816460712402969489861206"
    );

    const testSNCode = "NEO-1235421";
    const testSNCodeTokenId = BigNumber.from(
        `${ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testSNCode))}`
    );
    const testMEP1002TokenId = BigNumber.from("611831265154301951");
    describe("Init", async function () {
        it("cannot init again", async function () {
            await expect(
                MEP1004Token.initialize(
                    "MEP1004Token",
                    "MEP1004",
                    owner.address
                )
            ).to.be.revertedWith(
                "Initializable: contract is already initialized"
            );
        });
    });

    describe("Minting", async function () {
        it("should allow admin to mint", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
        });

        it("should not allow non-admin account to mint tokens", async () => {
            await expect(
                MEP1004Token.connect(addrs[1]).mint(
                    addrs[1].address,
                    testSNCode
                )
            ).to.be.revertedWith("Controllable: Caller is not a controller");
        });

        it("cannot mint by invalid sncode", async function () {
            await expect(MEP1004Token.mint(owner.address, "test")).to.be
                .reverted;
        });

        it("cannot mint already minted token", async function () {
            await MEP1004Token.mint(owner.address, testSNCode);
            await expect(
                MEP1004Token.mint(owner.address, testSNCode)
            ).to.be.revertedWithCustomError(
                MEP1004Token,
                "ERC721TokenAlreadyMinted"
            );
            await expect(await MEP1004Token.balanceOf(owner.address)).to.equal(
                1
            );
        });

        it("should return balance", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(await MEP1004Token.balanceOf(owner.address)).to.equal(
                1
            );
        });

        it("should mint token event", async function () {
            await expect(MEP1004Token.mint(owner.address, testSNCode))
                .to.emit(MEP1004Token, "Transfer")
                .withArgs(
                    "0x0000000000000000000000000000000000000000",
                    owner.address,
                    testSNCodeTokenId
                );
        });

        it("should set name event", async function () {
            await MEP1004Token.mint(owner.address, testSNCode);
            await expect(
                MEP1004Token.setName(testSNCodeTokenId, testDotMXCTokenId)
            )
                .to.emit(MEP1004Token, "MEP1004TokenUpdateName")
                .withArgs(testSNCodeTokenId, "test.mxc");

            await expect(MEP1004Token.resetName(testSNCodeTokenId))
                .to.emit(MEP1004Token, "MEP1004TokenUpdateName")
                .withArgs(testSNCodeTokenId, "");
        });

        it("should setting name", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("");
            await expect(
                await MEP1004Token.setName(testSNCodeTokenId, testDotMXCTokenId)
            ).to.ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("test.mxc");
        });

        it("should reset name", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("");
            await expect(
                await MEP1004Token.setName(testSNCodeTokenId, testDotMXCTokenId)
            ).to.ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("test.mxc");
            await expect(await MEP1004Token.resetName(testSNCodeTokenId)).to.ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("");
        });

        it("should get uri", async function () {
            await MEP1004Token.setBaseURI("https://wannsee-test.mxc.com/");
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(
                await MEP1004Token.tokenURI(testSNCodeTokenId)
            ).to.equal(
                `https://wannsee-test.mxc.com/${testSNCodeTokenId.toString()}?name=`
            );
        });

        it("should return supply", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(await MEP1004Token.totalSupply()).to.equal(1);
        });
    });

    describe("MEP1002Slots", async function () {
        it("should allow owner to insert the MEP1004 token to the specified slot of the MEP1002 token", async function () {
            await MEP1004Token.mint(owner.address, testSNCode);
            await MEP1002Token.mint(testMEP1002TokenId);
            await expect(
                MEP1004Token.insertToMEP1002Slot(
                    testSNCodeTokenId,
                    testMEP1002TokenId,
                    123
                )
            ).to.be.revertedWithCustomError(MEP1004Token, "ExceedSlotLimit");
            await expect(
                MEP1004Token.insertToMEP1002Slot(
                    testSNCodeTokenId,
                    testMEP1002TokenId,
                    0
                )
            ).to.emit(MEP1004Token, "InsertToMEP1002Slot");
        });

        it("should allow owner to remove the MEP1004 token from the specified slot of the MEP1002 token ", async function () {
            await MEP1004Token.mint(owner.address, testSNCode);
            await MEP1002Token.mint(testMEP1002TokenId);

            await MEP1004Token.insertToMEP1002Slot(
                testSNCodeTokenId,
                testMEP1002TokenId,
                0
            );
            await expect(
                await MEP1004Token.setExitFee(ethers.utils.parseEther("50"))
            ).to.ok;
            await expect(
                MEP1004Token.removeFromMEP1002Slot(
                    testSNCodeTokenId,
                    testMEP1002TokenId,
                    0,
                    {
                        value: ethers.utils.parseEther("50"),
                    }
                )
            ).to.emit(MEP1004Token, "RemoveFromMEP1002Slot");
        });

        it("should return correct where slot", async function () {
            await MEP1004Token.mint(owner.address, testSNCode);
            await MEP1002Token.mint(testMEP1002TokenId);

            await MEP1004Token.insertToMEP1002Slot(
                testSNCodeTokenId,
                testMEP1002TokenId,
                1
            );
            await expect(
                await MEP1004Token.whereSlot(testSNCodeTokenId)
            ).to.deep.equals([testMEP1002TokenId, 1, 1]);
        });

        it("should allow owner to set the exit fee", async function () {
            await expect(
                await MEP1004Token.setExitFee(ethers.utils.parseEther("50"))
            ).to.ok;
        });

        it("should return correct exit fee", async function () {
            await expect(
                await MEP1004Token.setExitFee(ethers.utils.parseEther("50"))
            ).to.ok;
            await expect(await MEP1004Token.getExitFee()).to.be.equal(
                ethers.utils.parseEther("50")
            );
        });

        it("should allow owner to withdraw the exit fee", async function () {
            await MEP1002Token.mint(testMEP1002TokenId);

            await expect(
                await MEP1004Token.setExitFee(ethers.utils.parseEther("50"))
            ).to.ok;
            await MEP1004Token.mint(owner.address, testSNCode);
            await MEP1004Token.insertToMEP1002Slot(
                testSNCodeTokenId,
                testMEP1002TokenId,
                0
            );
            await expect(
                MEP1004Token.removeFromMEP1002Slot(
                    testSNCodeTokenId,
                    testMEP1002TokenId,
                    0,
                    {
                        value: ethers.utils.parseEther("50"),
                    }
                )
            ).to.emit(MEP1004Token, "RemoveFromMEP1002Slot");
            await expect(await MEP1004Token.getBalance()).to.be.equal(
                ethers.utils.parseEther("50")
            );
            await expect(MEP1004Token.withdrawal()).to.be.ok;
            await expect(await MEP1004Token.getBalance()).to.be.equal(0);
        });

        it("should not allow non-owner to withdraw the exit fee", async function () {
            await expect(MEP1004Token.connect(addrs[1]).withdrawal()).to.be
                .reverted;
        });

        it("should allow controller remove slot without pay", async function () {
            await MEP1002Token.mint(testMEP1002TokenId);

            await expect(
                await MEP1004Token.setExitFee(ethers.utils.parseEther("50"))
            ).to.ok;
            await MEP1004Token.mint(owner.address, testSNCode);

            await MEP1004Token.insertToMEP1002Slot(
                testSNCodeTokenId,
                testMEP1002TokenId,
                0
            );

            await expect(
                MEP1004Token.removeFromMEP1002SlotAdmin(
                    testSNCodeTokenId,
                    testMEP1002TokenId,
                    0
                )
            ).to.emit(MEP1004Token, "RemoveFromMEP1002Slot");

            await expect(
                await MEP1004Token.getStatus(testSNCodeTokenId)
            ).to.equals(1);

            await expect(
                MEP1004Token.insertToMEP1002Slot(
                    testSNCodeTokenId,
                    testMEP1002TokenId,
                    0
                )
            ).to.be.reverted;

            await expect(
                MEP1004Token.payExitFee(testSNCodeTokenId, {
                    value: ethers.utils.parseEther("50"),
                })
            ).to.be.ok;

            await expect(
                await MEP1004Token.getStatus(testSNCodeTokenId)
            ).to.equals(0);
        });
    });

    describe("LocationProofs", async function () {
        it("should allow owner to set the location proof", async function () {
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.mint(owner.address, testSNCode);
            await MEP1004Token.mint(addrs[1].address, "M2X-testcode1");
            const testCodeTokenId1 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("M2X-testcode1")
                )
            );
            await MEP1004Token.mint(addrs[1].address, "NEO-testcode2");
            const testCodeTokenId2 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("NEO-testcode2")
                )
            );
            const now = Math.floor(Date.now() / 1000) + 100;
            await ethers.provider.send("evm_setNextBlockTimestamp", [now]);
            const tx = await MEP1004Token.LocationProofs(
                testMEP1002TokenId,
                [testSNCodeTokenId, testCodeTokenId1, testCodeTokenId2],
                "test item"
            );
            await expect(tx).to.ok;
            const receipt = await tx.wait();
            const event = receipt.events?.at(0);
            await expect(event?.event).to.equals("NewLocationProof");
        });
        it("should return latest Location Proof", async function () {
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.mint(owner.address, testSNCode);
            await MEP1004Token.mint(addrs[1].address, "M2X-testcode1");
            const testCodeTokenId1 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("M2X-testcode1")
                )
            );
            await MEP1004Token.mint(addrs[1].address, "NEO-testcode2");
            const testCodeTokenId2 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("NEO-testcode2")
                )
            );
            const now = Math.floor(Date.now() / 1000) + 100;
            await ethers.provider.send("evm_setNextBlockTimestamp", [now]);
            const tx = await MEP1004Token.LocationProofs(
                testMEP1002TokenId,
                [testSNCodeTokenId, testCodeTokenId1, testCodeTokenId2],
                "test item"
            );
            await expect(tx).to.ok;

            await expect(
                await MEP1004Token.latestLocationProofs("test item")
            ).to.deep.equals([
                testMEP1002TokenId,
                [testSNCodeTokenId, testCodeTokenId1, testCodeTokenId2],
                "test item",
                now,
            ]);
        });

        it("should return correct proofs", async function () {
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.mint(owner.address, testSNCode);
            await MEP1004Token.mint(addrs[1].address, "M2X-testcode1");
            const testCodeTokenId1 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("M2X-testcode1")
                )
            );
            await MEP1004Token.mint(addrs[1].address, "NEO-testcode2");
            const testCodeTokenId2 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("NEO-testcode2")
                )
            );
            const now = Math.floor(Date.now() / 1000) + 100;
            await ethers.provider.send("evm_setNextBlockTimestamp", [now]);

            const promises = [];
            for (let i = 0; i < 15; i++) {
                promises.push(
                    MEP1004Token.LocationProofs(
                        testMEP1002TokenId,
                        [testSNCodeTokenId, testCodeTokenId1, testCodeTokenId2],
                        "test item"
                    )
                );
            }
            const res = await Promise.all(promises);
            for (let item of res) {
                await expect(item).to.ok;
            }

            await expect(
                await MEP1004Token.getLocationProofs("test item", 0, 20)
            ).to.length(15);

            await expect(
                await MEP1004Token.getLocationProofs("test item", 25, 5)
            ).to.length(0);

            const promises2 = [];
            for (let i = 15; i < 51; i++) {
                promises2.push(
                    MEP1004Token.LocationProofs(
                        testMEP1002TokenId,
                        [testSNCodeTokenId, testCodeTokenId1, testCodeTokenId2],
                        "test item"
                    )
                );
            }
            const res2 = await Promise.all(promises2);
            for (let item of res2) {
                await expect(item).to.ok;
            }
            await expect(
                await MEP1004Token.getLocationProofs("test item", 10, 20)
            ).to.length(20);

            await expect(
                await MEP1004Token.getLocationProofs("test item", 10, 50)
            ).to.length(41);

            await expect(
                await MEP1004Token.getLocationProofs("test item", 0, 61)
            ).to.length(51);
        });
    });

    describe("Contract Upgrade", async function () {
        it("should revert without upgrade", async function () {
            MEP1004TokenMock = await MEP1004TokenMockFactory.attach(
                MEP1004Token.address
            );
            await expect(
                MEP1004TokenMock.additionalFunction()
            ).to.be.revertedWithoutReason();
        });

        it("should update after upgrade", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(await MEP1004Token.totalSupply()).to.equal(1);

            const newImple = await MEP1004TokenMockFactory.deploy();
            const ownerStorage = await ethers.provider.getStorageAt(
                MEP1004Token.address,
                "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
            );

            await expect(await MEP1004Token.upgradeTo(newImple.address)).to.be
                .ok;
            const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
            await expect(currentOwner).to.equal(owner.address);
            await expect(await MEP1004TokenMock.totalSupply()).to.equal(1);
            await expect(await MEP1004TokenMock.name()).to.equal(
                "MEP1004Token V2"
            );
            await expect(await MEP1004TokenMock.additionalFunction()).to.equal(
                1
            );
        });

        it("should right admin slot after transferOwnership", async function () {
            const newImple = await MEP1004TokenMockFactory.deploy();

            await expect(await MEP1004Token.upgradeTo(newImple.address)).to.be
                .ok;
            await MEP1004Token.transferOwnership(addrs[1].address);
            const ownerStorage = await ethers.provider.getStorageAt(
                MEP1004Token.address,
                "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
            );
            const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
            await expect(currentOwner).to.equal(addrs[1].address);
        });

        it("should revert upgrade after transferOwnership", async function () {
            await MEP1004Token.transferOwnership(addrs[1].address);
            const newImple2 = await MEP1004TokenMockFactory.deploy();
            await expect(
                MEP1004Token.upgradeTo(newImple2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should upgrade after transferOwnership", async function () {
            await MEP1004Token.transferOwnership(addrs[1].address);
            const newImple2 = await MEP1004TokenMockFactory.deploy();
            await expect(
                await MEP1004Token.connect(addrs[1]).upgradeTo(
                    newImple2.address
                )
            ).to.be.ok;
        });
    });

    describe("Interface support", async function () {
        it("can support IERC721", async function () {
            expect(await MEP1004Token.supportsInterface("0x80ac58cd")).to.equal(
                true
            );
        });

        it("cannot support other interfaceId", async function () {
            expect(await MEP1004Token.supportsInterface("0xffffffff")).to.equal(
                false
            );
        });
    });
});
