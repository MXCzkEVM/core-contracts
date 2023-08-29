import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BigNumber, constants } from "ethers";
import {
    MEP1004Token,
    NameWrapperMock,
    NameWrapperMock__factory,
    ProxiedMEP1002Token,
    ProxiedMEP1004Token,
    ProxiedMEP1004TokenMock, ProxiedMEP1004TokenMock__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getAddress } from "@ethersproject/address";
import {H3Index} from "h3-js";
import h3 from "h3-js";
import {mine} from "@nomicfoundation/hardhat-network-helpers";

function bn(x: number): BigNumber {
    return BigNumber.from(x);
}

const ADDRESS_ZERO = constants.AddressZero;

const h3IndexRes7 = getRandomH3Index(7);

// test.mxc name wrapper tokenid
const h3IndexRes7Big = BigNumber.from(`0x${h3IndexRes7}`);

const setupTest = deployments.createFixture(
    async ({ deployments, getNamedAccounts, ethers }, options) => {
        await deployments.fixture(); // ensure you start from a fresh deployments
        const { deployer } = await getNamedAccounts();
        const MEP1004Token = await ethers.getContract<ProxiedMEP1004Token>(
            "ProxiedMEP1004Token"
        );
        const NameWrapperMockFactory =
            await ethers.getContractFactory<NameWrapperMock__factory>(
                "NameWrapperMock"
            );
        const NameWrapperMock = await NameWrapperMockFactory.deploy();
        await MEP1004Token.setMNSToken(NameWrapperMock.address);
        const MEP1002Token = await ethers.getContract<ProxiedMEP1002Token>(
            "ProxiedMEP1002Token"
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
    this.timeout(15000)
    let MEP1004Token: ProxiedMEP1004Token;
    let NameWrapperMock: NameWrapperMock;
    let MEP1004TokenMock: ProxiedMEP1004TokenMock;
    let MEP1004TokenMockFactory: ProxiedMEP1004TokenMock__factory;
    let MEP1002Token: ProxiedMEP1002Token;
    let owner: SignerWithAddress;
    let tokenOwner: SignerWithAddress;
    let addrs: SignerWithAddress[];
    beforeEach(async function () {
        [owner, tokenOwner, ...addrs] = await ethers.getSigners();
        ({ MEP1004Token, NameWrapperMock, MEP1002Token } = await setupTest());
        MEP1004TokenMockFactory =
            await ethers.getContractFactory<ProxiedMEP1004TokenMock__factory>(
                "ProxiedMEP1004TokenMock"
            );
    });

    const testDotMXCTokenId = BigNumber.from(
        "68949889097187516169332801510365581835791041465326974816460712402969489861206"
    );

    const testSNCode = "NEOTEST1235421";
    const testMEP1002TokenId = BigNumber.from("611831265154301951");
    describe("Init", async function () {
        it("cannot init again", async function () {
            await expect(
                MEP1004Token.initialize(
                    "MEP1004Token",
                    "MEP1004",
                )
            ).to.be.revertedWith(
                "Initializable: contract is already initialized"
            );
        });
    });

    describe("Minting", async function () {
        it("should allow admin to mint", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")).to
                .ok;

            await expect(await MEP1004Token.whereSlot(1),)
        });

        it("should not allow non-admin account to mint tokens", async () => {
            await expect(
                MEP1004Token.connect(addrs[1]).mint(
                    addrs[1].address,
                    testSNCode,
                    h3IndexRes7Big, "EU863-870"
                )
            ).to.be.revertedWith("Controllable: Caller is not a controller");
        });

        it("cannot mint by invalid sncode", async function () {
            await expect(MEP1004Token.mint(owner.address, "test",h3IndexRes7Big, "EU863-870")).to.be
                .reverted;
        });

        it("cannot mint already minted token", async function () {
            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870");
            await expect(
                MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")
            ).to.be.revertedWithCustomError(
                MEP1004Token,
                "ERC721TokenAlreadyMinted"
            );
            await expect(await MEP1004Token.balanceOf(owner.address)).to.equal(
                1
            );
        });

        it("should return balance", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")).to
                .ok;
            await expect(await MEP1004Token.balanceOf(owner.address)).to.equal(
                1
            );
        });

        it("should mint token event", async function () {
            await expect(MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870"))
                .to.emit(MEP1004Token, "Transfer")
                .withArgs(
                    "0x0000000000000000000000000000000000000000",
                    owner.address,
                    1
                );
        });

        it("should set name event", async function () {
            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870");
            await expect(MEP1004Token.setName(1, testDotMXCTokenId))
                .to.emit(MEP1004Token, "MEP1004TokenUpdateName")
                .withArgs(1, "test.mxc");

            await expect(MEP1004Token.resetName(1))
                .to.emit(MEP1004Token, "MEP1004TokenUpdateName")
                .withArgs(1, "");
        });

        it("should setting name", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")).to
                .ok;
            await expect(await MEP1004Token.tokenNames(1)).to.equal("");
            await expect(await MEP1004Token.setName(1, testDotMXCTokenId)).to
                .ok;
            await expect(await MEP1004Token.tokenNames(1)).to.equal("test.mxc");
        });

        it("should reset name", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")).to
                .ok;
            await expect(await MEP1004Token.tokenNames(1)).to.equal("");
            await expect(await MEP1004Token.setName(1, testDotMXCTokenId)).to
                .ok;
            await expect(await MEP1004Token.tokenNames(1)).to.equal("test.mxc");
            await expect(await MEP1004Token.resetName(1)).to.ok;
            await expect(await MEP1004Token.tokenNames(1)).to.equal("");
        });

        it("should get uri", async function () {
            await MEP1004Token.setBaseURI("https://wannsee-test.mxc.com/");
            await expect(await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")).to
                .ok;
            await expect(await MEP1004Token.tokenURI(1)).to.equal(
                `https://wannsee-test.mxc.com/1?name=`
            );
        });

        it("should return supply", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")).to
                .ok;
            await expect(await MEP1004Token.totalSupply()).to.equal(1);
        });

        it("should return sncode", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")).to
                .ok;
            await expect(await MEP1004Token.getSNCode(1)).to.equal(testSNCode);
        });

        it("should return tokenid", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")).to
                .ok;
            await expect(await MEP1004Token.getTokenId(testSNCode)).to.equal(1);
        });
    });

    describe("MEP1002Slots", async function () {
        it("should allow owner to insert the MEP1004 token to the specified slot of the MEP1002 token", async function () {
            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870");
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.removeFromMEP1002Slot(1, h3IndexRes7Big, 0, {
                value: ethers.utils.parseEther('50')
            });
            await expect(
                MEP1004Token.insertToMEP1002Slot(1, testMEP1002TokenId,  "EU863-870",123)
            ).to.be.revertedWithCustomError(MEP1004Token, "ExceedSlotLimit");
            await expect(
                MEP1004Token.insertToMEP1002Slot(1, testMEP1002TokenId,  "EU863-870", 0)
            ).to.emit(MEP1004Token, "InsertToMEP1002Slot");
        });

        it("should allow owner to remove the MEP1004 token from the specified slot of the MEP1002 token ", async function () {
            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870");
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.removeFromMEP1002Slot(1, h3IndexRes7Big, 0, {
                value: ethers.utils.parseEther('50')
            });

            await MEP1004Token.insertToMEP1002Slot(1, testMEP1002TokenId, "EU863-870", 0);
            await expect(
                await MEP1004Token.setExitFee(ethers.utils.parseEther("50"))
            ).to.ok;
            await expect(
                MEP1004Token.removeFromMEP1002Slot(1, testMEP1002TokenId, 0, {
                    value: ethers.utils.parseEther("50"),
                })
            ).to.emit(MEP1004Token, "RemoveFromMEP1002Slot");
        });

        it("should return correct where slot", async function () {
            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870");
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.removeFromMEP1002Slot(1, h3IndexRes7Big, 0, {
                value: ethers.utils.parseEther('50')
            });

            await MEP1004Token.insertToMEP1002Slot(1, testMEP1002TokenId, "EU863-870",1);
            await expect(await MEP1004Token.whereSlot(1)).to.deep.equals([
                testMEP1002TokenId,
                1,
                1,
            ]);
        });

        it("should return slot num", async function () {
            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870");
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.removeFromMEP1002Slot(1, h3IndexRes7Big, 0, {
                value: ethers.utils.parseEther('50')
            });
            await MEP1004Token.insertToMEP1002Slot(1, testMEP1002TokenId, "EU863-870",1);

            const slots = await MEP1004Token.getMEP1002Slot(testMEP1002TokenId);

            await expect(slots[1][1]).to.equal(1);
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
            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870");
            await expect(
                MEP1004Token.removeFromMEP1002Slot(1, h3IndexRes7Big, 0, {
                    value: ethers.utils.parseEther("50"),
                })
            ).to.emit(MEP1004Token, "RemoveFromMEP1002Slot");
            await MEP1004Token.insertToMEP1002Slot(1, testMEP1002TokenId, "EU863-870", 0);
            await expect(await ethers.provider.getBalance(MEP1004Token.address)).to.be.equal(
                ethers.utils.parseEther("50")
            );
            await MEP1004Token.withdrawal(owner.address);
            await expect(await ethers.provider.getBalance(MEP1004Token.address)).to.be.equal(0);
        });

        it("should not allow non-owner to withdraw the exit fee", async function () {
            await expect(MEP1004Token.connect(addrs[1]).withdrawal(owner.address)).to.be
                .reverted;
        });

        it("should allow controller remove slot without pay", async function () {
            await MEP1002Token.mint(testMEP1002TokenId);

            await expect(
                await MEP1004Token.setExitFee(ethers.utils.parseEther("50"))
            ).to.ok;

            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big,"EU863-870");

            await expect(
                MEP1004Token.removeFromMEP1002Slot(
                    1,
                    h3IndexRes7Big,
                    0
                )
            ).to.emit(MEP1004Token, "RemoveFromMEP1002Slot");

            await expect(await MEP1004Token.getStatus(1)).to.equals(1);

            await expect(
                MEP1004Token.insertToMEP1002Slot(1, testMEP1002TokenId, "EU863-870",0)
            ).to.be.reverted;

            await expect(
                MEP1004Token.payExitFee(1, {
                    value: ethers.utils.parseEther("50"),
                })
            ).to.be.ok;

            await expect(await MEP1004Token.getStatus(1)).to.equals(0);
        });

        it("should empty slot after slot expired and insert to expired slot", async function () {
            await MEP1004Token.setSlotExpiredBlockNum(100);

            await MEP1004Token.mint(owner.address, testSNCode, testMEP1002TokenId,"EU863-870");

            let slots = await MEP1004Token.getMEP1002Slot(testMEP1002TokenId);

            await expect(slots[1][0]).to.equal(1);

            await expect(
                MEP1004Token.insertToMEP1002Slot(1, testMEP1002TokenId, "EU863-870",0)
            ).to.be.reverted;

            await mine(1000);

            slots = await MEP1004Token.getMEP1002Slot(testMEP1002TokenId);

            await expect(slots[1][0]).to.equal(0);

            const where = await MEP1004Token.whereSlot(BigNumber.from(1));

            await expect(where).deep.equals([0,0,0]);

            await expect(await MEP1004Token.getStatus(1)).to.equals(1);

            await expect(MEP1004Token.insertToMEP1002Slot(1, testMEP1002TokenId, "EU863-870", 0)).to.be.ok;

        })
    });

    describe("LocationProofs", async function () {
        it("should allow owner to set the location proof", async function () {
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870");
            await MEP1004Token.mint(addrs[1].address, "M2X-testcode1",h3IndexRes7Big, "EU863-870");
            const testCodeTokenId1 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("M2X-testcode1")
                )
            );
            await MEP1004Token.mint(addrs[1].address, "NEO-testcode2",h3IndexRes7Big, "EU863-870");
            const testCodeTokenId2 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("NEO-testcode2")
                )
            );
            const now = Math.floor(Date.now() / 1000) + 100;
            await ethers.provider.send("evm_setNextBlockTimestamp", [now]);
            const tx = await MEP1004Token.LocationProofs(
                testMEP1002TokenId,
                [1, testCodeTokenId1, testCodeTokenId2],
                "test item"
            );
            await expect(tx).to.ok;
            const receipt = await tx.wait();
            const event = receipt.events?.at(0);
            await expect(event?.event).to.equals("NewLocationProof");
        });
        it("should return latest Location Proof", async function () {
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870");
            await MEP1004Token.mint(addrs[1].address, "M2X-testcode1",h3IndexRes7Big, "EU863-870");
            const testCodeTokenId1 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("M2X-testcode1")
                )
            );
            await MEP1004Token.mint(addrs[1].address, "NEO-testcode2",h3IndexRes7Big, "EU863-870");
            const testCodeTokenId2 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("NEO-testcode2")
                )
            );
            const now = Math.floor(Date.now() / 1000) + 100;
            await ethers.provider.send("evm_setNextBlockTimestamp", [now]);
            const tx = await MEP1004Token.LocationProofs(
                testMEP1002TokenId,
                [1, testCodeTokenId1, testCodeTokenId2],
                "test item"
            );
            await expect(tx).to.ok;

            await expect(
                await MEP1004Token.latestLocationProofs("test item")
            ).to.deep.equals([
                testMEP1002TokenId,
                [1, testCodeTokenId1, testCodeTokenId2],
                "test item",
                now,
            ]);
        });

        it("should return correct proofs", async function () {
            await MEP1002Token.mint(testMEP1002TokenId);
            await MEP1004Token.mint(owner.address, testSNCode, h3IndexRes7Big, "EU863-870");
            await MEP1004Token.mint(addrs[1].address, "M2X-testcode1", h3IndexRes7Big, "EU863-870");
            const testCodeTokenId1 = BigNumber.from(
                ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes("M2X-testcode1")
                )
            );
            await MEP1004Token.mint(addrs[1].address, "NEO-testcode2",h3IndexRes7Big, "EU863-870");
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
                        [1, testCodeTokenId1, testCodeTokenId2],
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
                        [1, testCodeTokenId1, testCodeTokenId2],
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
            await expect(await MEP1004Token.mint(owner.address, testSNCode,h3IndexRes7Big, "EU863-870")).to
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

function getRandomH3Index(res: number): H3Index {
    const MAX_LATITUDE = (90 * Math.PI) / 180;
    const MAX_LONGITUDE = (180 * Math.PI) / 180;

    const latitude = Math.random() * MAX_LATITUDE;
    const longitude = Math.random() * MAX_LONGITUDE;
    return h3.latLngToCell(latitude, longitude, res);
}