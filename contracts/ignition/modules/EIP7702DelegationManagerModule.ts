import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EIP7702DelegationManagerModule", (m) => {
  // Deploy EIP7702DelegationManager (no constructor parameters needed)
  const eip7702DelegationManager = m.contract("EIP7702DelegationManager");

  return { eip7702DelegationManager };
});
