import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EIP7702AuthorizedCodeModule", (m) => {
  // Deploy EIP7702AuthorizedCode (no constructor parameters needed)
  const eip7702AuthorizedCode = m.contract("EIP7702AuthorizedCode");

  return { eip7702AuthorizedCode };
});
