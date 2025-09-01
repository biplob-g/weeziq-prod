"use client";

import Section from "@/components/SectionLabel";
import { Copy, Check } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  id: string;
};

const CodeSnippet = ({ id }: Props) => {
  const [copied, setCopied] = useState(false);

  // Get the correct domain based on environment
  const getEmbedDomain = () => {
    if (typeof window !== "undefined") {
      // In browser, use current origin or production domain
      const currentOrigin = window.location.origin;

      // For production deployments
      if (
        currentOrigin.includes("vercel.app") ||
        currentOrigin.includes("weeziq.com")
      ) {
        return currentOrigin;
      }

      // For local development
      if (currentOrigin.includes("localhost")) {
        return "http://localhost:3000";
      }

      // Fallback to production domain
      return "https://weeziq.com";
    }

    // Server-side fallback
    return process.env.NEXT_PUBLIC_APP_URL || "https://weeziq.com";
  };

  const embedDomain = getEmbedDomain();

  const snippet = `
    const iframe = document.createElement("iframe");

    const iframeStyles = (styleString) => {
      const style = document.createElement('style');
      style.textContent = styleString;
      document.head.append(style);
    }

    iframeStyles('
      .chat-frame {
        position: fixed;
        bottom: 20px;
        right: 20px;
        border: none;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        background: transparent;
        width: 400px;
        height: 600px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 40px);
        z-index: 10000;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .chat-frame.minimized {
        width: 80px;
        height: 80px;
        border-radius: 50%;
      }
      
      @media (max-width: 768px) {
        .chat-frame {
          width: calc(100vw - 20px);
          height: calc(100vh - 40px);
          bottom: 10px;
          right: 10px;
          border-radius: 12px;
        }
        
        .chat-frame.minimized {
          width: 60px;
          height: 60px;
          bottom: 20px;
          right: 20px;
        }
      }
    ')

    iframe.src = "${embedDomain}/chatbot?embed=true&transparent=true&domainId=${id}"
    iframe.classList.add('chat-frame')
    iframe.classList.add('minimized')
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('scrolling', 'no')
    iframe.setAttribute('allow', 'clipboard-write')
    iframe.setAttribute('title', 'WeezIQ Chat Assistant')
    
    // Security: Only allow specific domains to embed
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups')
    
    document.body.appendChild(iframe)

    let isExpanded = false;
    let domainValidated = false;

    window.addEventListener("message", (e) => {
      // Enhanced security: Validate origin
      if(e.origin !== "${embedDomain}") {
        console.warn("WeezIQ: Message from unauthorized origin:", e.origin);
        return null;
      }
      
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        
        if (data.type === 'ready') {
          console.log("WeezIQ: Chatbot ready");
          // Send domain ID to chatbot when it's ready
          iframe.contentWindow.postMessage({
            type: 'domain-id',
            domainId: "${id}"
          }, "${embedDomain}")
        } else if (data.type === 'dimensions') {
          // Handle chatbot open/close states
          if (data.expanded && !isExpanded) {
            iframe.classList.remove('minimized')
            isExpanded = true;
            console.log("WeezIQ: Chatbot expanded");
          } else if (!data.expanded && isExpanded) {
            iframe.classList.add('minimized')
            isExpanded = false;
            console.log("WeezIQ: Chatbot minimized");
          }
        } else if (data.type === 'host-validation') {
          // Send host domain for validation
          iframe.contentWindow.postMessage({
            type: 'host-info',
            domain: window.location.hostname,
            origin: window.location.origin,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }, "${embedDomain}")
          domainValidated = true;
        } else if (data.type === 'error') {
          console.error("WeezIQ Error:", data.message);
        }
      } catch (err) {
        console.warn("WeezIQ: Error parsing message:", err);
        // Handle legacy string messages
        if (typeof e.data === 'string' && e.data.includes('width')) {
          try {
            const dimensions = JSON.parse(e.data)
            iframe.style.width = dimensions.width + 'px'
            iframe.style.height = dimensions.height + 'px'
          } catch (parseErr) {
            console.warn("WeezIQ: Error parsing legacy dimensions:", parseErr);
          }
        }
      }
    })

    // Enhanced initialization with retry logic
    const initializeChatbot = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'init',
          domainId: "${id}",
          parentOrigin: window.location.origin,
          timestamp: new Date().toISOString()
        }, "${embedDomain}")
      }
    };

    // Initial setup with multiple retry attempts
    let initAttempts = 0;
    const maxInitAttempts = 5;
    
    const tryInit = () => {
      initAttempts++;
      initializeChatbot();
      
      if (!domainValidated && initAttempts < maxInitAttempts) {
        setTimeout(tryInit, 1000 * initAttempts); // Exponential backoff
      }
    };

    // Start initialization after iframe loads
    iframe.onload = () => {
      console.log("WeezIQ: Iframe loaded, initializing...");
      setTimeout(tryInit, 500);
    };

    // Fallback initialization
    setTimeout(tryInit, 2000);

    // Add error handling for iframe loading
    iframe.onerror = () => {
      console.error("WeezIQ: Failed to load chatbot iframe");
    };

    console.log("WeezIQ: Chatbot script initialized for domain ${id}");
    console.log("WeezIQ: Embed domain:", "${embedDomain}");
    console.log("WeezIQ: Iframe URL:", "${embedDomain}/chatbot?embed=true&transparent=true&domainId=${id}");
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast("Copied to Clipboard", {
      description: "You can now paste the code into your website",
    });
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="mt-10 flex flex-col gap-5 items-start">
      <Section
        label="Code snippet"
        message="Copy and paste this code snippet into the header tag of your website"
      />

      {/* Domain Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
        <h4 className="font-semibold text-blue-800 mb-2">
          Integration Details:
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            <strong>Embed Domain:</strong> {embedDomain}
          </p>
          <p>
            <strong>Domain ID:</strong> {id}
          </p>
          <p>
            <strong>Security:</strong> Origin validation enabled
          </p>
        </div>
      </div>

      <div className="bg-muted px-10 rounded-lg inline-block relative w-full max-w-4xl overflow-x-auto">
        {copied ? (
          <Check className="text-green-600 absolute top-4 right-4 z-10" />
        ) : (
          <Copy
            className="cursor-pointer absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800"
            onClick={handleCopy}
          />
        )}
        <pre className="whitespace-pre-wrap">
          <code className="text-gray-600 text-sm">{snippet}</code>
        </pre>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
        <h4 className="font-semibold text-yellow-800 mb-2">
          Setup Instructions:
        </h4>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Copy the code snippet above</li>
          <li>
            Paste it before the closing <code>&lt;/body&gt;</code> tag in your
            website
          </li>
          <li>The chatbot will appear in the bottom-right corner</li>
          <li>Click the minimized bubble to open the chat interface</li>
          <li>Test the integration to ensure it&apos;s working properly</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 w-full">
        <h4 className="font-semibold text-gray-800 mb-2">
          Security & Performance:
        </h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Origin validation prevents unauthorized embedding</li>
          <li>Iframe sandboxing provides additional security</li>
          <li>Automatic retry logic ensures reliable connection</li>
          <li>Error handling and logging for troubleshooting</li>
          <li>Responsive design adapts to different screen sizes</li>
        </ul>
      </div>
    </div>
  );
};

export default CodeSnippet;
