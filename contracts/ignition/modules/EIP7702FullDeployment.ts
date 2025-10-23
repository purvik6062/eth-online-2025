import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EIP7702FullDeployment", (m) => {
  const deployer = m.getAccount(0);

  // Deploy MockERC20 for testing
  const mockERC20 = m.contract("MockERC20", [
    "MockERC20", // name
    "MOCK", // symbol
    18n, // decimals
    1000000000000000000000000n, // initialSupply (1 million tokens with 18 decimals)
  ]);

  // Deploy EIP7702DelegationManager
  const eip7702DelegationManager = m.contract("EIP7702DelegationManager");

  // Deploy EIP7702AuthorizedCode
  const eip7702AuthorizedCode = m.contract("EIP7702AuthorizedCode");

  // Initialize the authorized code with delegation manager and deployer as owner
  m.call(eip7702AuthorizedCode, "initialize", [
    eip7702DelegationManager,
    deployer,
  ]);

  return {
    mockERC20,
    eip7702DelegationManager,
    eip7702AuthorizedCode,
  };
});