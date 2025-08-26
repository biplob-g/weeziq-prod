"use client";

import React, { forwardRef, useEffect } from "react";
import { UseFormRegister } from "react-hook-form";
import {
  ChatBotMessageProps,
  UserInfoFormProps,
} from "@/schemas/coversation.schema";
import RealTimeMode from "./realtime";
import UserInfoForm from "./UserInfoForm";
import AnimatedPageContainer from "./AnimatedPageContainer";
import NavigationHeader from "./NavigationHeader";
import LandingPage from "./pages/LandingPage";
import ConversationHistoryPage from "./pages/ConversationHistoryPage";
import ChatInterfacePage from "./pages/ChatInterfacePage";
import HelpDeskListPage from "./pages/HelpDeskListPage";
import HelpDeskAnswerPage from "./pages/HelpDeskAnswerPage";
import type { ChatbotPage } from "@/hooks/chatbot/types";
import { cn } from "@/lib/utils";

type MultiPageBotWindowProps = {
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
        role: "assistant" | "user";
        content: string;
        link?: string;
      }[]
    >
  >;
  showUserInfoForm?: boolean;
  setShowUserInfoForm?: (show: boolean) => void;
  showChatHistory?: boolean;
  onUserInfoSubmit?: (data: UserInfoFormProps) => void;
  onContinueChat?: () => void;
  onStartNewChat?: () => void;
  loading?: boolean;
  isCheckingIP?: boolean;
  _chatHistory?: {
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
  setAllChatRooms?: React.Dispatch<
    React.SetStateAction<Array<{
      id: string;
      createdAt: Date;
      updatedAt: Date;
      message: Array<{
        id: string;
        message: string;
        role: "OWNER" | "CUSTOMER";
        createdAt: Date;
      }>;
    }> | null>
  >;
  // ✅ NEW: Embed mode prop
  isEmbedMode?: boolean;
  // Multi-page props
  pageState: {
    currentPage: ChatbotPage;
    previousPage: ChatbotPage | null;
    pageData: {
      landing: {
        hasPreviousMessages: boolean;
        customerName: string;
        lastMessage?: {
          message: string;
          createdAt: Date;
        };
      };
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
  onNavigateToPage: (page: ChatbotPage, data?: unknown) => void;
  onNavigateBack: () => void;
  onUpdatePageData: (page: ChatbotPage, data: unknown) => void;
};

const MultiPageBotWindow = forwardRef<HTMLDivElement, MultiPageBotWindowProps>(
  (
    {
      register,
      chats,
      onChat,
      onResponding,
      domainName,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      domainId, // ✅ NEW: Added domainId parameter
      theme,
      textColor,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      help,
      realtimeMode,
      helpdesk,
      setChat,
      showUserInfoForm = false,
      setShowUserInfoForm,
      showChatHistory = false,
      onUserInfoSubmit,
      onContinueChat,
      onStartNewChat,
      loading = false,
      isCheckingIP = false,
      _chatHistory, // ✅ NEW: Added allChatRooms parameter
      currentCustomer,
      allChatRooms, // ✅ NEW: Added allChatRooms parameter
      setAllChatRooms, // ✅ NEW: Added setAllChatRooms parameter
      isEmbedMode = false, // ✅ NEW: Added isEmbedMode parameter
      pageState,
      onNavigateToPage,
      onNavigateBack,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onUpdatePageData,
    },
    ref
  ) => {
    // Debug: Monitor state changes
    useEffect(() => {
      //
    }, [pageState]);

    // ✅ Add gesture and keyboard navigation
    // useGestureNavigation({
    //   currentPage: pageState.currentPage,
    //   canGoBack: pageState.navigation.canGoBack,
    //   onNavigateToPage,
    //   onNavigateBack,
    // });

    // ✅ Render current page based on state
    const renderCurrentPage = () => {
      switch (pageState.currentPage) {
        case "landing":
          return (
            <LandingPage
              hasPreviousMessages={
                pageState.pageData.landing.hasPreviousMessages
              }
              customerName={pageState.pageData.landing.customerName}
              onNavigateToPage={onNavigateToPage}
              onStartNewChat={() => {
                onStartNewChat?.();
              }}
            />
          );

        case "history":
          //
          return (
            <ConversationHistoryPage
              chatRooms={allChatRooms || undefined}
              customerName={currentCustomer?.name || "Customer"}
              onContinueChat={onContinueChat!}
              onStartNewChat={onStartNewChat!}
              isLoading={isCheckingIP}
            />
          );

        case "chat":
          return (
            <ChatInterfacePage
              chats={chats}
              register={register}
              onChat={onChat}
              onResponding={onResponding}
              theme={theme}
              textColor={textColor}
              messageWindowRef={ref as React.RefObject<HTMLDivElement>}
            />
          );

        case "helpdesk":
          return (
            <HelpDeskListPage
              questions={helpdesk || []}
              onNavigateToPage={onNavigateToPage}
              onStartNewChat={() => {
                onNavigateToPage("chat");
                onStartNewChat?.();
              }}
              isLoading={loading}
            />
          );

        case "answer":
          return (
            <HelpDeskAnswerPage
              question={pageState.pageData.answer.question as unknown}
              answer={pageState.pageData.answer.answer as string}
              related={pageState.pageData.answer.related as unknown[]}
              onNavigateBack={onNavigateBack}
              onNavigateToPage={onNavigateToPage}
              onStartNewChat={() => {
                onNavigateToPage("chat");
                onStartNewChat?.();
              }}
            />
          );

        default:
          return (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-4xl">🤖</div>
                <h3 className="text-lg font-medium text-muted-foreground">
                  Welcome to WeezIQ
                </h3>
                <p className="text-sm text-muted-foreground">
                  How can we help you today?
                </p>
              </div>
            </div>
          );
      }
    };

    // Handle special states (user info form, chat history selection)
    if (showUserInfoForm && onUserInfoSubmit) {
      return (
        <div
          className={cn(
            "shadow-lg rounded-xl border chat-window bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100",
            isEmbedMode ? "w-full h-[600px]" : "w-[450px] h-[670px] mr-[20px]"
          )}
        >
          <RealTimeMode
            setChats={setChat}
            chatRoomId={realtimeMode?.chatroom || ""}
            setAllChatRooms={setAllChatRooms}
          />
          <div className="w-full h-full flex flex-col">
            <NavigationHeader
              currentPage="chat"
              canGoBack={true}
              onNavigateBack={() => {
                setShowUserInfoForm?.(false);
                onNavigateToPage("landing");
              }}
              onNavigateToPage={onNavigateToPage}
              domainName={domainName}
            />
            <div className="flex-1 flex items-center justify-center p-4">
              <UserInfoForm onSubmit={onUserInfoSubmit} loading={loading} />
            </div>
          </div>
        </div>
      );
    }

    if (
      showChatHistory &&
      allChatRooms &&
      currentCustomer &&
      onContinueChat &&
      onStartNewChat
    ) {
      return (
        <div
          className={cn(
            "shadow-lg rounded-xl border chat-window bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100",
            isEmbedMode ? "w-full h-[600px]" : "w-[450px] h-[670px] mr-[20px]"
          )}
        >
          <RealTimeMode
            setChats={setChat}
            chatRoomId={realtimeMode?.chatroom || ""}
            setAllChatRooms={setAllChatRooms}
          />
          <div className="w-full h-full flex flex-col">
            <NavigationHeader
              currentPage="history"
              canGoBack={false}
              onNavigateBack={onNavigateBack}
              onNavigateToPage={onNavigateToPage}
              domainName={domainName}
            />
            <ConversationHistoryPage
              chatRooms={allChatRooms}
              customerName={currentCustomer.name}
              onContinueChat={(_chatRoomId) => {
                onContinueChat();
                onNavigateToPage("chat");
              }}
              onStartNewChat={() => {
                onStartNewChat();
                onNavigateToPage("chat");
              }}
              isLoading={isCheckingIP}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "shadow-lg rounded-xl border chat-window bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100",
          isEmbedMode ? "w-full h-[600px]" : "w-[450px] h-[670px] mr-[20px]"
        )}
      >
        <RealTimeMode
          setChats={setChat}
          chatRoomId={realtimeMode?.chatroom || ""}
          setAllChatRooms={setAllChatRooms}
        />
        <div className="w-full h-full flex flex-col">
          {/* Navigation Header */}
          <NavigationHeader
            currentPage={pageState.currentPage}
            canGoBack={pageState.navigation.canGoBack}
            onNavigateBack={onNavigateBack}
            onNavigateToPage={onNavigateToPage}
            domainName={domainName}
          />

          {/* Animated Page Container */}
          <div className="flex-1 overflow-hidden">
            <AnimatedPageContainer currentPage={pageState.currentPage}>
              {renderCurrentPage()}
            </AnimatedPageContainer>
          </div>
        </div>
      </div>
    );
  }
);

MultiPageBotWindow.displayName = "MultiPageBotWindow";

export default MultiPageBotWindow;
