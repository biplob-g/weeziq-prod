import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/provider/theme-provider";
import PageTracker from "@/components/PageTracker";
import React from "react";
import Head from "next/head";

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
      <Head>
        {/* 
         Move the chatbot embed logic to a client-side React effect.
         This avoids invalid <script> usage in a React component and ensures
         the code only runs in the browser.
       */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  if (typeof window === "undefined") return;
  if (window.__weezIQChatbotInjected) return;
  window.__weezIQChatbotInjected = true;

  // Add style for responsive chat frame
  const style = document.createElement('style');
  style.textContent = \`
    .chat-frame {
      transition: all 0.3s ease;
    }
    .chat-frame.expanded {
      width: 400px !important;
      height: 600px !important;
      border-radius: 12px !important;
    }
    @media (max-width: 768px) {
      .chat-frame.expanded {
        width: 90vw !important;
        height: 80vh !important;
        left: 5vw !important;
        right: 5vw !important;
        bottom: 10vh !important;
      }
      .chat-frame.minimized {
        width: 60px;
        height: 60px;
        bottom: 20px;
        right: 20px;
      }
    }
  \`;
  document.head.appendChild(style);

  // Create the iframe
  const iframe = document.createElement('iframe');
  iframe.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    transition: all 0.3s ease;
    background: white;
  \`;
  iframe.src = "http://localhost:3000/chatbot?embed=true&transparent=true&domainId=ede79619-e4a2-45ff-a8e5-141bd7e6fba6";
  iframe.classList.add('chat-frame');
  iframe.classList.add('minimized');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('title', 'WeezIQ Chat Assistant');
  document.body.appendChild(iframe);

  let isExpanded = false;

  window.addEventListener("message", (e) => {
    if(e.origin !== "http://localhost:3000") return null;
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data.type === 'ready') {
        // Send domain ID to chatbot when it's ready
        iframe.contentWindow.postMessage("ede79619-e4a2-45ff-a8e5-141bd7e6fba6", "http://localhost:3000/");
      } else if (data.type === 'dimensions') {
        // Handle chatbot open/close states
        if (data.expanded && !isExpanded) {
          iframe.classList.remove('minimized');
          isExpanded = true;
        } else if (!data.expanded && isExpanded) {
          iframe.classList.add('minimized');
          isExpanded = false;
        }
      } else if (data.type === 'host-validation') {
        // Send host domain for validation
        iframe.contentWindow.postMessage({
          type: 'host-info',
          domain: window.location.hostname,
          origin: window.location.origin
        }, "http://localhost:3000/");
      }
    } catch (err) {
      // Handle legacy string messages
      if (typeof e.data === 'string' && e.data.includes('width')) {
        const dimensions = JSON.parse(e.data);
        iframe.style.width = dimensions.width + 'px';
        iframe.style.height = dimensions.height + 'px';
      }
    }
  });

  // Initial setup - send domain ID after a brief delay
  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage("ede79619-e4a2-45ff-a8e5-141bd7e6fba6", "http://localhost:3000/");
    }
  }, 1000);
})();
           `,
          }}
        />
      </Head>
      <html lang="en" className={dmSans.className} suppressHydrationWarning>
        <body className={`antialiased`} suppressHydrationWarning>
          <ThemeProvider>
            <PageTracker />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
