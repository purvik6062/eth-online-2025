"use client";

import RecurringPayments from "@/components/RecurringPayments";

export default function Page() {
  const campaign = {
    campaignId: "1",
    name: "Test Campaign",
    userAddress: "0x1234567890123456789012345678901234567890",
    chain: "sepolia",
  };

  return (
    <div className="flex w-full justify-center py-8">
      <RecurringPayments campaign={campaign} onSuccess={() => {}} />
    </div>
  );
}
