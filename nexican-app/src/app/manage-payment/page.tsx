"use client";

import ManagePayment from "@/components/ManagePayment";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ManagePayment />
        </div>
      </main>
      <Footer />
    </div>
  );
}
