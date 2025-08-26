import {
  ChatBotMessageProps,
  UserInfoFormProps,
} from "@/schemas/coversation.schema";
import React, { forwardRef, useEffect, useState } from "react";
import { UseFormRegister } from "react-hook-form";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import RealTimeMode from "./realtime";
import Image from "next/image";
import TabsMenu from "../tabs";
import { BOT_TABS_MENU } from "@/constants/menu";
import { Paperclip, Send } from "lucide-react";
import Bubble from "./bubble";
import { Responding } from "./responding";
import { Separator } from "../ui/separator";
import { TabsContent } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { CardDescription, CardTitle } from "../ui/card";
import Accordion from "../accordion";
import Link from "next/link";
import UserInfoForm from "./UserInfoForm";
import ConversationHistoryPage from "./pages/ConversationHistoryPage";
import SatisfactionRating from "./SatisfactionRating";
import socketClient from "@/lib/socketClient";
import { cn } from "@/lib/utils";

type BotWindowProps = {
  register: UseFormRegister<ChatBotMessageProps>;
  chats: {
    role: "assistant" | "user";
    content: string;
    link?: string;
  }[];
  onChat(): void;
  onResponding: boolean;
  domainName: string;
  domainId: string; // ✅ NEW: Added domainId prop
  theme?: string | null;
  textColor?: string | null;
  help?: boolean;
  realtimeMode:
    | {
        chatroom: string;
        mode: boolean;
      }
    | undefined;
  helpdesk: {
    id: string;
    question: string;
    answered: string;
    domainId: string | null;
  }[];
  setChat: React.Dispatch<
    React.SetStateAction<
      {
        role: "user" | "assistant";
        content: string;
        link?: string | undefined;
      }[]
    >
  >;
  showUserInfoForm?: boolean;
  showChatHistory?: boolean;
  onUserInfoSubmit?: (data: UserInfoFormProps) => void;
  onContinueChat?: () => void;
  onStartNewChat?: () => void;
  loading?: boolean;
  isCheckingIP?: boolean;
  chatHistory?: {
    messages: Array<{
      id: string;
      message: string;
      role: "OWNER" | "CUSTOMER";
      createdAt: Date;
    }>;
  } | null;
  currentCustomer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    countryCode: string;
  } | null;
  // ✅ NEW: Multiple chat rooms support
  allChatRooms?: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    message: Array<{
      id: string;
      message: string;
      role: "OWNER" | "CUSTOMER";
      createdAt: Date;
    }>;
  }> | null;
  // ✅ NEW: Embed mode prop
  isEmbedMode?: boolean;
  // ✅ NEW: Multi-page props
  pageState?: {
    currentPage: string;
    previousPage: string | null;
    pageData: {
      history: { conversations: unknown[]; customer: unknown };
      chat: { messages: unknown[]; isTyping: boolean };
      helpdesk: {
        questions: unknown[];
        selectedCategory: string;
        searchQuery: string;
      };
      answer: { question: unknown; answer: unknown; related: unknown[] };
    };
    navigation: { canGoBack: boolean; breadcrumbs: string[] };
  };
  onNavigateToPage?: (page: string, data?: Record<string, unknown>) => void;
  onNavigateBack?: () => void;
  onUpdatePageData?: (page: string, data: Record<string, unknown>) => void;
};

