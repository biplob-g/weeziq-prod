"use client";

import AiChatBot from "@/components/chatbot";
import EmbedChatBot from "@/components/chatbot/EmbedChatBot";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

// ✅ FIXED: Global initialization lock to prevent multiple chatbot instances
let isChatbotInitialized = false;

// ✅ FIXED: Global flag to prevent continuous re-rendering
let isProcessingDomainId = false;

const ChatBotContent = () => {
  const searchParams = useSearchParams();
  const [isEmbedMode, setIsEmbedMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // ✅ FIXED: Prevent multiple initializations
    if (isChatbotInitialized || isInitialized) {
      //
      return;
    }
    // Check if we're in an iframe
    const isInIframe = window !== window.parent;
    const embedParam = searchParams.get("embed") === "true";
    const transparentParam = searchParams.get("transparent") === "true";

    console.log("🔍 Chatbot initialization:", {
      isInIframe,
      embedParam,
      transparentParam,
    });

    // ✅ NEW: Set embed mode state
    const isEmbed = isInIframe || embedParam || transparentParam;
    setIsEmbedMode(isEmbed);

    // ✅ FIXED: Handle domain ID from URL parameters immediately
    const domainIdFromURL =
      searchParams.get("domain") ||
      searchParams.get("id") ||
      searchParams.get("domainId");
    if (domainIdFromURL) {
      console.log("🔍 Domain ID from URL parameters:", domainIdFromURL);
      window.localStorage.setItem("chatbot-domain-id", domainIdFromURL);
      window.localStorage.setItem("chatbot-embed-mode", isEmbed.toString());
      console.log("💾 Stored domain ID in localStorage:", domainIdFromURL);
    } else {
      console.log("⚠️ No domain ID found in URL parameters");
    }

    // ✅ FIXED: Mark as initialized
    isChatbotInitialized = true;
    setIsInitialized(true);

    // ✅ NEW: Apply transparent styles if needed
    if (isEmbed) {
      document.documentElement.classList.add("chatbot-embed-mode");
      document.body.classList.add("chatbot-embed-mode");
    }

    if (isInIframe) {
      // ✅ Enhanced iframe handling with embed mode support

      // Send ready message to parent
      window.parent.postMessage(
        JSON.stringify({
          type: "ready",
          message: "Chatbot iframe is ready",
          isEmbedMode,
        }),
        "*"
      );

      // Request host validation for security
      window.parent.postMessage(
        JSON.stringify({
          type: "host-validation",
          message: "Request host domain info",
        }),
        "*"
      );

      // Listen for messages from parent
      const handleMessage = (event: MessageEvent) => {
        console.log("📨 Chatbot received message:", event);

        try {
          // Handle different message types
          if (event.data && typeof event.data === "object") {
            const data = event.data;

            if (data.type === "host-info") {
              // Store host information for domain validation
              console.log("🌐 Host domain info received:", data);
              window.localStorage.setItem("chatbot-host-domain", data.domain);
              window.localStorage.setItem("chatbot-host-origin", data.origin);
            }
          } else if (event.data && typeof event.data === "string") {
            // Handle domain ID messages (legacy and new format)
            let domainId: string;

            try {
              const parsed = JSON.parse(event.data);
              domainId = parsed.domainId || parsed;
            } catch {
              // Direct string domain ID
              domainId = event.data;
            }

            // Validate domain ID format (UUID)
            const isValidDomainId =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                domainId
              );

            if (isValidDomainId && !isProcessingDomainId) {
              console.log("✅ Valid domain ID received:", domainId);
              isProcessingDomainId = true;

              // Store domain ID for the chatbot component
              window.localStorage.setItem("chatbot-domain-id", domainId);
              window.localStorage.setItem(
                "chatbot-embed-mode",
                isEmbed.toString()
              );

              // Send confirmation back to parent
              window.parent.postMessage(
                JSON.stringify({
                  type: "ready",
                  domainId: domainId,
                  isEmbedMode: isEmbed,
                }),
                "*"
              );
            } else {
              console.warn(
                "⚠️ Invalid domain ID format or already processing:",
                domainId
              );
            }
          }
        } catch (error) {
          console.error("❌ Error processing message from parent:", error);
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    } else {
      // Not in iframe - use URL parameters
      const domainId =
        searchParams.get("domain") ||
        searchParams.get("id") ||
        searchParams.get("domainId");
      console.log("🔍 Chatbot page - Domain ID from URL:", domainId);

      if (domainId) {
        console.log("📨 Using URL domain ID:", domainId);
        window.localStorage.setItem("chatbot-domain-id", domainId);
        window.localStorage.setItem(
          "chatbot-embed-mode",
          isEmbedMode.toString()
        );
      }
    }
  }, [searchParams]);

  // ✅ NEW: Render different content based on embed mode
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
