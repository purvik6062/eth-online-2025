# Nexican - Decentralized Cross-Chain Crowdfunding Platform

A revolutionary Web3 platform that enables seamless cross-chain crowdfunding and automated payroll streaming using cutting-edge blockchain technology. Built with Avail Nexus SDK and EIP-7702 automation for the future of decentralized funding.

## 🚀 Core Features

### Cross-Chain Infrastructure

- **Unified Balance Management**: Manage assets across Ethereum, Polygon, Arbitrum, Optimism, and Base
- **One-Click Cross-Chain Transfers**: Seamless asset movement between blockchains
- **Real-Time Balance Synchronization**: Instant updates across all supported chains
- **Avail Nexus SDK Integration**: Advanced cross-chain infrastructure

### EIP-7702 Automation

- **Recurring Payment Subscriptions**: Automated recurring contributions
- **Time-Based Delegation**: Smart contract automation for payroll
- **Account Abstraction**: Enhanced user experience with automated transactions
- **Smart Contract Automation**: Milestone-based fund distribution

### DAO Governance

- **Community Verification**: Decentralized campaign approval process
- **Transparent Voting**: Community-driven milestone verification
- **DAO Member Permissions**: Secure governance system
- **Campaign Validation**: Automatic review for high-value campaigns (>$10K)

### Smart Distribution System

- **Team Member Splits**: Automatic fund distribution among team members
- **Flexible Split Options**: Equal, percentage-based, or custom distributions
- **Real-Time Updates**: Instant balance updates and notifications
- **Team Management**: Comprehensive team member administration

### Advanced Features

- **Cross-Chain Bridge**: Seamless asset transfers between blockchains
- **Transaction Explorer**: Real-time monitoring with Blockscout SDK integration
- **Milestone Tracking**: Progress monitoring and transparent reporting
- **Document Management**: Secure file uploads and verification

## 🎨 Design System

### Color Palette

- Primary: `#5F7161` (Forest Green)
- Primary Light: `#6D8B74` (Sage Green)
- Secondary: `#D0C9C0` (Warm Gray)
- Background: `#EFEAD8` (Cream)
- Foreground: `#2D3748` (Dark Gray)

### Design Philosophy

- **Neobrutalist + Futuristic Web3 UI**
- Rounded cards with minimal shadows
- Sleek typography using Geist Sans
- On-chain themed icons and data widgets
- Clear sections and status indicators

## 🛠 Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS v4 with custom design system
- **Icons**: Lucide React
- **Typography**: Roboto Mono & Archivo Black
- **TypeScript**: Full type safety

### Blockchain Integration

- **Avail Nexus SDK**: Cross-chain infrastructure and unified balance management
- **EIP-7702 Protocol**: Account abstraction and automated delegation
- **Smart Contracts**: Solidity contracts for fund management and automation
- **Blockscout SDK**: Real-time transaction monitoring and analytics

### Backend & Database

- **MongoDB**: Campaign data, user profiles, and transaction records
- **API Routes**: Next.js API for campaign management and DAO operations
- **File Storage**: Document and image upload handling

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd nexican-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── create/            # Create Campaign page
│   ├── campaigns/         # Campaign listing and detail pages
│   ├── payroll/           # Payroll streaming page
│   ├── dao/               # DAO verification panel
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── layout/           # Layout components (Navbar, Footer)
│   ├── campaign/         # Campaign-specific components
│   ├── payroll/          # Payroll-specific components
│   └── dao/              # DAO-specific components
└── globals.css           # Global styles and CSS variables
```

## 🎯 Key Components

### UI Components

- `Button`: Neobrutalist button with multiple variants
- `Card`: Rounded card with hover effects
- `ProgressBar`: Animated progress indicators

### Campaign Components

- `CampaignCard`: Campaign preview with progress and actions
- `BalanceCard`: Cross-chain balance summary

### Layout Components

- `Navbar`: Responsive navigation with mobile menu
- `Footer`: Comprehensive footer with links and branding

## 🔧 Customization

### Colors

Update the CSS variables in `src/app/globals.css`:

```css
:root {
  --background: #efead8;
  --foreground: #2d3748;
  --primary: #5f7161;
  --primary-light: #6d8b74;
  --secondary: #d0c9c0;
  --accent: #4a5568;
}
```

### Components

All components are built with TypeScript and are fully customizable through props.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Avail Nexus SDK](https://availproject.org)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
