import { expect } from "chai";
import "@nomicfoundation/hardhat-ethers";
declare global {
  var ethers: any;
}

// Simple time helper
const time = {
  increase: async (seconds: number) => {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  },
  latest: async () => {
    const block = await ethers.provider.getBlock("latest");
    return block!.timestamp;
  }
};

describe("EIP7702DelegationManager", function () {
  let delegationManager: any;
  let mockToken: any;
  let owner: any;
  let delegator: any;
  let delegate: any;

  const ONE_HOUR = 3600;
  const ONE_DAY = 86400;
  const DELEGATION_AMOUNT = ethers.parseEther("1.0");
  const TOKEN_AMOUNT = ethers.parseUnits("100", 18);

  beforeEach(async function () {
    [owner, delegator, delegate] = await ethers.getSigners();

    // Deploy MockERC20
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20Factory.deploy(
      "Test Token",
      "TEST",
      18,
      ethers.parseUnits("1000000", 18)
    );

    // Deploy EIP7702DelegationManager
    const DelegationManagerFactory = await ethers.getContractFactory("EIP7702DelegationManager");
    delegationManager = await DelegationManagerFactory.deploy();

    // Transfer some tokens to delegator for testing
    await mockToken.transfer(delegator.address, TOKEN_AMOUNT);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await delegationManager.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct parameters", async function () {
      expect(Number(await delegationManager.nextDelegationId())).to.equal(1);
      expect(Number(await delegationManager.maxDelegationDuration())).to.equal(365 * 24 * 3600); // 1 year
      expect(Number(await delegationManager.minDelegationDuration())).to.equal(3600); // 1 hour
    });
  });

  describe("ETH Delegation", function () {
    it("Should create ETH delegation successfully", async function () {
      const tx = await delegationManager.connect(delegator).createDelegation(
        delegate.address,
        ethers.ZeroAddress, // ETH
        DELEGATION_AMOUNT,
        ONE_DAY,
        { value: DELEGATION_AMOUNT }
      );
      
      // Just check that transaction was successful
      expect(tx).to.not.be.undefined;

      const delegation = await delegationManager.getDelegation(1);
      expect(delegation.delegator).to.equal(delegator.address);
      expect(delegation.delegate).to.equal(delegate.address);
      expect(delegation.asset).to.equal(ethers.ZeroAddress);
      expect(delegation.amount).to.equal(DELEGATION_AMOUNT);
      expect(delegation.isActive).to.be.true;
      expect(delegation.isRevoked).to.be.false;
    });

    it("Should not allow delegation to self", async function () {
      try {
        await delegationManager.connect(delegator).createDelegation(
          delegator.address,
          ethers.ZeroAddress,
          DELEGATION_AMOUNT,
          ONE_DAY,
          { value: DELEGATION_AMOUNT }
        );
        // If we reach here, the test should fail
        expect.fail("Expected transaction to revert");
      } catch (error: any) {
        expect(error.message).to.include("Cannot delegate to self");
      }
    });
  });

  describe("Delegation Management", function () {
    beforeEach(async function () {
      // Create a delegation
      await delegationManager.connect(delegator).createDelegation(
        delegate.address,
        ethers.ZeroAddress,
        DELEGATION_AMOUNT,
        ONE_DAY,
        { value: DELEGATION_AMOUNT }
      );
    });

    it("Should revoke active delegation", async function () {
      const tx = await delegationManager.connect(delegator).revokeDelegation(1);
      expect(tx).to.not.be.undefined;

      const delegation = await delegationManager.getDelegation(1);
      expect(delegation.isActive).to.be.false;
      expect(delegation.isRevoked).to.be.true;
    });

    it("Should get correct delegation status", async function () {
      const [isActive, timeLeft] = await delegationManager.getDelegationStatus(1);
      expect(isActive).to.be.true;
      expect(Number(timeLeft)).to.be.greaterThan(0);
      expect(Number(timeLeft)).to.be.lessThanOrEqual(ONE_DAY);
    });
  });
});