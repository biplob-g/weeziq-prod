"use client";

import React, { useEffect, useState } from "react";
import { useChatBot } from "@/hooks/chatbot/useChatBot";
import BotWindow from "./window";
import MultiPageBotWindow from "./MultiPageBotWindow";
import { cn } from "@/lib/utils";
import { BotIcon, X } from "lucide-react";

const EmbedChatBot = () => {
  const [isEmbedMode, setIsEmbedMode] = useState(true);

  // ✅ NEW: Detect embed mode and hide Next.js notifications
  useEffect(() => {
    const checkEmbedMode = () => {
      const isInIframe = window !== window.parent;
      const embedParam = new URLSearchParams(window.location.search).get(
        "embed"
      );
      const storedEmbedMode = localStorage.getItem("chatbot-embed-mode");

      const isEmbed =
        isInIframe || embedParam === "true" || storedEmbedMode === "true";
      setIsEmbedMode(isEmbed);

      if (isEmbed) {
        // Apply embed mode styles
        document.documentElement.classList.add("chatbot-embed-mode");
        document.body.classList.add("chatbot-embed-mode");
      }
    };

    checkEmbedMode();
  }, []);

  const {
    botOpened,
    onOpenChatBot,
    onstartChatting,
    onChats,
    register,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    setOnChats,
    onRealTime,
    showUserInfoForm,
    showChatHistory,
    handleUserInfoSubmit,
    handleContinueChat,
    handleStartNewChat,
    isCheckingIP,
    chatHistory,
    currentCustomer,
    // ✅ NEW: Multi-page functionality
    pageState,
    navigateToPage,
    navigateBack,
    updatePageData,
    setShowUserInfoForm,
    // ✅ NEW: Multiple chat rooms support
    allChatRooms,
    setAllChatRooms,
    // ✅ NEW: Get currentBotId for domainId
    currentBotId,
  } = useChatBot();

  // ✅ NEW: Close chatbot function
  const onCloseChatBot = () => {
    onOpenChatBot(); // This toggles the bot state to closed
  };

  // ✅ REMOVED: Auto-open - user should click icon first

  return (
    <div className="w-full h-[600px] bg-transparent flex flex-col justify-end items-end">
      {/* Chat Window */}
      {botOpened &&
        // ✅ Use MultiPageBotWindow when pageState is available
        (pageState ? (
          <MultiPageBotWindow
            setChat={setOnChats}
            realtimeMode={onRealTime}
            helpdesk={currentBot?.helpdesk || []}
            domainName={currentBot?.name || "WeezGen"}
            domainId={currentBotId || ""} // ✅ NEW: Added domainId
            ref={messageWindowRef}
            help={currentBot?.chatBot?.helpdesk || false}
            theme={currentBot?.chatBot?.background || "white"}
            textColor={currentBot?.chatBot?.textColor || "black"}
            chats={onChats}
            register={register}
            onChat={onstartChatting}
            onResponding={onAiTyping}
            showUserInfoForm={showUserInfoForm}
            setShowUserInfoForm={setShowUserInfoForm}
            showChatHistory={showChatHistory}
            onUserInfoSubmit={handleUserInfoSubmit}
            onContinueChat={handleContinueChat}
            onStartNewChat={handleStartNewChat}
            loading={loading}
            isCheckingIP={isCheckingIP}
            chatHistory={chatHistory}
            currentCustomer={currentCustomer}
            allChatRooms={allChatRooms}
            setAllChatRooms={setAllChatRooms}
            pageState={pageState}
            onNavigateToPage={(page, data) => navigateToPage(page, data as any)}
            onNavigateBack={navigateBack}
            onUpdatePageData={(page, data) => updatePageData(page, data as any)}
            isEmbedMode={isEmbedMode} // ✅ NEW: Pass embed mode
          />
        ) : (
          // ✅ Fallback to original BotWindow for backward compatibility
          <BotWindow
            setChat={setOnChats}
            realtimeMode={onRealTime}
            helpdesk={currentBot?.helpdesk || []}
            domainName={currentBot?.name || ""}
            domainId={currentBotId || ""} // ✅ NEW: Added domainId
            ref={messageWindowRef}
            help={currentBot?.chatBot?.helpdesk}
            theme={currentBot?.chatBot?.background}
            textColor={currentBot?.chatBot?.textColor}
            chats={onChats}
            register={register}
            onChat={onstartChatting}
            onResponding={onAiTyping}
            showUserInfoForm={showUserInfoForm}
            showChatHistory={showChatHistory}
            onUserInfoSubmit={handleUserInfoSubmit}
            onContinueChat={handleContinueChat}
            onStartNewChat={handleStartNewChat}
            loading={loading}
            isCheckingIP={isCheckingIP}
            chatHistory={chatHistory}
            currentCustomer={currentCustomer}
            allChatRooms={allChatRooms}
            isEmbedMode={isEmbedMode} // ✅ NEW: Pass embed mode
          />
        ))}

      {/* Chatbot Icon/Bubble - Show bot icon when closed, cross icon when open */}
      <div
        className={cn(
          "rounded-full relative cursor-pointer shadow-lg w-16 h-16 flex items-center justify-center bg-white border-2 border-blue-500 hover:bg-blue-50 transition-all duration-200 chatbot-icon",
          loading ? "opacity-50" : "opacity-100"
        )}
        onClick={botOpened ? onCloseChatBot : onOpenChatBot}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 999999,
        }}
      >
        {botOpened ? (
          <X className="w-8 h-8 text-red-600 hover:text-red-700 transition-colors" />
        ) : (
          <BotIcon className="w-8 h-8 text-blue-600" />
        )}
      </div>
    </div>
  );
};

export default EmbedChatBot;
