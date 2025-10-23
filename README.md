# Nexican - Decentralized Cross-Chain Crowdfunding Platform

A modern, futuristic Next.js + TailwindCSS dashboard for "Nexican", a decentralized cross-chain crowdfunding and payroll streaming platform built using the Avail Nexus SDK and EIP-7702 automation.

## 🚀 Features

### Core Functionality

- **Cross-Chain Funding**: Fund projects across multiple blockchains seamlessly
- **Transparent Escrow**: Smart contract-based escrow with milestone-based releases
- **EIP-7702 Automation**: Automated payroll streaming and fund distribution
- **DAO Governance**: Community-driven verification and approval process

### Dashboard Sections

1. **Home/Overview**: Hero section, campaign cards, unified balance summary
2. **Create Campaign**: Comprehensive form with milestones, team management, and file uploads
3. **Campaign Detail**: Detailed view with progress tracking, sponsors, and contribution options
4. **Payroll/Streaming**: Real-time visualization of active fund streams
5. **DAO Verification Panel**: Review and approve campaign milestones

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

- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS v4
- **Icons**: Lucide React
- **Typography**: Geist Sans & Geist Mono
- **TypeScript**: Full type safety

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
