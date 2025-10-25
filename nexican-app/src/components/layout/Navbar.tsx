'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Wallet, CircleUserRound, Settings } from 'lucide-react';
import ConnectWallet from '../blocks/connect-wallet';
import NexusInitButton from '../nexus-init';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'Create', href: '/create' },
    { name: 'Activities', href: '/activities' },
    // { name: 'Payroll', href: '/payroll' },
    { name: 'DAO', href: '/dao' },
    // { name: 'Profile', href: '/profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-background border-b-2 border-foreground sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-xl text-foreground">Nexican</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors duration-200 font-medium ${isActive(item.href)
                  ? 'text-primary bg-primary/10 px-3 py-1 rounded-lg border-2 border-primary'
                  : 'text-foreground hover:text-primary'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center gap-2">
            <ConnectWallet />
            <NexusInitButton />
            <Link href="/profile" className="p-2 text-foreground hover:text-primary transition-colors">
              <CircleUserRound className="w-8 h-8" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-foreground hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t-2 border-foreground bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 transition-colors font-medium rounded-lg ${isActive(item.href)
                    ? 'text-primary bg-primary/10 border-2 border-primary'
                    : 'text-foreground hover:text-primary'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href={'/profile'}
                className={`block px-3 py-2 transition-colors font-medium rounded-lg ${isActive('/profile')
                  ? 'text-primary bg-primary/10 border-2 border-primary'
                  : 'text-foreground hover:text-primary'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              {/* <div className="pt-4 space-y-2">
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              </div>  */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
