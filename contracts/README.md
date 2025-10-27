# Nexican Smart Contracts - EIP-7702 & Cross-Chain Infrastructure

This repository contains the core smart contracts powering Nexican's decentralized cross-chain crowdfunding and payroll streaming platform. Built with Hardhat 3, these contracts implement EIP-7702 delegation, automated fund distribution, and cross-chain asset management.

## 🚀 Contract Architecture

### Core Contracts

#### **EIP7702DelegationManager.sol**

- **Purpose**: Implements EIP-7702 delegation functionality for automated payroll streaming
- **Features**:
  - Time-based asset delegation
  - Automated recurring payments
  - Subscription management
  - Account abstraction integration
- **Key Functions**: `createSubscription()`, `executePayment()`, `revokeDelegation()`

#### **EIP7702AuthorizedCode.sol**

- **Purpose**: Authorized code contract for EIP-7702 delegation
- **Features**:
  - Secure delegation execution
  - Permission management
  - Cross-chain compatibility
- **Integration**: Works with Avail Nexus SDK for cross-chain operations

#### **MockERC20.sol**

- **Purpose**: Test token for development and testing
- **Features**: Standard ERC20 implementation with minting capabilities
- **Usage**: Development, testing, and demonstration purposes

## 🛠 Technology Stack

### Smart Contract Development

- **Hardhat 3**: Advanced development framework with native Node.js test runner
- **Solidity ^0.8.24**: Latest Solidity compiler with enhanced security features
- **OpenZeppelin**: Battle-tested security libraries and standards
- **Viem**: Type-safe Ethereum library for contract interactions

### Testing & Deployment

- **Node.js Test Runner**: Native testing with `node:test`
- **Foundry Compatibility**: Solidity unit tests with Foundry
- **TypeScript Integration**: Full type safety for contract interactions
- **Multi-Network Support**: Ethereum, Polygon, Arbitrum, Optimism, Base

## 🔧 Development & Testing

### Prerequisites

- Node.js 18+
- npm or yarn
- Hardhat 3
- Git

### Installation

```bash
npm install
```

### Running Tests

#### All Tests

```bash
npx hardhat test
```

#### Selective Testing

```bash
# Solidity unit tests
npx hardhat test solidity

# TypeScript integration tests
npx hardhat test nodejs

# Specific test file
npx hardhat test test/EIP7702DelegationManager.test.ts
```

### Contract Deployment

#### Local Development

```bash
# Deploy to local hardhat network
npx hardhat ignition deploy ignition/modules/EIP7702FullDeployment.ts
```

#### Testnet Deployment

```bash
# Deploy to Sepolia testnet
npx hardhat ignition deploy --network sepolia ignition/modules/EIP7702FullDeployment.ts

# Deploy to Polygon Amoy
npx hardhat ignition deploy --network polygon ignition/modules/EIP7702FullDeployment.ts

# Deploy to Arbitrum Sepolia
npx hardhat ignition deploy --network arbitrum ignition/modules/EIP7702FullDeployment.ts
```

### Environment Setup

#### Required Environment Variables

```bash
# .env file
SEPOLIA_PRIVATE_KEY=your_private_key_here
POLYGON_PRIVATE_KEY=your_private_key_here
ARBITRUM_PRIVATE_KEY=your_private_key_here
OPTIMISM_PRIVATE_KEY=your_private_key_here
BASE_PRIVATE_KEY=your_private_key_here
```

#### Setting Private Keys with Hardhat Keystore

```bash
# Set private key for Sepolia
npx hardhat keystore set SEPOLIA_PRIVATE_KEY

# Set private key for Polygon
npx hardhat keystore set POLYGON_PRIVATE_KEY

# Set private key for Arbitrum
npx hardhat keystore set ARBITRUM_PRIVATE_KEY
```

## 🚀 Contract Features

### EIP-7702 Delegation Manager

- **Automated Payroll**: Time-based delegation for recurring payments
- **Subscription Management**: Create and manage payment subscriptions
- **Cross-Chain Support**: Works with Avail Nexus SDK
- **Security**: ReentrancyGuard and access control


## 🔒 Security Features

### OpenZeppelin Integration

