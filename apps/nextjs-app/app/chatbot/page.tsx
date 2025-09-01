"use client";

import AiChatBot from "@/components/chatbot";
import EmbedChatBot from "@/components/chatbot/EmbedChatBot";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

const ChatBotContent = () => {
  const searchParams = useSearchParams();
  const [isEmbedMode, setIsEmbedMode] = useState(false);

  useEffect(() => {
    // Check if we're in an iframe
    const isInIframe = window !== window.parent;
    const embedParam = searchParams.get("embed") === "true";
    const transparentParam = searchParams.get("transparent") === "true";

    // Set embed mode
    const isEmbed = isInIframe || embedParam || transparentParam;
    setIsEmbedMode(isEmbed);

    // Handle domain ID - SIMPLE AND BULLETPROOF
    const domainIdFromURL =
      searchParams.get("domain") ||
      searchParams.get("id") ||
      searchParams.get("domainId");
    const existingDomainId = window.localStorage.getItem("chatbot-domain-id");

    if (domainIdFromURL) {
      // Store domain ID from URL
      window.localStorage.setItem("chatbot-domain-id", domainIdFromURL);
      window.localStorage.setItem("chatbot-embed-mode", "true");
      console.log("💾 Stored domain ID from URL:", domainIdFromURL);
    } else if (existingDomainId) {
      // Use existing domain ID
      console.log("🔍 Using existing domain ID:", existingDomainId);
      window.localStorage.setItem("chatbot-embed-mode", "true");
    }

    // Apply embed styles
    if (isEmbed) {
      document.documentElement.classList.add("chatbot-embed-mode");
      document.body.classList.add("chatbot-embed-mode");
    }

    // Simple iframe message handling
    if (isInIframe) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && typeof event.data === "string") {
          const domainId = event.data;

          // Simple UUID validation
          if (
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              domainId
            )
          ) {
            window.localStorage.setItem("chatbot-domain-id", domainId);
            window.localStorage.setItem("chatbot-embed-mode", "true");
            console.log("💾 Stored domain ID from iframe:", domainId);
          }
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [searchParams]);

  // Render based on embed mode
  if (isEmbedMode) {
    return <EmbedChatBot />;
  }

  return <AiChatBot />;
};

const ChatBot = () => {
  return (
    <Suspense fallback={<div>Loading chatbot...</div>}>
      <ChatBotContent />
    </Suspense>
  );
};

export default ChatBot;
