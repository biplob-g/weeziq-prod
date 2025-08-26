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

    iframe.src = "http://localhost:3000/chatbot?embed=true&transparent=true&domainId=${id}"
    iframe.classList.add('chat-frame')
    iframe.classList.add('minimized')
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('scrolling', 'no')
    iframe.setAttribute('allow', 'clipboard-write')
    iframe.setAttribute('title', 'WeezIQ Chat Assistant')
    document.body.appendChild(iframe)

    let isExpanded = false;

    window.addEventListener("message", (e) => {
      if(e.origin !== "http://localhost:3000") return null
      
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        
        if (data.type === 'ready') {
          // Send domain ID to chatbot when it's ready
          iframe.contentWindow.postMessage("${id}", "http://localhost:3000/")
        } else if (data.type === 'dimensions') {
          // Handle chatbot open/close states
          if (data.expanded && !isExpanded) {
            iframe.classList.remove('minimized')
            isExpanded = true;
          } else if (!data.expanded && isExpanded) {
            iframe.classList.add('minimized')
            isExpanded = false;
          }
        } else if (data.type === 'host-validation') {
          // Send host domain for validation
          iframe.contentWindow.postMessage({
            type: 'host-info',
            domain: window.location.hostname,
            origin: window.location.origin
          }, "http://localhost:3000/")
        }
      } catch (err) {
        // Handle legacy string messages
        if (typeof e.data === 'string' && e.data.includes('width')) {
          const dimensions = JSON.parse(e.data)
          iframe.style.width = dimensions.width + 'px'
          iframe.style.height = dimensions.height + 'px'
        }
      }
    })

    // Initial setup - send domain ID after a brief delay
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage("${id}", "http://localhost:3000/")
      }
    }, 1000);

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
        message="Copy and paste this code snipped into the header tag of your website"
      />
      <div className="bg-muted px-10 rounded-lg inline-block relative">
        {copied ? (
          <Check className="text-gray-600 absolute top-4 right-4" />
        ) : (
          <Copy
            className="cursor-pointer absolute top-4 right-4"
            onClick={handleCopy}
          />
        )}
        <pre>
          <code className="text-gray-600">{snippet}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeSnippet;
