import {
  onAiChatBotAssistant,
  onGetCurrentChatBot,
  onStoreConversations,
} from "@/actions/bot";
import {
  onCreateCustomerWithInfo,
  onFindCustomerByIP,
  onUpdateCustomerIP,
} from "@/actions/conversation";
import {
  postToParent,
  serializeChatRoom,
  deserializeChatRoom,
} from "@/lib/utils";
import {
  ChatBotMessageProps,
  ChatBotMessageSchema,
  UserInfoFormProps,
} from "@/schemas/coversation.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { UploadClient } from "@uploadcare/upload-client";
import socketClient from "@/lib/socketClient";

// ✅ NEW: Import types for multi-page chatbot
import type { ChatbotPage, ChatbotPageState } from "./types";

export type { ChatbotPage } from "./types";

const _upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
});

export const useChatBot = () => {
  const { register, handleSubmit, reset } = useForm<ChatBotMessageProps>({
    // @ts-expect-error - Type compatibility issue between Zod and React Hook Form resolver
    resolver: zodResolver(ChatBotMessageSchema),
  });

  const [currentBot, setCurrentBot] = useState<
    | {
        name: string;
        chatBot: {
          id: string;
          icon: string | null;
          welcomeMessage: string | null;
          background: string | null;
          textColor: string | null;
          helpdesk: boolean;
          taskSummary: string | null;
        } | null;
        helpdesk: {
          id: string;
          question: string;
          answered: string;
          domainId: string | null;
        }[];
      }
    | undefined
  >();

  const messageWindowRef = useRef<HTMLDivElement | null>(null);
  const [botOpened, setBotOpened] = useState<boolean>(false);

  // ✅ NEW: Chat history state for multiple chat rooms
  const [allChatRooms, setAllChatRooms] = useState<Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    message: Array<{
      id: string;
      message: string;
      role: "OWNER" | "CUSTOMER";
      createdAt: Date;
    }>;
  }> | null>(null);

  // ✅ NEW: Current chat room ID for tracking which conversation is active
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(
    null
  );

  // ✅ NEW: Chat history state (for backward compatibility)
  const [chatHistory, setChatHistory] = useState<{
    messages: Array<{
      id: string;
      message: string;
      role: "OWNER" | "CUSTOMER";
      createdAt: Date;
    }>;
  } | null>(null);
  const onOpenChatBot = () => {
    setBotOpened((prev) => {
      const newState = !prev;

      // If opening the bot, ensure we show the landing page
      if (newState) {
        console.log("🚀 Opening chatbot - navigating to landing page");
        setShowUserInfoForm(false);
        setShowChatHistory(false);

        // ✅ NEW: Check if we have a current chat room to restore
        if (currentChatRoomId && allChatRooms) {
          const lastChatRoom = allChatRooms.find(
            (room) => room.id === currentChatRoomId
          );
          if (lastChatRoom) {
            console.log(
              "🔄 Restoring last active chat room:",
              currentChatRoomId
            );

            // Convert history messages to chat format
            const historyChats = lastChatRoom.message.map((msg) => ({
              role: (msg.role === "OWNER" ? "assistant" : "user") as
                | "assistant"
                | "user",
              content: msg.message,
              link: undefined,
            }));

            // Set chat messages and navigate to chat
            setOnChats(historyChats);
            updatePageData("chat", { messages: historyChats, isTyping: false });
            navigateToPage("chat");

            console.log("✅ Last active chat room restored");
            return newState;
          }
        }

        // If no last chat room, show landing page
        navigateToPage("landing", {
          hasPreviousMessages: allChatRooms && allChatRooms.length > 0,
          customerName: currentCustomer?.name || "Customer",
          lastMessage: undefined,
        });

        // ✅ NEW: Send iframe dimension message when opening
        if (typeof window !== "undefined" && window !== window.parent) {
          window.parent.postMessage(
            JSON.stringify({
              type: "dimensions",
              expanded: true,
            }),
            "*"
          );
        }
      } else {
        // ✅ NEW: Send iframe dimension message when closing
        if (typeof window !== "undefined" && window !== window.parent) {
          window.parent.postMessage(
            JSON.stringify({
              type: "dimensions",
              expanded: false,
            }),
            "*"
          );
        }
      }

      return newState;
    });
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [onChats, setOnChats] = useState<
    { role: "assistant" | "user"; content: string; link?: string }[]
  >([]);

  // ✅ NEW: Debug onChats changes
  useEffect(() => {
    console.log("🔄 onChats state updated:", onChats);
    console.log("🔄 onChats length:", onChats.length);
    if (onChats.length > 0) {
      onChats.forEach((chat, index) => {
        if (!chat.role) {
          console.error(
            "❌ Chat message without role at index",
            index,
            ":",
            chat
          );
        }
        if (!chat.content) {
          console.error(
            "❌ Chat message without content at index",
            index,
            ":",
            chat
          );
        }
        console.log(`📝 Chat ${index}:`, {
          role: chat.role,
          content: chat.content?.substring(0, 50),
        });
      });
    }
  }, [onChats]);

  // ✅ NEW: Initialize chat state properly
  useEffect(() => {
    console.log("🚀 Initializing chat state");
    setOnChats([]);
  }, []);

  const [onRealTime, _setOnRealTime] = useState<
    | {
        chatroom: string;
        mode: boolean;
      }
    | undefined
  >(undefined);
  const [onAiTyping, setOnAiTyping] = useState<boolean>(false);

  // ✅ NEW: Multi-page state management
  const [pageState, setPageState] = useState<ChatbotPageState>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chatbot-page-state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            currentPage: "landing", // Always start with landing page
          };
        } catch {
          // Fallback to default
        }
      }
    }

    return {
      currentPage: "landing",
      previousPage: null,
      pageData: {
        landing: { hasPreviousMessages: false, customerName: "Customer" },
        history: { conversations: [], customer: null },
        chat: { messages: [], isTyping: false },
        helpdesk: { questions: [], selectedCategory: "all", searchQuery: "" },
        answer: { question: null, answer: null, related: [] },
      },
      navigation: {
        canGoBack: false,
        breadcrumbs: [],
      },
    };
  });
  const [currentBotId, setCurrentBotId] = useState<string>();

  // ✅ NEW: Page navigation functions
  const navigateToPage = useCallback(
    (page: ChatbotPage, data?: Record<string, unknown>) => {
      setPageState((prev) => {
        const newState = {
          ...prev,
          previousPage: prev.currentPage,
          currentPage: page,
          navigation: {
            ...prev.navigation,
            canGoBack: page !== "chat", // Only allow back navigation from non-chat pages
            breadcrumbs:
              prev.currentPage !== page
                ? [...prev.navigation.breadcrumbs, prev.currentPage]
                : prev.navigation.breadcrumbs,
          },
        };

        // Update page-specific data if provided
        if (data) {
          switch (page) {
            case "landing":
              newState.pageData.landing = {
                ...newState.pageData.landing,
                ...data,
              };
              break;
            case "history":
              newState.pageData.history = {
                ...newState.pageData.history,
                ...data,
              };
              break;
            case "chat":
              newState.pageData.chat = { ...newState.pageData.chat, ...data };
              break;
            case "helpdesk":
              newState.pageData.helpdesk = {
                ...newState.pageData.helpdesk,
                ...data,
              };
              break;
            case "answer":
              newState.pageData.answer = {
                ...newState.pageData.answer,
                ...data,
              };
              break;
          }
        }

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("chatbot-page-state", JSON.stringify(newState));
        }

        return newState;
      });
    },
    []
  );

  const navigateBack = useCallback(() => {
    setPageState((prev) => {
      if (!prev.previousPage || !prev.navigation.canGoBack) return prev;

      const newBreadcrumbs = prev.navigation.breadcrumbs.slice();
      const targetPage = newBreadcrumbs.pop() || prev.previousPage;

      const newState = {
        ...prev,
        currentPage: targetPage as ChatbotPage,
        previousPage:
          newBreadcrumbs.length > 0
            ? (newBreadcrumbs[newBreadcrumbs.length - 1] as ChatbotPage)
            : null,
        navigation: {
          ...prev.navigation,
          canGoBack: newBreadcrumbs.length > 0,
          breadcrumbs: newBreadcrumbs,
        },
      };

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("chatbot-page-state", JSON.stringify(newState));
      }

      return newState;
    });
  }, []);

  const updatePageData = useCallback(
    (page: ChatbotPage, data: Record<string, unknown>) => {
      setPageState((prev) => {
        const newState = {
          ...prev,
          pageData: {
            ...prev.pageData,
            [page]: { ...prev.pageData[page], ...data },
          },
        };

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("chatbot-page-state", JSON.stringify(newState));
        }

        return newState;
      });
    },
    []
  );

  // ✅ Updated: New states for IP-based customer detection
  const [showUserInfoForm, setShowUserInfoForm] = useState<boolean>(false);
  const [showChatHistory, setShowChatHistory] = useState<boolean>(false);
  const [isCheckingIP, setIsCheckingIP] = useState<boolean>(false);

  const [currentCustomer, setCurrentCustomer] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    countryCode: string;
    ipAddress?: string;
    createdAt?: Date;
    chatRoom?: Array<{
      id: string;
    }>;
  } | null>(null);

  // ✅ NEW: Socket.io real-time chat setup for chatbot
  useEffect(() => {
    if (currentCustomer?.chatRoom?.[0]?.id) {
      const chatRoomId = currentCustomer.chatRoom[0].id;
      console.log(`🎯 Setting up Socket.io for chatbot room: ${chatRoomId}`);

      // Join the chat room with a small delay to ensure proper setup
      setTimeout(() => {
        console.log(`🎯 Chatbot joining room: ${chatRoomId}`);
        socketClient.joinRoom(
          chatRoomId,
          currentCustomer.id,
          currentCustomer.name || "Customer"
        );
      }, 100);

      // ✅ NEW: Notify admin that customer joined this room
      socketClient.notifyAdminCustomerJoined(
        chatRoomId,
        currentCustomer.id,
        currentCustomer.name || "Customer"
      );

      // ✅ FIXED: Listen for new messages from admin - WhatsApp-style
      socketClient.onNewMessage(
        (data: {
          id: string;
          message: string;
          role: string;
          timestamp: string;
          userId: string;
          userName: string;
        }) => {
          console.log("🔔 Received realtime message:", data);

          // Add message to current chat
          setOnChats((prev) => [
            ...prev,
            {
              role: data.role === "OWNER" ? "assistant" : "user",
              content: data.message,
            },
          ]);

          // Update the last message in allChatRooms if available
          if (allChatRooms) {
            setAllChatRooms((prev) => {
              if (!prev) return prev;

              return prev.map((room) => {
                if (room.id === chatRoomId) {
                  return {
                    ...room,
                    message: [
                      ...room.message,
                      {
                        id: data.id || Date.now().toString(),
                        message: data.message,
                        role: data.role as "OWNER" | "CUSTOMER",
                        createdAt: new Date(data.timestamp),
                      },
                    ],
                  };
                }
                return room;
              });
            });
          }
        }
      );

      // Listen for user joined
      socketClient.onUserJoined(
        (data: {
          userId: string;
          userName: string;
          socketId: string;
          timestamp: string;
        }) => {
          console.log("👋 User joined chatbot room:", data);
        }
      );

      // Listen for user left
      socketClient.onUserLeft(
        (data: {
          userId: string;
          userName: string;
          socketId: string;
          timestamp: string;
        }) => {
          console.log("👋 User left chatbot room:", data);
        }
      );

      // Listen for typing indicators
      socketClient.onUserTyping(
        (data: { userId: string; userName?: string; isTyping: boolean }) => {
          console.log("⌨️ User typing in chatbot:", data);
        }
      );

      // Cleanup on unmount
      return () => {
        console.log(`👋 Leaving Socket.io room: ${chatRoomId}`);
        socketClient.leaveRoom(chatRoomId);
        socketClient.offNewMessage();
        socketClient.offUserJoined();
        socketClient.offUserLeft();
        socketClient.offUserTyping();
      };
    }
  }, [currentCustomer, setOnChats, allChatRooms, setAllChatRooms]);

  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    onScrollToBottom();
  }, [onChats, messageWindowRef]);

  useEffect(() => {
    postToParent(
      JSON.stringify({
        width: botOpened ? 550 : 80,
        height: botOpened ? 800 : 80,
      })
    );
  }, [botOpened]);

  // ✅ REMOVED: Complex postMessage handling - now handled in main page

  // ✅ SIMPLE: Process domain ID from localStorage - BULLETPROOF
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDomainId = localStorage.getItem("chatbot-domain-id");

      // If we have a stored domain ID and no current bot, process it
      if (storedDomainId && !currentBotId && !loading) {
        console.log("🔄 Processing stored domain ID:", storedDomainId);
        onGetDomainChatBot(storedDomainId);
      }
    }
  }, [currentBotId, loading]); // Run when currentBotId or loading changes

  // ✅ FIXED: Restore chat rooms from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedChatRooms = localStorage.getItem("chatbot-chat-rooms");
      if (storedChatRooms && !allChatRooms) {
        try {
          const parsedChatRooms = JSON.parse(storedChatRooms);
          console.log(
            "🔄 Restoring chat rooms from localStorage:",
            parsedChatRooms.length
          );

          // ✅ FIXED: Use utility function for proper deserialization
          const restoredChatRooms = parsedChatRooms.map(deserializeChatRoom);

          setAllChatRooms(restoredChatRooms);
        } catch (error) {
          console.error("❌ Error parsing stored chat rooms:", error);
          localStorage.removeItem("chatbot-chat-rooms");
        }
      }
    }
  }, []); // ✅ FIXED: Remove allChatRooms dependency to prevent infinite loop

  // ✅ NEW: Restore chat state from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedChatState = localStorage.getItem("chatbot-chat-state");
      if (storedChatState) {
        try {
          const parsedChatState = JSON.parse(storedChatState);
          console.log(
            "🔄 Restoring chat state from localStorage:",
            parsedChatState
          );

          // Restore current chat room ID
          if (parsedChatState.currentChatRoomId) {
            setCurrentChatRoomId(parsedChatState.currentChatRoomId);
          }

          // Restore current customer
          if (parsedChatState.currentCustomer) {
            setCurrentCustomer(parsedChatState.currentCustomer);
          }

          // Restore chat messages
          if (parsedChatState.onChats) {
            setOnChats(parsedChatState.onChats);
          }

          // Restore page state
          if (parsedChatState.pageState) {
            setPageState(parsedChatState.pageState);
          }
        } catch (error) {
          console.error("❌ Error parsing stored chat state:", error);
          localStorage.removeItem("chatbot-chat-state");
        }
      }
    }
  }, []);

  // ✅ NEW: Save chat state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const chatState = {
        currentChatRoomId,
        currentCustomer,
        onChats,
        pageState,
        timestamp: Date.now(),
      };

      localStorage.setItem("chatbot-chat-state", JSON.stringify(chatState));
    }
  }, [currentChatRoomId, currentCustomer, onChats, pageState]);

  // ✅ FIXED: Update localStorage whenever allChatRooms changes
  useEffect(() => {
    if (typeof window !== "undefined" && allChatRooms) {
      // ✅ FIXED: Use utility function for proper serialization
      const serializableChatRooms = allChatRooms.map(serializeChatRoom);

      localStorage.setItem(
        "chatbot-chat-rooms",
        JSON.stringify(serializableChatRooms)
      );
      console.log(
        "💾 Updated localStorage with",
        allChatRooms.length,
        "chat rooms"
      );
    }
  }, [allChatRooms]);

  const onGetDomainChatBot = async (id: string) => {
    // ✅ SIMPLE: Basic duplicate prevention
    if (loading || currentBotId === id) {
      console.log("🔄 Skipping duplicate request for domain ID:", id);
      return;
    }

    console.log("🔄 Fetching chatbot data for domain ID:", id);
    setCurrentBotId(id);
    setLoading(true);
    setIsCheckingIP(true);

    try {
      // ✅ FIXED: Check for existing customer by IP first (with caching)
      const existingCustomer = await onFindCustomerByIP(id);

      // ✅ REMOVED: Caching logic to simplify

      if (existingCustomer) {
        console.log("✅ Found existing customer by IP:", existingCustomer.name);

        // Update customer's IP address
        await onUpdateCustomerIP(existingCustomer.id);

        // ✅ NEW: Check if there are any previous messages across all chat rooms
        const hasAnyPreviousMessages = existingCustomer.chatRoom?.some(
          (room) => room.message && room.message.length > 0
        );

        // Reduced logging to prevent console spam

        // Get the last message from the most recent chat room for display
        const mostRecentChatRoom = existingCustomer.chatRoom?.[0]; // Already ordered by desc
        const lastMessage =
          hasAnyPreviousMessages &&
          mostRecentChatRoom?.message &&
          mostRecentChatRoom.message.length > 0
            ? {
                message:
                  mostRecentChatRoom.message[
                    mostRecentChatRoom.message.length - 1
                  ].message,
                createdAt:
                  mostRecentChatRoom.message[
                    mostRecentChatRoom.message.length - 1
                  ].createdAt,
              }
            : undefined;

        // Always navigate to landing page first
        navigateToPage("landing", {
          hasPreviousMessages: hasAnyPreviousMessages,
          customerName: existingCustomer.name || "Customer",
          lastMessage,
        });

        // Store customer info for later use
        setCurrentCustomer({
          id: existingCustomer.id,
          name: existingCustomer.name || "",
          email: existingCustomer.email || "",
          phone: existingCustomer.phone || undefined,
          countryCode: existingCustomer.countryCode || "+1",
          ipAddress: existingCustomer.ipAddress || undefined,
          createdAt: existingCustomer.createdAt,
          chatRoom: existingCustomer.chatRoom,
        });

        // ✅ FIXED: Merge stored chat rooms with fresh customer data
        if (existingCustomer.chatRoom && existingCustomer.chatRoom.length > 0) {
          console.log("🔄 Processing chat rooms...");
          const validChatRooms = existingCustomer.chatRoom.map((room) => ({
            id: room.id,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            message: room.message
              .filter((msg) => msg.role) // Filter out messages without roles
              .map((msg) => ({
                id: msg.id,
                message: msg.message,
                role: msg.role as "OWNER" | "CUSTOMER",
                createdAt: msg.createdAt,
              })),
          }));

          // ✅ FIXED: Merge with existing chat rooms from localStorage
          setAllChatRooms((prevChatRooms) => {
            let finalChatRooms = validChatRooms;

            // If we have previous chat rooms from localStorage, merge them
            if (prevChatRooms && prevChatRooms.length > 0) {
              console.log(
                "🔄 Merging with existing chat rooms from localStorage"
              );

              // Create a map to avoid duplicates based on room ID
              const roomMap = new Map();

              // First add all existing rooms
              prevChatRooms.forEach((room) => {
                roomMap.set(room.id, room);
              });

              // Then add/update with fresh data
              validChatRooms.forEach((room) => {
                roomMap.set(room.id, room);
              });

              // Convert back to array, sorted by creation date (newest first)
              finalChatRooms = Array.from(roomMap.values()).sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );
            }

            console.log("✅ Final chat rooms loaded:", finalChatRooms.length);
            console.log("📝 Final chat rooms data:", finalChatRooms);

            // ✅ FIXED: Store merged chat rooms in localStorage for persistence
            if (typeof window !== "undefined") {
              const serializableChatRooms =
                finalChatRooms.map(serializeChatRoom);
              localStorage.setItem(
                "chatbot-chat-rooms",
                JSON.stringify(serializableChatRooms)
              );
              console.log("💾 Merged chat rooms saved to localStorage");
            }

            return finalChatRooms;
          });

          // ✅ NEW: Always show landing page for returning users with chat rooms
          setShowChatHistory(false);
          setShowUserInfoForm(false);
          console.log(
            "✅ Returning user with chat rooms - showing landing page"
          );
        } else {
          // ✅ FIXED: Don't clear allChatRooms if we have stored ones
          if (!allChatRooms || allChatRooms.length === 0) {
            setAllChatRooms(null);
          }
          setShowChatHistory(false);
          setShowUserInfoForm(false); // Don't show form immediately
          console.log(
            "✅ Returning user without fresh chat rooms - keeping existing ones"
          );
        }

        // Set chat history if available (for backward compatibility)
        if (
          mostRecentChatRoom?.message &&
          mostRecentChatRoom.message.length > 0
        ) {
          const validMessages = mostRecentChatRoom.message
            .filter((msg) => msg.role)
            .map((msg) => ({
              id: msg.id,
              message: msg.message || "",
              role: msg.role as "OWNER" | "CUSTOMER",
              createdAt: msg.createdAt,
            }));

          setChatHistory({
            messages: validMessages,
          });
        } else {
          setChatHistory(null);
        }

        console.log("✅ Returning user detected, navigating to landing page");
      } else {
        console.log("🆕 New user detected, navigating to landing page");

        // ✅ NEW: Navigate to landing page for new users too
        navigateToPage("landing", {
          hasPreviousMessages: false,
          customerName: "Customer",
          lastMessage: undefined,
        });

        setShowUserInfoForm(false); // Don't show form immediately
        setShowChatHistory(false);
      }

      // Get chatbot data
      const chatbot: Awaited<ReturnType<typeof onGetCurrentChatBot>> =
        await onGetCurrentChatBot(id);

      console.log("📊 Chatbot data received:", chatbot);

      if (chatbot) {
        setCurrentBot({
          ...chatbot,
          chatBot: chatbot.chatBot
            ? {
                ...chatbot.chatBot,
                helpdesk: chatbot.chatBot.helpdesk ?? false,
              }
            : null,
        });

        console.log("✅ Chatbot data loaded successfully");
      } else {
        console.log("❌ No chatbot data received");
      }
    } catch (error) {
      console.error("💥 Error fetching chatbot data:", error);
      // Don't automatically show form - let user choose from landing page
      setShowChatHistory(false);
    } finally {
      setLoading(false);
      setIsCheckingIP(false);
    }
  };

  // ✅ Handle continuing previous chat with specific chat room
  const handleContinueChat = useCallback(
    (chatRoomId: string) => {
      console.log("🔄 handleContinueChat called with chatRoomId:", chatRoomId);
      console.log("📝 allChatRooms:", allChatRooms);

      if (allChatRooms) {
        // Find the specific chat room
        const selectedChatRoom = allChatRooms.find(
          (room) => room.id === chatRoomId
        );

        if (selectedChatRoom && selectedChatRoom.message.length > 0) {
          console.log("✅ Loading messages from selected chat room");

          // Convert history messages to chat format
          const historyChats = selectedChatRoom.message.map((msg) => ({
            role: (msg.role === "OWNER" ? "assistant" : "user") as
              | "assistant"
              | "user",
            content: msg.message,
            link: undefined,
          }));

          // Set chat messages
          setOnChats(historyChats);
          setCurrentChatRoomId(chatRoomId);

          // Update page data and navigate to chat
          updatePageData("chat", { messages: historyChats, isTyping: false });
          navigateToPage("chat");

          console.log(
            "✅ Selected chat room loaded and navigated to chat page"
          );
        } else {
          console.log(
            "⚠️ No messages found in selected chat room, starting fresh"
          );
          setOnChats([]);
          setCurrentChatRoomId(chatRoomId);
          updatePageData("chat", { messages: [], isTyping: false });
          navigateToPage("chat");
        }
      } else {
        console.log("⚠️ No chat rooms available, starting fresh");
        setOnChats([]);
        setCurrentChatRoomId(chatRoomId);
        updatePageData("chat", { messages: [], isTyping: false });
        navigateToPage("chat");
      }
    },
    [allChatRooms, setOnChats, updatePageData, navigateToPage]
  );

  // ✅ Handle starting a new chat
  const handleStartNewChat = useCallback(() => {
    console.log("🆕 Starting new chat...");

    // Clear current chat state
    setOnChats([]);

    // ✅ FIXED: Clear localStorage to prevent stale data
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatbot-chat-rooms");
      console.log("🗑️ Cleared chat rooms from localStorage for new chat");
    }

    // Show user info form for new conversations
    console.log("📝 Showing user info form for new conversation");
    setShowUserInfoForm(true);
    setShowChatHistory(false);

    // Don't navigate to chat page yet - wait for form submission
    console.log("✅ User info form will be shown");
  }, [setOnChats]);

  const handleUserInfoSubmit = async (userInfo: UserInfoFormProps) => {
    try {
      if (!currentBotId) return;

      const result = await onCreateCustomerWithInfo(currentBotId, userInfo);

      if (result?.success && result.customer) {
        // ✅ Create customer object with chat room data
        const newCustomer = {
          id: result.customer.id,
          name: result.customer.name || "",
          email: result.customer.email || "",
          phone: result.customer.phone || undefined,
          countryCode: result.customer.countryCode || "+1",
          chatRoom: result.customer.chatRoom,
        };

        setCurrentCustomer(newCustomer);

        // ✅ Update allChatRooms to include the new chat room
        if (result.customer.chatRoom && result.customer.chatRoom.length > 0) {
          const newChatRoom = result.customer.chatRoom[0]; // The newly created chat room
          const newChatRoomData = {
            id: newChatRoom.id,
            createdAt: newChatRoom.createdAt || new Date(),
            updatedAt: newChatRoom.updatedAt || new Date(),
            message: [], // New chat room starts with no messages
          };

          // Add the new chat room to existing chat rooms or create new array
          setAllChatRooms((prev) => {
            const updatedRooms = prev
              ? [newChatRoomData, ...prev]
              : [newChatRoomData];

            // ✅ FIXED: Update localStorage immediately
            if (typeof window !== "undefined") {
              // ✅ FIXED: Use utility function for proper serialization
              const serializableRooms = updatedRooms.map(serializeChatRoom);

              localStorage.setItem(
                "chatbot-chat-rooms",
                JSON.stringify(serializableRooms)
              );
              console.log("💾 Updated localStorage with new chat room");
            }

            return updatedRooms;
          });

          console.log(
            "✅ New chat room added to allChatRooms:",
            newChatRoomData
          );
        }

        // ✅ Hide form and navigate to chat
        setShowUserInfoForm(false);
        updatePageData("chat", { messages: [], isTyping: false });
        navigateToPage("chat");

        console.log("✅ User info submitted, navigating to chat");

        // Add welcome message with user's name
        const welcomeMessage = `Hello ${userInfo.name}! 👋 Welcome to our chat. How can I help you today?`;

        setOnChats((prev) => [
          ...prev,
          {
            role: "assistant",
            content: welcomeMessage,
          },
        ]);

        // Store the conversation in the database
        if (result.customer.chatRoom?.[0]?.id) {
          await onStoreConversations(
            result.customer.chatRoom[0].id,
            welcomeMessage,
            "assistant"
          );
        }
      }
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const onstartChatting = handleSubmit(async (values) => {
    try {
      reset();

      if (values.content) {
        // Update UI immediately for better responsiveness
        const userMessage = {
          role: "user" as const,
          content: values.content || "",
        };

        setOnChats((prev) => [...prev, userMessage]);
        setOnAiTyping(true);

        // Store user message in database and send via WebSocket
        const chatRoomId = currentCustomer?.chatRoom?.[0]?.id;

        if (chatRoomId) {
          // Send message via WebSocket for real-time storage and broadcasting
          if (currentCustomer?.id && currentCustomer?.name && chatRoomId) {
            console.log("📤 Chatbot sending user message via WebSocket:", {
              chatRoomId,
              message: values.content,
              userId: currentCustomer.id,
              userName: currentCustomer.name,
            });

            // ✅ FIXED: Send via WebSocket for storage and broadcasting
            socketClient.sendMessageWithDomain(
              chatRoomId,
              values.content || "",
              currentCustomer.id,
              currentCustomer.name,
              "user",
              currentBotId // domainId for AI integration
            );
          }
        } else {
          console.warn("⚠️ No chatRoomId available for WebSocket message");
        }

        // Check if live agent mode is enabled for this chat room
        const isLiveAgentMode =
          onRealTime?.chatroom === chatRoomId && onRealTime?.mode;

        if (isLiveAgentMode) {
          // Live agent mode - don't send AI response, just notify admin
          console.log("👮‍♂️ Live agent mode enabled - skipping AI response");
          setOnAiTyping(false);
          return;
        }

        // Get AI response
        const response = await onAiChatBotAssistant(
          currentBotId!,
          onChats,
          "user",
          values.content || "",
          currentCustomer?.email
        );

        if (response) {
          setOnAiTyping(false);

          if ("error" in response && response.error) {
            console.error("❌ AI Response error:", response.error);
            const aiMessage = {
              role: "assistant" as const,
              content:
                "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
            };
            setOnChats((prev) => [...prev, aiMessage]);
            return;
          }

          if (response.response && response.response.content) {
            const aiMessage = {
              role: "assistant" as const,
              content: response.response.content,
            };
            setOnChats((prev) => [...prev, aiMessage]);

            // ✅ NEW: Send AI response via WebSocket for storage and broadcasting
            const chatRoomId = currentCustomer?.chatRoom?.[0]?.id;
            if (chatRoomId && currentCustomer?.id && currentCustomer?.name) {
              console.log("📤 Sending AI response via WebSocket:", {
                chatRoomId,
                message: response.response.content,
                userId: currentCustomer.id,
                userName: currentCustomer.name,
              });

              // ✅ FIXED: Send via WebSocket for storage and broadcasting
              socketClient.sendMessageWithDomain(
                chatRoomId,
                response.response.content,
                currentCustomer.id,
                currentCustomer.name,
                "assistant",
                currentBotId // domainId for AI integration
              );
            }
          }
        } else {
          setOnAiTyping(false);
          const aiMessage = {
            role: "assistant" as const,
            content:
              "I'm sorry, I didn't receive a response. Please try again.",
          };
          setOnChats((prev) => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      console.error("Error in chat function:", error);
      setOnAiTyping(false);
    }
  });

  // ✅ NEW: Function to toggle live agent mode
  const toggleLiveAgentMode = useCallback(
    (chatRoomId: string, enabled: boolean) => {
      _setOnRealTime({
        chatroom: chatRoomId,
        mode: enabled,
      });
      console.log(
        `👮‍♂️ Live agent mode ${
          enabled ? "enabled" : "disabled"
        } for chat room: ${chatRoomId}`
      );
    },
    []
  );

  return {
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
    setShowUserInfoForm,
    currentCustomer,
    handleUserInfoSubmit,
    handleContinueChat,
    handleStartNewChat,
    showChatHistory,
    setShowChatHistory,
    isCheckingIP,
    chatHistory,
    // ✅ NEW: Multi-page functionality
    pageState,
    navigateToPage,
    navigateBack,
    updatePageData,
    // ✅ NEW: Multiple chat rooms support
    allChatRooms,
    setAllChatRooms,
    currentChatRoomId,
    // ✅ NEW: Current bot ID for domain identification
    currentBotId,
    // ✅ NEW: Live agent functionality
    toggleLiveAgentMode,
  };
};

// ✅ NEW: Realtime hook for socket.io integration
export const useRealtime = (
  chatRoomId: string,
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: "user" | "assistant";
        content: string;
        link?: string | undefined;
      }[]
    >
  >,
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
  >
) => {
  useEffect(() => {
    if (!chatRoomId) return;

    // Use existing socket client
    const socket = socketClient;

    // Join the chat room
    socket.joinRoom(chatRoomId, "customer", "Customer");

    // Listen for new messages
    socket.onNewMessage((data) => {
      console.log("🔔 Received realtime message:", data);

      // Add message to current chat
      setChats((prev) => [
        ...prev,
        {
          role: data.role === "OWNER" ? "assistant" : "user",
          content: data.message,
        },
      ]);

      // Update the last message in allChatRooms if available
      if (setAllChatRooms) {
        setAllChatRooms((prev) => {
          if (!prev) return prev;

          return prev.map((room) => {
            if (room.id === chatRoomId) {
              return {
                ...room,
                message: [
                  ...room.message,
                  {
                    id: data.id || Date.now().toString(),
                    message: data.message,
                    role: data.role as "OWNER" | "CUSTOMER",
                    createdAt: new Date(data.timestamp),
                  },
                ],
              };
            }
            return room;
          });
        });
      }
    });

    // Cleanup on unmount
    return () => {
      socket.leaveRoom(chatRoomId);
    };
  }, [chatRoomId, setChats, setAllChatRooms]);
};
