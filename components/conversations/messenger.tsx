"use client";

import { useChatWindow } from "@/hooks/conversation/useConversation";
import React, { useEffect, useState } from "react";
import { Loader } from "../loader";
import Bubble from "../chatbot/bubble";
import { Button } from "../ui/button";
import { PaperclipIcon, User, Mail, Phone } from "lucide-react";
import { Input } from "../ui/input";
import { onGetCustomerInfo } from "@/actions/conversation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const Messenger = () => {
  const {
    messageWindowRef,
    chats,
    loading,
    chatRoom,
    onHandleSentMessage,
    register,
  } = useChatWindow();

  const [customerInfo, setCustomerInfo] = useState<{
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    countryCode: string | null;
    domainId: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (chatRoom) {
        try {
          // Extract customer ID from chatRoom or get it from the chat context
          // For now, we'll need to modify the chat context to include customer info
          // This is a placeholder - you'll need to implement the actual logic
          const customerId = chatRoom; // This should be the actual customer ID
          const info = await onGetCustomerInfo(customerId);
          if (info) {
            setCustomerInfo(info);
          }
        } catch (error) {
          console.error("Error fetching customer info:", error);
        }
      }
    };

    fetchCustomerInfo();
  }, [chatRoom]);
  return (
    <div className="flex-1 flex flex-col h-8 relative">
      {/* Customer Information Card */}
      {customerInfo && (
        <Card className="mb-4 mx-4 mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-gray-600">
                    {customerInfo.name || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">
                    {customerInfo.email || "Not provided"}
                  </p>
                </div>
              </div>
              {customerInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-gray-600">
                      {customerInfo.countryCode} {customerInfo.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">Customer ID: {customerInfo.id}</Badge>
              {customerInfo.domainId && (
                <Badge variant="outline">Domain: {customerInfo.domainId}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 h-0 w-full flex flex-col">
        <Loader loading={loading}>
          <div
            ref={messageWindowRef}
            className="w-full flex-1 h-0 flex flex-col gap-3 pt-5 py-5 chat-window overflow-y-auto"
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
              <div>No chats selected</div>
            )}
          </div>
        </Loader>
      </div>
      <form
        onSubmit={onHandleSentMessage}
        className="flex px-3 pt-3 pb-10 flex-row items-center gap-2 backdrop-blur-sm bg-gray-200 w-full"
      >
        <button
          type="button"
          className="p-2 rounded hover:bg-orange-200 transition-colors"
          tabIndex={-1}
        >
          <PaperclipIcon />
        </button>
        <Input
          {...register("content")}
          placeholder="Type your message..."
          className="focus-visible:ring-0 flex-1 p-2 focus-visible:ring-offset-0 bg-white rounded-lg outline-none border-none "
        />
        <Button
          type="submit"
          className="ml-2 px-4 cursor-pointer"
          disabled={!chatRoom}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default Messenger;