const BotWindow = forwardRef<HTMLDivElement, BotWindowProps>(
  (
    {
      register,
      chats,
      onChat,
      onResponding,
      domainName,
      domainId, // ✅ NEW: Added domainId
      theme,
      textColor,
      help,
      realtimeMode,
      helpdesk,
      setChat,
      showUserInfoForm = false,
      showChatHistory = false,
      onUserInfoSubmit,
      onContinueChat,
      onStartNewChat,
      loading = false,
      isCheckingIP = false,
      chatHistory,
      currentCustomer,
      allChatRooms, // ✅ NEW: Added allChatRooms
      isEmbedMode = false, // ✅ NEW: Added isEmbedMode parameter
    },
    ref
  ) => {
    // ✅ NEW: State for visitor tracking and satisfaction rating
    const [visitorId] = useState(
      () => `visitor_${Math.random().toString(36).substr(2, 9)}`
    );
    const [showSatisfactionRating, setShowSatisfactionRating] = useState(false);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());
    const [inactivityTimer, setInactivityTimer] =
      useState<NodeJS.Timeout | null>(null);

    // ✅ NEW: Visitor tracking effect
    useEffect(() => {
      if (domainId) {
        // Join domain as visitor when widget opens
        socketClient.joinDomainAsVisitor(domainId, visitorId, {
          socketId: socketClient.getSocket()?.id,
          userAgent: navigator.userAgent,
          timestamp: new Date(),
        });

        // Set up activity tracking
        const updateActivity = () => {
          setLastActivityTime(Date.now());
          socketClient.sendVisitorActivity(domainId, visitorId);
        };

        // Track user activity
        const events = [
          "mousedown",
          "mousemove",
          "keypress",
          "scroll",
          "touchstart",
        ];
        events.forEach((event) => {
          document.addEventListener(event, updateActivity, true);
        });

        // Set up inactivity timer (20 minutes = 1200000ms)
        const startInactivityTimer = () => {
          if (inactivityTimer) clearTimeout(inactivityTimer);

          const timer = setTimeout(() => {
            if (chats.length > 0) {
              // Only show if there's been conversation
              setShowSatisfactionRating(true);
            }
          }, 1200000); // 20 minutes

          setInactivityTimer(timer);
        };

        startInactivityTimer();

        // Cleanup on unmount
        return () => {
          events.forEach((event) => {
            document.removeEventListener(event, updateActivity, true);
          });

          if (inactivityTimer) clearTimeout(inactivityTimer);

          // Leave domain when widget closes
          socketClient.leaveDomainAsVisitor(domainId, visitorId);
        };
      }
    }, [domainId, visitorId, chats.length]);

    // ✅ NEW: Reset inactivity timer when there's activity
    useEffect(() => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        const timer = setTimeout(() => {
          if (chats.length > 0) {
            setShowSatisfactionRating(true);
          }
        }, 1200000);
        setInactivityTimer(timer);
      }
    }, [lastActivityTime, chats.length]);

    // ✅ NEW: Handle satisfaction rating submission
    const handleSatisfactionSubmit = async (
      rating: "positive" | "negative",
      feedback?: string
    ) => {
      try {
        // Send the rating to the API
        const response = await fetch("/api/satisfaction-rating", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            feedback,
            domainId,
            visitorId,
            customerId: currentCustomer?.id || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit rating");
        }

        const result = await response.json();
        console.log("✅ Satisfaction rating submitted successfully:", result);

        setShowSatisfactionRating(false);
      } catch (error) {
        console.error("❌ Error submitting satisfaction rating:", error);
        // Still close the rating dialog even if there's an error
        setShowSatisfactionRating(false);
      }
    };

    // ✅ Debug: Monitor chat state changes
    useEffect(() => {
      //
    }, [
      chats,
      showChatHistory,
      showUserInfoForm,
      chatHistory,
      currentCustomer,
      isCheckingIP,
    ]);

    return (
      <div
        className={cn(
          "flex flex-col rounded-xl border-[1px] overflow-hidden shadow-lg chat-window",
          isEmbedMode
            ? "h-[600px] w-full bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100"
            : "h-[800px] w-[400px] mr-[80px] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100"
        )}
      >
        {/* ✅ ENHANCED: More colorful header with vibrant gradient */}
        <div className="flex justify-between px-4 pt-4 pb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-t-xl shadow-lg">
          <div className="flex gap-2">
            <Avatar className="w-10 h-10 border-2 border-white shadow-md">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold shadow-md">
                AI
              </AvatarFallback>
            </Avatar>

            <div className="flex items-start flex-col">
              <h3 className="text-lg font-bold leading-none mt-3 text-white">
                Sales Rep - WeezIQ
              </h3>
              <p className="text-sm text-blue-100">
                {domainName.split(".com")[0]}
              </p>
              {realtimeMode?.mode && (
                <RealTimeMode
                  setChats={setChat}
                  chatRoomId={realtimeMode.chatroom}
                />
              )}
            </div>
          </div>
          <div className="relative w-16 h-16 mt-[-10px]">
            <Image
              src="https://ucarecdn.com/0dda3228-ad1e-42e9-aef2-8f69696458ed/users.jpg"
              fill
              alt="users"
              objectFit="contain"
            />
          </div>
        </div>

        {/* ✅ NEW: Satisfaction Rating Overlay */}
        {showSatisfactionRating && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <SatisfactionRating
              onSubmit={handleSatisfactionSubmit}
              onClose={() => setShowSatisfactionRating(false)}
            />
          </div>
        )}

        {/* ✅ NEW: Show loading state while checking IP */}
        {isCheckingIP ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                Checking for previous conversations...
              </p>
            </div>
          </div>
        ) : showUserInfoForm ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <UserInfoForm onSubmit={onUserInfoSubmit!} loading={loading} />
          </div>
        ) : showChatHistory && allChatRooms && currentCustomer ? (
          <ConversationHistoryPage
            chatRooms={allChatRooms}
            customerName={currentCustomer.name}
            onContinueChat={onContinueChat!}
            onStartNewChat={onStartNewChat!}
            isLoading={loading}
          />
        ) : (
          <TabsMenu triggers={BOT_TABS_MENU} classname=" bg-transparent m-2">
            <TabsContent value="chat">
              <Separator orientation="horizontal" />
              <div className="flex flex-col h-full">
                <div
                  style={{
                    background: theme || "",
                    color: textColor || "",
                  }}
                  className="px-3 flex h-[400px] flex-col py-5 gap-3 chat-window overflow-y-auto bg-gradient-to-b from-purple-100 via-pink-50 to-blue-100"
                  ref={ref}
                >
                  {/* ✅ Debug: Show chat count */}
                  {chats.length > 0 && (
                    <div className="text-xs text-purple-800 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 px-3 py-2 rounded-lg mb-2 border border-purple-300 shadow-md">
                      Debug: {chats.length} messages loaded
                    </div>
                  )}

                  {chats
                    .filter((chat) => chat && chat.role && chat.content) // ✅ Filter out invalid messages
                    .map((chat, key) => (
                      <Bubble
                        key={`${chat.role}-${key}-${chat.content?.substring(
                          0,
                          10
                        )}`}
                        message={chat}
                      />
                    ))}
                  {onResponding && <Responding />}
                </div>
                <form
                  onSubmit={onChat}
                  className="flex px-3 py-1 flex-col flex-1 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 border-t border-purple-300 shadow-inner"
                >
                  <div className="flex justify-between">
                    <Input
                      {...register("content")}
                      placeholder="Type your message..."
                      className="focus-visible:ring-2 focus-visible:ring-purple-500 flex-1 p-3 focus-visible:ring-offset-0 bg-white rounded-lg outline-none border border-purple-200 shadow-md"
                    />
                    <Button
                      type="submit"
                      className="cursor-pointer ml-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-lg px-4 py-2 shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <Label htmlFor="upload" className="flex flex-row">
                    <Paperclip />
                    <Input
                      type="file"
                      id="upload"
                      {...register("image")}
                      className="hidden"
                    />
                  </Label>
                </form>
              </div>
            </TabsContent>
            {help && (
              <TabsContent value="helpdesk" className="cursor-pointer">
                <div className="cursor-pointer h-[485px] overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
                  <div>
                    <CardTitle className="cursor-pointer">Help Desk</CardTitle>
                    <CardDescription>
                      Browse from a list of questions people usually ask.
                    </CardDescription>
                  </div>
                  <Separator orientation="horizontal" />
                  {helpdesk.map((desk) => (
                    <Accordion
                      key={desk.id}
                      id={desk.id}
                      trigger={desk.question}
                      content={desk.answered}
                    />
                  ))}
                </div>
              </TabsContent>
            )}
          </TabsMenu>
        )}

        <div className="flex justify-center">
          <p className="text-xs text-gray-500">
            Powered by
            <Link
              target="_blank"
              className="ml-1 text-primary"
              href="https://weeziq.com"
            >
              WeezIQ.com
            </Link>
          </p>
        </div>
      </div>
    );
  }
);

export default BotWindow;
BotWindow.displayName = "BotWindow";
