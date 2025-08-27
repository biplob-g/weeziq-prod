"use client";

import React from "react";
import { UseFormRegister } from "react-hook-form";
import { ChatBotMessageProps } from "@/schemas/coversation.schema";
import Bubble from "../bubble";
import { Responding } from "../responding";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Paperclip, Send } from "lucide-react";
import { Separator } from "../../ui/separator";

interface ChatInterfacePageProps {
  chats: {
    role: "assistant" | "user";
    content: string;
    link?: string;
  }[];
  register: UseFormRegister<ChatBotMessageProps>;
  onChat: () => void;
  onResponding: boolean;
  theme?: string | null;
  textColor?: string | null;
  messageWindowRef: React.RefObject<HTMLDivElement>;
}

const ChatInterfacePage: React.FC<ChatInterfacePageProps> = ({
  chats,
  register,
  onChat,
  onResponding,
  theme,
  textColor,
  messageWindowRef,
}) => {
  return (
    <div className="flex flex-col h-full">
      <Separator orientation="horizontal" />
      <div className="flex flex-col h-full">
        {/* Chat Messages Area */}
        <div
          style={{
            background: theme || "",
            color: textColor || "",
          }}
          className="px-3 flex h-[400px] flex-col py-5 gap-3 chat-window overflow-y-auto"
          ref={messageWindowRef}
        >
          {/* Debug: Show chat count */}
          {chats.length > 0 && (
            <div className="text-xs text-muted-foreground mb-2">
              Debug: {chats.length} messages loaded
            </div>
          )}

          {chats.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-4xl">👋</div>
                <h3 className="text-lg font-medium text-muted-foreground">
                  Welcome to our chat!
                </h3>
                <p className="text-sm text-muted-foreground">
                  How can we help you today?
                </p>
              </div>
            </div>
          ) : (
            chats
              .filter((chat) => chat && chat.role && chat.content) // Filter out invalid messages
              .map((chat, key) => (
                <Bubble
                  key={`${chat.role}-${key}-${chat.content?.substring(0, 10)}`}
                  message={chat}
                />
              ))
          )}
          {onResponding && <Responding />}
        </div>

        {/* Input Form */}
        <form
          onSubmit={onChat}
          className="flex px-3 py-1 flex-col flex-1 bg-porcelain"
        >
          <div className="flex justify-between">
            <Input
              {...register("content")}
              placeholder="Type your message..."
              className="flex-1 p-2 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white rounded-lg outline-none border-none mr-2"
            />
            <Button
              type="button"
              className="p-2 bg-transparent hover:bg-gray-100 rounded-full"
            >
              <Paperclip className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500 ml-2">
              Press Enter to send • Esc to go back • Ctrl+2 for help
            </p>
            <Button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4 mr-1" />
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterfacePage;
