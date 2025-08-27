"use client";
import { useConversation } from "@/hooks/conversation/useConversation";
import React, { useMemo } from "react";
import TabsMenu from "../tabs";
import { TABS_MENU } from "@/constants/menu";
import { TabsContent } from "../ui/tabs";
import ConversationSearch from "./search";
import ChatCard from "./chatCard";
import { CardDescription } from "../ui/card";
import { onDeleteConversation } from "@/actions/conversation";
import { toast } from "sonner";
import { onGetDomainChatRooms } from "@/actions/conversation"; // ✅ NEW: Import onGetDomainChatRooms

type Props = {
  domains?:
    | {
        name: string;
        id: string;
        icon: string;
      }[]
    | undefined;
};

const ConversationMenu = ({ domains }: Props) => {
  const { register, setValue, chatRooms, onGetActiveChatMessages } =
    useConversation();

  // ✅ REMOVED: Problematic useEffect that was causing infinite loops
  // The chat window will refresh when a conversation is selected instead

  // ✅ NEW: Handle delete conversation
  const handleDeleteConversation = async (chatRoomId: string) => {
    try {
      await onDeleteConversation(chatRoomId);
      toast.success("Conversation deleted successfully");
      // ✅ Refresh the chat rooms list
      if (domains && domains.length > 0) {
        const rooms = await onGetDomainChatRooms(domains[0].id);
        if (rooms) {
          // This will trigger a re-render of the chat rooms
        }
      }
    } catch (error) {
      console.error("❌ Failed to delete conversation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete conversation"
      );
    }
  };

  // ✅ NEW: Filter chat rooms based on different criteria
  const filteredChatRooms = useMemo(() => {
    if (!chatRooms) return { unread: [], all: [], expired: [] };

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago

    console.log("🔍 Filtering chat rooms:");
    console.log("  - Total chat rooms:", chatRooms.length);
    console.log("  - One day ago:", oneDayAgo.toISOString());

    const all = chatRooms.filter((room) => {
      const chatRoom = room.chatRoom[0];
      return chatRoom && chatRoom.message.length > 0;
    });

    const unread = all.filter((room) => {
      const chatRoom = room.chatRoom[0];
      const message = chatRoom?.message[0];
      const isUnread = message && !message.seen;
      if (isUnread) {
        console.log(
          "📧 Unread message:",
          room.email,
          message?.message?.substring(0, 50)
        );
      }
      return isUnread;
    });

    const expired = all.filter((room) => {
      const chatRoom = room.chatRoom[0];
      const message = chatRoom?.message[0];
      const isExpired = message && new Date(message.createdAt) < oneDayAgo;
      if (isExpired) {
        console.log(
          "⏰ Expired message:",
          room.email,
          message.createdAt.toISOString()
        );
      }
      return isExpired;
    });

    console.log("📊 Filter results:");
    console.log("  - All chats:", all.length);
    console.log("  - Unread chats:", unread.length);
    console.log("  - Expired chats:", expired.length);

    return { unread, all, expired };
  }, [chatRooms]);

  const renderChatCards = (
    rooms: typeof chatRooms,
    isExpiredTab: boolean = false,
    tabName: string = "",
    showDelete: boolean = false
  ) => {
    if (!rooms || rooms.length === 0) {
      const emptyMessages = {
        unread: "No unread messages",
        all: "No conversations found",
        expired: "No expired conversations (older than 1 day)",
      };
      return (
        <CardDescription>
          {emptyMessages[tabName as keyof typeof emptyMessages] ||
            "No chats found"}
        </CardDescription>
      );
    }

    return rooms.map((room) => {
      const chatRoom = room.chatRoom[0];
      const message = chatRoom?.message[0];

      if (!chatRoom) return null;

      // ✅ NEW: Check if this message is expired
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const isExpired = message && new Date(message.createdAt) < oneDayAgo;

      return (
        <ChatCard
          seen={message?.seen}
          id={chatRoom.id}
          onChat={() => onGetActiveChatMessages(chatRoom.id)}
          onDelete={handleDeleteConversation}
          showDelete={showDelete}
          createdAt={message?.createdAt}
          key={chatRoom.id}
          title={room.email || "Unknown"}
          description={message?.message || "No messages"}
          customerName={room.name}
          customerEmail={room.email}
          customerPhone={room.phone}
          customerCountryCode={room.countryCode}
          isExpired={isExpiredTab ? isExpired : false} // ✅ Pass isExpired prop
        />
      );
    });
  };

  return (
    <div className="py-3 px-0">
      <TabsMenu classname="" triggers={TABS_MENU}>
        <TabsContent value="unread">
          <ConversationSearch
            domains={domains}
            register={register}
            setValue={setValue}
          />
          <div className="flex flex-col">
            {/* <Loader loading={loading}> */}
            {renderChatCards(filteredChatRooms.unread, false, "unread", false)}
            {/* </Loader> */}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <ConversationSearch
            domains={domains}
            register={register}
            setValue={setValue}
          />
          <div className="flex flex-col">
            {/* <Loader loading={loading}> */}
            {renderChatCards(filteredChatRooms.all, false, "all", true)}{" "}
            {/* ✅ Show delete in All tab */}
            {/* </Loader> */}
          </div>
        </TabsContent>

        <TabsContent value="expired">
          <ConversationSearch
            domains={domains}
            register={register}
            setValue={setValue}
          />
          <div className="flex flex-col">
            {/* <Loader loading={loading}> */}
            {renderChatCards(
              filteredChatRooms.expired,
              true,
              "expired",
              true
            )}{" "}
            {/* ✅ Show delete in Expired tab */}
            {/* </Loader> */}
          </div>
        </TabsContent>
      </TabsMenu>
    </div>
  );
};

export default ConversationMenu;
