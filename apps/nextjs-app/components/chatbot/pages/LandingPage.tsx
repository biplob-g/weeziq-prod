"use client";

import React from "react";
import { Button } from "../../ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";

interface LandingPageProps {
  hasPreviousMessages: boolean;
  customerName: string;
  onNavigateToPage: (page: string) => void;
  onStartNewChat: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  hasPreviousMessages,
  customerName: _customerName,
  onNavigateToPage,
  onStartNewChat,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Main Content - Three Button Layout */}
      <div className="flex-1 p-6">
        <div className="space-y-4">
          {/* Previous Conversations Button - Only show if user has previous messages */}
          {hasPreviousMessages && (
            <Button
              onClick={() => {
                //
                onNavigateToPage("history");
              }}
              variant="outline"
              className="w-full h-14 text-left justify-start gap-3"
            >
              <ArrowRight className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Previous conversations</span>
                <span className="text-xs text-muted-foreground">
                  Continue from where you left off
                </span>
              </div>
            </Button>
          )}

          {/* Help Center Button - Always visible */}
          <Button
            onClick={() => onNavigateToPage("helpdesk")}
            variant="outline"
            className="w-full h-14 text-left justify-start gap-3"
          >
            <MessageSquare className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Help Center</span>
              <span className="text-xs text-muted-foreground">
                Browse help articles and FAQs
              </span>
            </div>
          </Button>

          {/* New Conversation Button - Always visible */}
          <Button
            onClick={onStartNewChat}
            className="w-full h-14 text-left justify-start gap-3 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ArrowRight className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-medium">New conversation</span>
              <span className="text-xs opacity-90">
                Start a fresh chat with support
              </span>
            </div>
          </Button>
        </div>

        {/* Welcome message */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            How can we help you today?
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
