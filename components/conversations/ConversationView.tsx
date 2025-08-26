"use client";

import React from "react";
import { useChatWindow } from "@/hooks/conversation/useConversation";
import { Loader } from "../loader";
import Bubble from "../chatbot/bubble";
import { Button } from "../ui/button";
import { PaperclipIcon } from "lucide-react";
import { Input } from "../ui/input";
import { SelectedConversation } from "./ConversationLayout";
import { Avatar, AvatarFallback } from "../ui/avatar";

type Props = {
  selectedConversation: SelectedConversation | null;
  initialChatMessages?: any;
};

const ConversationView = ({
  selectedConversation,
  initialChatMessages,
}: Props) => {
  const {
    messageWindowRef,
    chats,
    loading,
    chatRoom,
    onHandleSentMessage,
    register,
    setChats,
  } = useChatWindow();

  // Initialize with server-side chat messages
  React.useEffect(() => {
    if (
      initialChatMessages &&
      initialChatMessages.length > 0 &&
      chats.length === 0
    ) {
      const messages = initialChatMessages[0]?.message || [];
      const formattedChats = messages.map((msg: any) => ({
        id: msg.id,
        message: msg.message,
        role: msg.role === "OWNER" ? "assistant" : "user",
        createdAt: msg.createdAt,
        seen: msg.seen,
      }));
      setChats(formattedChats);
    }
  }, [initialChatMessages, chats.length, setChats]);

  // Generate avatar from customer name
  const getAvatarInitials = (name: string | null | undefined): string => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-6xl">💬</div>
          <h3 className="text-xl font-semibold text-foreground">
            Select a conversation
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Choose a conversation from the list to start viewing and responding
            to messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Conversation Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {getAvatarInitials(selectedConversation.customerName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {selectedConversation.customerName || "Unknown Customer"}
          </h3>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <Loader loading={loading && chats.length === 0}>
          <div
            ref={messageWindowRef}
            className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto bg-background"
          >
            {chats.length ? (
              chats.map((chat) => (
                <Bubble
                  key={chat.id}
                  message={{
                    role: chat.role!,
                    content: chat.message,
                    createdAt: chat.createdAt,
                  }}
                />
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="text-4xl">📝</div>
                  <p className="text-muted-foreground font-medium">
                    No messages yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start the conversation by sending a message.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Loader>
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-background">
        <form
          onSubmit={onHandleSentMessage}
          className="flex items-center gap-3 p-4"
        >
          <button
            type="button"
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            tabIndex={-1}
          >
            <PaperclipIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            tabIndex={-1}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
          <Input
            {...register("content")}
            placeholder="You are welcome!"
            className="flex-1 focus-visible:ring-1 bg-muted/50 border-0"
            disabled={!chatRoom}
          />
          <Button
            type="submit"
            className="w-10 h-10 p-0 rounded-full bg-primary hover:bg-primary/90"
            disabled={!chatRoom}
          >
            <svg
              className="h-4 w-4 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConversationView;