- **Ownable**: Contract ownership management
- **ReentrancyGuard**: Protection against reentrancy attacks
- **SafeERC20**: Safe token transfers
- **Access Control**: Role-based permissions

### Security Best Practices

- **Input Validation**: Comprehensive parameter checking
- **Event Logging**: Transparent transaction logging
- **Error Handling**: Clear error messages and revert conditions
- **Gas Optimization**: Efficient contract design

## 📊 Deployment Addresses

### Testnet Deployments

### Ethereum Sepolia

- **EIP7702AuthorizedCode:** [`0xE943420E8A5D3C2BBb3EFeC6141926FA3fE0872f`](https://eth-sepolia.blockscout.com/address/0xE943420E8A5D3C2BBb3EFeC6141926FA3fE0872f?tab=contract)
- **EIP7702DelegationManager:** [`0x9E89b0F0049e22E679C3A3bE4938DF1dCc08ec15`](https://eth-sepolia.blockscout.com/address/0x9E89b0F0049e22E679C3A3bE4938DF1dCc08ec15?tab=contract)

### Arbitrum Sepolia

- **EIP7702AuthorizedCode:** [`0x09Fd3192541003E64691B58771fD0ec1222B9Fd6`](https://arbitrum-sepolia.blockscout.com/address/0x09Fd3192541003E64691B58771fD0ec1222B9Fd6?tab=contract)
- **EIP7702DelegationManager:** [`0x9edE152D33D7450E08B8eAec6bDA5E7D1F98F45d`](https://arbitrum-sepolia.blockscout.com/address/0x9edE152D33D7450E08B8eAec6bDA5E7D1F98F45d?tab=contract)

### Optimism Sepolia

- **EIP7702AuthorizedCode:** [`0xea4b19dfE41e62296CDC8aA41aD86261a4eb371B`](https://testnet-explorer.optimism.io/address/0xea4b19dfE41e62296CDC8aA41aD86261a4eb371B?tab=contract)
- **EIP7702DelegationManager:** [`0x32dDe10DBD35910Be56CdcDc47353488F798b8bb`](https://testnet-explorer.optimism.io/address/0x32dDe10DBD35910Be56CdcDc47353488F798b8bb?tab=contract)

### Base Sepolia

- **EIP7702AuthorizedCode:** [`0x566298d3F1351d8e3bd7862855D51579d138d849`](https://base-sepolia.blockscout.com/address/0x566298d3F1351d8e3bd7862855D51579d138d849?tab=contract)
- **EIP7702DelegationManager:** [`0x5C009421fb32B13Ac739E1fe95a4f6Ff4C132882`](https://base-sepolia.blockscout.com/address/0x5C009421fb32B13Ac739E1fe95a4f6Ff4C132882?tab=contract)



## 🔗 Integration with Nexican Platform

### Frontend Integration

- **Web3 Provider**: Connect to deployed contracts
- **Avail Nexus SDK**: Cross-chain contract interactions
- **Real-time Updates**: Event listening and state management
- **User Interface**: Seamless contract interaction

### API Integration

- **Contract Events**: Real-time transaction monitoring
- **State Management**: Contract state synchronization
- **Transaction Handling**: Gas optimization and error handling
- **Cross-Chain Operations**: Multi-network contract calls

## 📚 Documentation

### Contract Documentation

- **NatSpec Comments**: Comprehensive inline documentation
- **Function Descriptions**: Detailed parameter and return value documentation
- **Event Documentation**: Event parameter descriptions
- **Usage Examples**: Code examples for common operations

### Integration Guides

- **Frontend Integration**: How to connect contracts to the UI
- **API Integration**: Backend contract interaction patterns
- **Testing Guide**: Comprehensive testing strategies
- **Deployment Guide**: Step-by-step deployment instructions

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Implement the feature
5. Run the test suite
6. Submit a pull request

### Code Standards

- **Solidity Style Guide**: Follow Solidity style conventions
- **Test Coverage**: Maintain high test coverage
- **Documentation**: Update documentation for new features
- **Security Review**: All contracts undergo security review

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Hardhat 3 Documentation](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Viem Documentation](https://viem.sh/)
- [Nexican Platform](https://nexican.vercel.app)
