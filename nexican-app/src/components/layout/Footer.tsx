import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const footerLinks = {
    Platform: [
      { name: 'How it Works', href: '/how-it-works' },
      { name: 'Campaigns', href: '/campaigns' },
      { name: 'Create Campaign', href: '/create' },
      { name: 'Payroll Streaming', href: '/payroll' },
    ],
    Resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Tutorials', href: '/tutorials' },
      { name: 'Community', href: '/community' },
    ],
    Technology: [
      { name: 'Avail Nexus SDK', href: 'https://availproject.org' },
      { name: 'EIP-7702', href: 'https://eips.ethereum.org/EIPS/eip-7702' },
      { name: 'Smart Contracts', href: '/contracts' },
      { name: 'Cross-chain', href: '/cross-chain' },
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Bug Reports', href: '/bugs' },
      { name: 'Feature Requests', href: '/features' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    // { name: 'Discord', href: 'https://discord.gg', icon: Discord },
    { name: 'Email', href: 'mailto:hello@nexican.com', icon: Mail },
  ];

  return (
    <footer className="bg-background border-t-2 border-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl text-foreground">Nexican</span>
            </Link>
            <p className="text-foreground/80 mb-4 max-w-md">
              Fund projects across chains — transparently and automatically.
              Built with Avail Nexus SDK and EIP-7702 automation for decentralized
              cross-chain crowdfunding and payroll streaming.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2 text-foreground/60 hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-foreground mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-foreground/60 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div> */}

        {/* Bottom Section */}
        <div className="">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Image src="/logo.png" alt="Nexican" width={100} height={100} className="w-48"/>
            <div className="text-foreground/60 text-sm">
              © 2025 Nexican. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
