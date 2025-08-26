import { useChatBot } from "@/hooks/chatbot/useChatBot";
import React, { useEffect, useState } from "react";
import BotWindow from "./window";
import MultiPageBotWindow from "./MultiPageBotWindow";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { BotIcon } from "lucide-react";

const AiChatBot = () => {
  const [isEmbedMode, setIsEmbedMode] = useState(false);

  // ✅ NEW: Detect embed mode
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

  return (
    <div
      className={cn(
        "h-screen flex flex-col justify-end items-end gap-4",
        isEmbedMode ? "bg-transparent" : "bg-background"
      )}
    >
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
            onNavigateToPage={navigateToPage}
            onNavigateBack={navigateBack}
            onUpdatePageData={updatePageData}
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

      <div
        className={cn(
          "rounded-full relative cursor-pointer shadow-md w-20 h-20 flex items-center justify-center bg-secondary",
          loading ? "invisible" : "visible"
        )}
        onClick={onOpenChatBot}
      >
        {currentBot?.chatBot?.icon ? (
          <Image
            src="https://ucarecdn.com/cc656edf-303d-414f-b0e4-b93ad0bbfd26/WeezIQlogoicon.png"
            alt="bot"
            fill
          />
        ) : (
          <BotIcon />
        )}
      </div>
    </div>
  );
};

export default AiChatBot;
