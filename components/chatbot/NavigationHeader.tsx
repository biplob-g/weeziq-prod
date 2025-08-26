"use client";

import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, MessageSquare, Home, HelpCircle } from "lucide-react";
import type { ChatbotPage } from "@/hooks/chatbot/types";

interface NavigationHeaderProps {
  currentPage: ChatbotPage;
  canGoBack: boolean;
  onNavigateBack: () => void;
  onNavigateToPage: (page: ChatbotPage) => void;
  domainName: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentPage,
  canGoBack,
  onNavigateBack,
  onNavigateToPage,
  domainName,
}) => {
  const getPageTitle = (page: ChatbotPage) => {
    switch (page) {
      case "landing":
        return "Welcome";
      case "chat":
        return "Chat";
      case "helpdesk":
        return "Help Center";
      case "answer":
        return "Help Article";
      case "history":
        return "Conversation History";
      default:
        return "Support";
    }
  };

  return (
    <div className="flex flex-col bg-primary text-primary-foreground">
      {/* Header with back button and title */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack}
              className="text-primary-foreground hover:bg-primary-foreground/20 p-1 h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <div>
              <h3 className="font-semibold text-sm">{domainName} Support</h3>
              <p className="text-xs opacity-90">{getPageTitle(currentPage)}</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-1">
          {currentPage !== "landing" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToPage("landing")}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 p-2 h-8 w-8"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </Button>
          )}

          {currentPage !== "helpdesk" && currentPage !== "answer" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToPage("helpdesk")}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 p-2 h-8 w-8"
              title="Help Center"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
