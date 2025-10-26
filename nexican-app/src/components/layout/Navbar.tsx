"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Wallet,
  CircleUserRound,
  Settings,
  HelpCircle,
} from "lucide-react";
import ConnectWallet from "../blocks/connect-wallet";
import NexusInitButton from "../nexus-init";
import Image from "next/image";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    // { name: "Home", href: "/" },
    { name: "Campaigns", href: "/campaigns" },
    { name: "Create", href: "/create" },
    { name: "Explorer", href: "/explorer" },
    // { name: 'Payroll', href: '/payroll' },
    { name: "DAO", href: "/dao" },
    // { name: 'Profile', href: '/profile' },
    { name: "Bridge", href: "/bridge" },
    { name: "About", href: "/how-it-works" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-background border-b-4 border-foreground sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-xl text-foreground">Nexican</span> */}
            <Image src="/logo.png" alt="Nexican" width={100} height={100} className="w-40" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 font-display font-bold text-sm border-2 rounded-lg border-foreground transition-all duration-200 ${isActive(item.href)
                  ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0 translate-y-0'
                  : 'bg-background text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5'
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
            <Link
              href="/profile"
              className={`p-2 rounded-lg border-2 border-foreground bg-background text-foreground hover:bg-primary hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-200 ${isActive("/profile")
                  ? "bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-background text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                }`}
            >
              <CircleUserRound className="w-6 h-6" />
            </Link>
            {/* <Link
              href="/how-it-works"
              className={`p-2 rounded-lg border-2 border-foreground bg-background text-foreground hover:bg-primary hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-200 ${
                isActive("/how-it-works")
                  ? "bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-background text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              }`}
            >
              <HelpCircle className="w-6 h-6" />
            </Link> */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 border-2 border-foreground bg-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t-4 border-foreground bg-background">
            <div className="px-2 pt-2 pb-3 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 transition-all font-display font-bold border-2 border-foreground ${isActive(item.href)
                    ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-background text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href={'/profile'}
                className={`block px-4 py-3 transition-all font-display font-bold border-2 border-foreground ${isActive('/profile')
                  ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-background text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href={"/how-it-works"}
                className={`block px-4 py-3 transition-all font-bold border-2 border-foreground ${isActive("/how-it-works")
                    ? "bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-background text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
