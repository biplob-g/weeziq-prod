import {
  onGetChatMessages,
  onGetDomainChatRooms,
  onViewUnReadMessages,
} from "@/actions/conversation";
import { useChatContext } from "@/context/useChatContext";
import { getMonthName } from "@/lib/utils";
import {
  ChatBotMessageSchema,
  ConversationSearchScehma,
} from "@/schemas/coversation.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import socketClient from "@/lib/socketClient";

export const useConversation = () => {
  const { register, watch, setValue } = useForm({
    resolver: zodResolver(ConversationSearchScehma as any),
    mode: "onChange",
  });
  const {
    setLoading: loadMessages,
    setChats,
    setChatRoom,
    chatRoom,
    chatRooms,
    setChatRooms,
  } = useChatContext();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const search = watch((value) => {
      if (value.domain) {
        // ✅ NEW: Only fetch if domain is selected
        setLoading(true);
        try {
          onGetDomainChatRooms(value.domain).then((rooms) => {
            if (rooms) {
              setLoading(false);
              setChatRooms(rooms.customer);
            }
          });
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      }
    });
    return () => search.unsubscribe();
  }, [watch]);

  // ✅ NEW: Monitor for customers joining rooms to refresh conversation list
  useEffect(() => {
    console.log("👀 Setting up customer room monitoring for conversation list");

    // Listen for customers joining rooms
    socketClient.onCustomerJoinedRoom(
      (data: { roomId: string; customerId: string; customerName: string }) => {
        console.log("👤 Customer joined room (conversation list):", data);

        // Refresh the conversation list to show the new/active conversation
        const currentDomain = watch("domain");
        if (currentDomain) {
          console.log(
            "🔄 Refreshing conversation list due to customer activity"
          );
          setLoading(true);
          onGetDomainChatRooms(currentDomain).then((rooms) => {
            if (rooms) {
              setLoading(false);
              setChatRooms(rooms.customer);
            }
          });
        }
      }
    );

    // Cleanup function
    return () => {
      socketClient.offCustomerJoinedRoom();
    };
  }, [watch, setChatRooms, setLoading]);

  const onGetActiveChatMessages = async (id: string) => {
    try {
      loadMessages(true);
      // ✅ Clear previous chats when selecting a new conversation
      setChats([]);

      const messages = await onGetChatMessages(id);
      if (messages) {
        setChatRoom(id);
        loadMessages(false);
        setChats(
          messages[0].message.map((msg) => ({
            ...msg,
            role: msg.role === "OWNER" ? "assistant" : "user",
          }))
        );
      }
    } catch (error) {
      console.log(error);
      loadMessages(false);
    }
  };

  // ✅ NEW: Function to refresh chat messages (for tab switching)
  const refreshChatMessages = async () => {
    if (chatRoom) {
      await onGetActiveChatMessages(chatRoom);
    }
  };

  return {
    register,
    setValue, // ✅ NEW: Return setValue
    chatRooms,
    loading,
    onGetActiveChatMessages,
    refreshChatMessages, // ✅ NEW: Export refresh function
    setChatRooms, // ✅ NEW: Export setChatRooms for server-side initialization
    setChats, // ✅ NEW: Export setChats for server-side initialization
  };
};

export const useChatTime = (createdAt: Date, roomId: string) => {
  const { chatRoom } = useChatContext();
  const [messageSentAt, setMessageSentAt] = useState<string>();
  const [urgent, setUrgent] = useState<boolean>(false);
  const onSetMessageReceivedDate = () => {
    const dt = new Date(createdAt);
    const current = new Date();
    const currentDate = current.getDate();
    const hr = dt.getHours();
    const min = dt.getMinutes();
    const date = dt.getDate();
    const month = dt.getMonth();
    const difference = currentDate - date;

    if (difference <= 0) {
      setMessageSentAt(`${hr}:${min}${hr > 12 ? "PM" : "AM"}`);
      if (current.getHours() - dt.getHours() < 2) {
        setUrgent(true);
      }
    } else {
      setMessageSentAt(`${date} ${getMonthName(month)}`);
    }
  };

  const onSeenChat = async () => {
    if (chatRoom == roomId && urgent) {
      await onViewUnReadMessages(roomId);
      setUrgent(false);
    }
  };

  useEffect(() => {
    onSeenChat();
  }, [chatRoom]);

  useEffect(() => {
    onSetMessageReceivedDate();
  }, []);

  return { messageSentAt, urgent, onSeenChat };
};

