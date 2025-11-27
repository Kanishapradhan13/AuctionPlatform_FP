"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      // Redirect to auction management dashboard after successful login
      // Pass user ID as a query parameter for the auction service to use
      const auctionDashboardUrl = new URL("http://localhost:4002/dashboard");
      auctionDashboardUrl.searchParams.set("userId", user.id);
      auctionDashboardUrl.searchParams.set("userEmail", user.primaryEmailAddress?.emailAddress || "");

      window.location.href = auctionDashboardUrl.toString();
    }
  }, [isLoaded, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">
          Redirecting to Auction Platform...
        </p>
      </div>
    </div>
  );
}
