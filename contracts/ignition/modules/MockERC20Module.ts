import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MockERC20Module", (m) => {
  // Deploy MockERC20 with test parameters
  const mockERC20 = m.contract("MockERC20", [
    "MockERC20", // name
    "MOCK", // symbol
    18n, // decimals
    1000000000000000000000000n, // initialSupply (1 million tokens with 18 decimals)
  ]);

  return { mockERC20 };
});
