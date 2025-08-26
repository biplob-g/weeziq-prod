"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

function SidebarWrapper({ children }: Props) {
  const pathname = usePathname();
  const [defaultOpen, setDefaultOpen] = useState(true);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Determine if we're on the dashboard page
    const isDashboardPage = pathname === "/dashboard";
    setDefaultOpen(isDashboardPage);
  }, [pathname]);

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if user is not authenticated
  if (!user) {
    router.push("/auth/sign-up");
    return null;
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
  );
}

export default SidebarWrapper;
