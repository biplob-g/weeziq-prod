import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/provider/theme-provider";
import PageTracker from "@/components/PageTracker";
import React from "react";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Add weights as needed
  display: "swap",
});

export const metadata: Metadata = {
  title: "WeezIQ",
  description: "Your one stop AI Chatbot Sales Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={dmSans.className} suppressHydrationWarning>
        <body className={`antialiased`} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <PageTracker />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
