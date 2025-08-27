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

  // Get the app URL from environment variables
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const snippet = `
    <script>
      (function() {
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

        // Add CSS for responsive design
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
        \`

        iframe.src = "${appUrl}/chatbot?embed=true&transparent=true&domainId=${id}"
        iframe.classList.add('chat-frame')
        iframe.classList.add('minimized')
        iframe.setAttribute('frameborder', '0')
        iframe.setAttribute('scrolling', 'no')
        iframe.setAttribute('allow', 'clipboard-write')
        iframe.setAttribute('title', 'WeezIQ Chat Assistant')
        document.body.appendChild(iframe)

        let isExpanded = false;

        window.addEventListener("message", (e) => {
          if(e.origin !== "${appUrl}") return null
          
          try {
            const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
            
            if (data.type === 'ready') {
              // Send domain ID to chatbot when it's ready
              iframe.contentWindow.postMessage("${id}", "${appUrl}/")
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
              }, "${appUrl}/")
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
            iframe.contentWindow.postMessage("${id}", "${appUrl}/")
          }
        }, 1000);

      })();
    </script>
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
