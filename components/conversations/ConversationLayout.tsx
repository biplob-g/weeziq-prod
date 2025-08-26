"use client";

import React, { useState } from "react";
import ConversationList from "./ConversationList";
import ConversationView from "./ConversationView";
import UserInfoPanel from "./UserInfoPanel";
import { Button } from "../ui/button";
import { ChevronRight, User } from "lucide-react";

type Props = {
  domains?:
    | {
        name: string;
        id: string;
        icon: string;
      }[]
    | undefined;
  initialRoomId?: string;
  initialChatRooms?: any;
  initialChatMessages?: any;
  initialSelectedConversation?: SelectedConversation | null;
};

export interface SelectedConversation {
  chatRoomId: string;
  customerId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerCountryCode?: string | null;
  customerIpAddress?: string | null;
}

const ConversationLayout = ({
  domains,
  initialRoomId,
  initialChatRooms,
  initialChatMessages,
  initialSelectedConversation,
}: Props) => {
  const [selectedConversation, setSelectedConversation] =
    useState<SelectedConversation | null>(initialSelectedConversation || null);

  // Sidebar state - closed by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleConversationSelect = (conversation: SelectedConversation) => {
    setSelectedConversation(conversation);
    // Auto-open sidebar when a conversation is selected
    setIsSidebarOpen(true);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="w-full h-full flex bg-background">
      {/* Column 1: Contact List */}
      <div className="w-80 flex-shrink-0 border-r border-border bg-card">
        <ConversationList
          domains={domains}
          onConversationSelect={handleConversationSelect}
          selectedConversationId={selectedConversation?.chatRoomId}
          initialRoomId={initialRoomId}
          initialChatRooms={initialChatRooms}
        />
      </div>

      {/* Column 2: Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        <ConversationView
          selectedConversation={selectedConversation}
          initialChatMessages={initialChatMessages}
        />

        {/* Sidebar Toggle Button - positioned on the right edge of chat window */}
        <div className="absolute right-0 top-4 z-10">
          <Button
            onClick={toggleSidebar}
            variant="outline"
            size="sm"
            className="rounded-l-lg rounded-r-none border-r-0 shadow-md hover:shadow-lg transition-all duration-200"
            title={isSidebarOpen ? "Close customer info" : "Open customer info"}
          >
            {isSidebarOpen ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Column 3: Contact Details Panel - Collapsible Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out border-l border-border bg-card ${
          isSidebarOpen
            ? "w-80 opacity-100 translate-x-0"
            : "w-0 opacity-0 translate-x-full overflow-hidden"
        }`}
      >
        {isSidebarOpen && (
          <UserInfoPanel selectedConversation={selectedConversation} />
        )}
      </div>
    </div>
  );
};

export default ConversationLayout;