export const useChatWindow = () => {
  const { chats, loading, setChats, chatRoom, setChatRoom } = useChatContext();
  const messageWindowRef = useRef<HTMLDivElement | null>(null);
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(ChatBotMessageSchema as any),
    mode: "onChange",
  });
  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    onScrollToBottom();
  }, [chats, messageWindowRef]);

  // ✅ Socket.io real-time chat setup
  useEffect(() => {
    if (chatRoom) {
      console.log(`🎯 Setting up Socket.io for room: ${chatRoom}`);

      // Join the chat room with a small delay to ensure proper setup
      setTimeout(() => {
        console.log(`🎯 Conversation page joining room: ${chatRoom}`);
        socketClient.joinRoom(chatRoom, "admin", "Admin User");
      }, 100);

      // ✅ FIXED: Listen for new messages (both user and AI) - WhatsApp-style
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
          setChats((prev) => [
            ...prev,
            {
              id: data.id || `temp-${Date.now()}`,
              message: data.message,
              role: data.role === "OWNER" ? "assistant" : "user",
              createdAt: new Date(data.timestamp),
              seen: false,
            },
          ]);
        }
      );

      // Listen for AI responses
      socketClient.onAIResponse(
        (data: { message: string; role: string; timestamp: string }) => {
          console.log("🤖 Received AI response:", data);

          // Add AI response to current chat
          setChats((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              message: data.message,
              role: "assistant",
              createdAt: new Date(data.timestamp),
              seen: false,
            },
          ]);
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
          console.log("👋 User joined:", data);
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
          console.log("👋 User left:", data);
        }
      );

      // Listen for typing indicators
      socketClient.onUserTyping(
        (data: { userId: string; userName?: string; isTyping: boolean }) => {
          console.log("⌨️ User typing:", data);
        }
      );

      // Cleanup function
      return () => {
        console.log(`👋 Leaving Socket.io room: ${chatRoom}`);
        socketClient.leaveRoom(chatRoom);
        socketClient.offNewMessage();
        socketClient.offAIResponse();
        socketClient.offMessageStored();
        socketClient.offUserJoined();
        socketClient.offUserLeft();
        socketClient.offUserTyping();
      };
    }
  }, [chatRoom, setChats]);

  // ✅ NEW: Monitor for customers joining chat rooms
  useEffect(() => {
    console.log("👀 Setting up customer room monitoring for admin");

    // Listen for customers joining rooms
    socketClient.onCustomerJoinedRoom(
      (data: { roomId: string; customerId: string; customerName: string }) => {
        console.log("👤 Customer joined room:", data);

        // If no chat room is currently selected, automatically select this one
        if (!chatRoom) {
          console.log(
            `🎯 Auto-selecting chat room: ${data.roomId} for customer: ${data.customerName}`
          );
          setChatRoom(data.roomId);
        }
      }
    );

    // Cleanup function
    return () => {
      socketClient.offCustomerJoinedRoom();
    };
  }, [chatRoom, setChatRoom]);

  const onHandleSentMessage = handleSubmit(async (values) => {
    try {
      if (!chatRoom) {
        console.error("❌ No chat room selected");
        return;
      }

      // ✅ NEW: Create optimistic message for immediate display
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        message: values.content,
        role: "assistant" as const,
        createdAt: new Date(),
        seen: false,
        isOptimistic: true, // Mark as optimistic
      };

      // ✅ NEW: Add optimistic message immediately
      setChats((prev) => [...prev, optimisticMessage]);

      // ✅ NEW: Clear input immediately for better UX
      reset();

      // Send message via WebSocket for storage and broadcasting
      if (chatRoom) {
        console.log(
          "✅ Admin sending message via WebSocket to room:",
          chatRoom
        );

        // ✅ FIXED: Send via WebSocket for storage and broadcasting
        socketClient.sendMessageWithDomain(
          chatRoom,
          values.content,
          "admin",
          "Admin User",
          "assistant"
        );

        // ✅ NEW: Replace optimistic message with real message (will be updated when we get confirmation)
        setChats((prev) =>
          prev.map((chat) =>
            chat.isOptimistic
              ? {
                  id: `temp-${Date.now()}`,
                  message: values.content,
                  role: "assistant" as const,
                  createdAt: new Date(),
                  seen: false,
                }
              : chat
          )
        );
      } else {
        // ✅ NEW: Remove optimistic message if sending failed
        setChats((prev) => prev.filter((chat) => !chat.isOptimistic));
        console.error("❌ No chat room available");
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      // ✅ NEW: Remove optimistic message on error
      setChats((prev) => prev.filter((chat) => !chat.isOptimistic));
    }
  });

  // ✅ NEW: Function to clear chats when switching tabs
  const clearChats = useCallback(() => {
    setChats([]);
  }, [setChats]);

  return {
    messageWindowRef,
    register,
    onHandleSentMessage,
    chats,
    loading,
    chatRoom,
    reset,
    clearChats, // ✅ NEW: Export clearChats function
    setChats, // ✅ NEW: Export setChats for server-side initialization
  };
};
