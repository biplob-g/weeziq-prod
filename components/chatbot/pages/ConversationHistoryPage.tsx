"use client";

import React from "react";
import { Button } from "../../ui/button";
import { MessageSquare } from "lucide-react";

interface ChatRoom {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  message: Array<{
    id: string;
    message: string;
    role: "OWNER" | "CUSTOMER";
    createdAt: Date;
  }>;
}

interface ConversationHistoryPageProps {
  chatRooms?: ChatRoom[];
  customerName: string;
  onContinueChat: (chatRoomId: string) => void;
  onStartNewChat: () => void;
  isLoading: boolean;
}

const ConversationHistoryPage: React.FC<ConversationHistoryPageProps> = ({
  chatRooms,
  customerName,
  onContinueChat,
  onStartNewChat,
  isLoading,
}) => {
  // ✅ NEW: Format time using user's local timezone
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ NEW: Get conversation preview (last message or first message)
  const getConversationPreview = (messages: ChatRoom["message"]) => {
    if (messages.length === 0) return "No messages";

    // Get the last message for preview
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.message.substring(0, 100);
    return preview.length === 100 ? `${preview}...` : preview;
  };

  // ✅ NEW: Get the last message time for display
  const getLastMessageTime = (messages: ChatRoom["message"]) => {
    if (messages.length === 0) return null;
    return messages[messages.length - 1].createdAt;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">
            Loading conversations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header - Orange bar like in the image */}
      <div className="bg-orange-500 text-white p-4 flex items-center justify-between">
        <h3 className="font-bold text-lg">Your Chats</h3>
        <MessageSquare className="w-5 h-5" />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chatRooms && chatRooms.length > 0 ? (
          <div className="p-4 space-y-3">
            {chatRooms.map((chatRoom, _index) => (
              <div
                key={chatRoom.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onContinueChat(chatRoom.id)}
              >
                {/* Profile Icon - Black circle with orange bars */}
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="flex flex-col gap-1">
                    <div className="w-3 h-1 bg-orange-500 rounded"></div>
                    <div className="w-3 h-1 bg-orange-500 rounded"></div>
                  </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">
                      {customerName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(
                        getLastMessageTime(chatRoom.message) ||
                          chatRoom.createdAt
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {getConversationPreview(chatRoom.message)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center space-y-4">
              <div className="text-4xl">💬</div>
              <h3 className="text-lg font-medium text-gray-900">
                No previous conversations
              </h3>
              <p className="text-sm text-gray-500">
                Start a new conversation to get help
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button - New Conversation */}
      <div className="p-4 border-t">
        <Button
          onClick={onStartNewChat}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
        >
          Start New Conversation
        </Button>
      </div>
    </div>
  );
};

export default ConversationHistoryPage;
