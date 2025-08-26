"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { MessageSquare, Clock, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  message: string;
  role: "OWNER" | "CUSTOMER";
  createdAt: Date;
}

interface ChatHistoryProps {
  messages: ChatMessage[];
  customerName: string;
  onContinueChat: () => void;
  onStartNewChat: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  customerName,
  onContinueChat,
  onStartNewChat,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleIcon = (role: "OWNER" | "CUSTOMER") => {
    return role === "OWNER" ? (
      <Bot className="w-4 h-4 text-blue-600" />
    ) : (
      <User className="w-4 h-4 text-green-600" />
    );
  };

  const getRoleLabel = (role: "OWNER" | "CUSTOMER") => {
    return role === "OWNER" ? "Assistant" : "You";
  };

  // ✅ Fix: Handle empty messages
  const hasMessages = messages && messages.length > 0;
  const displayMessages = hasMessages ? messages.slice(-5) : [];

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg font-semibold text-gray-800">
            Welcome back, {customerName}! 👋
          </CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          {hasMessages
            ? "We found your previous conversation from the last 14 days"
            : "Welcome back! You can start a new conversation or continue from where you left off"}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chat History Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              {hasMessages
                ? `Previous conversation (${messages.length} messages)`
                : "No previous messages found"}
            </span>
          </div>

          {hasMessages ? (
            <ScrollArea className="h-48 w-full rounded-md border p-3">
              <div className="space-y-3">
                {displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 items-start",
                      message.role === "OWNER" ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "flex flex-col gap-1 max-w-[80%] p-2 rounded-lg text-sm",
                        message.role === "OWNER"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-600 text-white"
                      )}
                    >
                      <div className="flex items-center gap-1 text-xs opacity-70">
                        {getRoleIcon(message.role)}
                        <span>{getRoleLabel(message.role)}</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        {message.message.length > 100
                          ? `${message.message.substring(0, 100)}...`
                          : message.message}
                      </p>
                      <span className="text-xs opacity-60">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-48 w-full rounded-md border p-3 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No previous messages to show</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onContinueChat}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!hasMessages}
          >
            {hasMessages ? "Continue Chat" : "Start Chat"}
          </Button>
          <Button onClick={onStartNewChat} variant="outline" className="flex-1">
            Start New
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Your chat history is stored for 14 days for your convenience
        </p>
      </CardContent>
    </Card>
  );
};

export default ChatHistory;
