import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/providers/Web3Provider";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: ["400"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexican",
  description: "Fund across chains, effortlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivoBlack.variable} ${inter.variable} antialiased`}
      >
        <Web3Provider>
          <Navbar />
          {children}
          <Footer />
        </Web3Provider>
        <Toaster
          position={"top-center"}
          toastOptions={{
            duration: 5000,
            style: {
              borderRadius: '9999px',
              background: '#fff',
              color: '#000',
              padding: '4px 10px',
              fontSize: '14px',
              border: '1px solid #000',
            },
          }}
        />
      </body>
    </html>
  );
}
