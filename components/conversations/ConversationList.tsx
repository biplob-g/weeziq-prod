"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useConversation } from "@/hooks/conversation/useConversation";
import { TABS_MENU } from "@/constants/menu";
import { TabsContent } from "../ui/tabs";
import TabsMenu from "../tabs";
import ConversationSearch from "./search";
import ChatCard from "./chatCard";
import { CardDescription } from "../ui/card";
import { onDeleteConversation } from "@/actions/conversation";
import { toast } from "sonner";
import { onGetDomainChatRooms } from "@/actions/conversation";
import { SelectedConversation } from "./ConversationLayout";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Search, ArrowUpDown } from "lucide-react";

type Props = {
  domains?:
    | {
        name: string;
        id: string;
        icon: string;
      }[]
    | undefined;
  onConversationSelect: (conversation: SelectedConversation) => void;
  selectedConversationId?: string;
  initialRoomId?: string;
  initialChatRooms?: any;
};

const ConversationList = ({
  domains,
  onConversationSelect,
  selectedConversationId,
  initialRoomId,
  initialChatRooms,
}: Props) => {
  const {
    register,
    setValue,
    chatRooms,
    onGetActiveChatMessages,
    setChatRooms,
  } = useConversation();

  // Sorting state
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize with server-side data
  useEffect(() => {
    if (initialChatRooms && !chatRooms) {
      setChatRooms(initialChatRooms.customer);
    }
  }, [initialChatRooms, chatRooms, setChatRooms]);

  // Auto-select conversation when initialRoomId is provided
  useEffect(() => {
    if (
      initialRoomId &&
      (chatRooms || initialChatRooms) &&
      !selectedConversationId
    ) {
      const roomsToSearch = chatRooms || initialChatRooms?.customer;
      const targetCustomer = roomsToSearch.find((customer: any) =>
        customer.chatRoom.some((room: any) => room.id === initialRoomId)
      );

      if (targetCustomer) {
        const targetRoom = targetCustomer.chatRoom.find(
          (room: any) => room.id === initialRoomId
        );
        if (targetRoom) {
          handleConversationClick(initialRoomId, targetCustomer);
        }
      }
    }
  }, [initialRoomId, chatRooms, initialChatRooms, selectedConversationId]);

  // Handle conversation selection
  const handleConversationClick = (chatRoomId: string, customerInfo: any) => {
    onGetActiveChatMessages(chatRoomId);
    onConversationSelect({
      chatRoomId,
      customerId: customerInfo.id,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      customerCountryCode: customerInfo.countryCode,
      customerIpAddress: customerInfo.ipAddress,
    });
  };

  // Handle delete conversation
  const handleDeleteConversation = async (chatRoomId: string) => {
    try {
      await onDeleteConversation(chatRoomId);
      toast.success("Conversation deleted successfully");

      // Refresh the chat rooms list
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

  // Sort function for chat rooms
  const sortChatRooms = (rooms: any[]) => {
    return rooms.sort((a, b) => {
      const aMessage = a.chatRoom[0]?.message[0];
      const bMessage = b.chatRoom[0]?.message[0];

      if (!aMessage || !bMessage) return 0;

      const aDate = new Date(aMessage.createdAt);
      const bDate = new Date(bMessage.createdAt);

      return sortOrder === "newest"
        ? bDate.getTime() - aDate.getTime()
        : aDate.getTime() - bDate.getTime();
    });
  };

  // Search function for chat rooms
  const searchChatRooms = (rooms: any[]) => {
    if (!searchQuery.trim()) return rooms;

    const query = searchQuery.toLowerCase();
    return rooms.filter((room: any) => {
      const customerName = room.name?.toLowerCase() || "";
      const customerEmail = room.email?.toLowerCase() || "";
      const customerPhone = room.phone?.toLowerCase() || "";
      const lastMessage =
        room.chatRoom[0]?.message[0]?.message?.toLowerCase() || "";

      return (
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        customerPhone.includes(query) ||
        lastMessage.includes(query)
      );
    });
  };

  // Filter chat rooms based on different criteria
  const filteredChatRooms = useMemo(() => {
    if (!chatRooms) return { unread: [], all: [], expired: [] };

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago

    const all = chatRooms.filter((room: any) => {
      const chatRoom = room.chatRoom[0];
      return chatRoom && chatRoom.message.length > 0;
    });

    const unread = all.filter((room: any) => {
      const chatRoom = room.chatRoom[0];
      const message = chatRoom?.message[0];
      return message && !message.seen;
    });

    const expired = all.filter((room: any) => {
      const chatRoom = room.chatRoom[0];
      const message = chatRoom?.message[0];
      return message && new Date(message.createdAt) < oneDayAgo;
    });

    // Apply search and sort to each category
    return {
      all: sortChatRooms(searchChatRooms(all)),
      unread: sortChatRooms(searchChatRooms(unread)),
      expired: sortChatRooms(searchChatRooms(expired)),
    };
  }, [chatRooms, sortOrder, searchQuery]);

  const renderChatCards = (
    rooms: any[],
    isExpiredTab: boolean = false,
    tabName: string = "",
    showDelete: boolean = false
  ) => {
    if (!rooms || rooms.length === 0) {
      const emptyMessages = {
        unread: searchQuery ? "No unread messages found" : "No unread messages",
        all: searchQuery ? "No conversations found" : "No conversations found",
        expired: searchQuery
          ? "No expired conversations found"
          : "No expired conversations (older than 1 day)",
      };
      return (
        <CardDescription className="p-4 text-center">
          {emptyMessages[tabName as keyof typeof emptyMessages] ||
            "No chats found"}
        </CardDescription>
      );
    }

    return rooms.map((room: any) => {
      const chatRoom = room.chatRoom[0];
      const message = chatRoom?.message[0];

      if (!chatRoom) return null;

      // Check if this message is expired
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const isExpired = message && new Date(message.createdAt) < oneDayAgo;

      // Check if this conversation is selected
      const isSelected = selectedConversationId === chatRoom.id;

      return (
        <ChatCard
          seen={message?.seen}
          id={chatRoom.id}
          onChat={() => handleConversationClick(chatRoom.id, room)}
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
          isExpired={isExpiredTab ? isExpired : false}
          isSelected={isSelected} // Pass selection state
        />
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <TabsMenu classname="h-full" triggers={TABS_MENU}>
          <TabsContent value="all" className="h-full mt-0">
            {/* Search and Sort Bar */}
            <div className=" border-b border-border">
              <div className="space-y-3 flex gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Sort Filter */}
                <div className="flex items-center gap-2">
                  <Select
                    value={sortOrder}
                    onValueChange={(value: "newest" | "oldest") =>
                      setSortOrder(value)
                    }
                  >
                    <SelectTrigger className="w-10 h-8 p-0 mt-[-10px]">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-3">
              <ConversationSearch
                domains={domains}
                register={register}
                setValue={setValue}
              />
            </div>
            <div className="flex flex-col overflow-y-auto">
              {renderChatCards(filteredChatRooms.all, false, "all", true)}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="h-full mt-0">
            {/* Search and Sort Bar */}
            <div className="p-4 border-b border-border">
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search unread conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Sort Filter */}
                <div className="flex items-center gap-2">
                  <Select
                    value={sortOrder}
                    onValueChange={(value: "newest" | "oldest") =>
                      setSortOrder(value)
                    }
                  >
                    <SelectTrigger className="w-10 h-8 p-0">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-3">
              <ConversationSearch
                domains={domains}
                register={register}
                setValue={setValue}
              />
            </div>
            <div className="flex flex-col overflow-y-auto">
              {renderChatCards(
                filteredChatRooms.unread,
                false,
                "unread",
                false
              )}
            </div>
          </TabsContent>

          <TabsContent value="expired" className="h-full mt-0">
            {/* Search and Sort Bar */}
            <div className="p-4 border-b border-border">
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search expired conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Sort Filter */}
                <div className="flex items-center gap-2">
                  <Select
                    value={sortOrder}
                    onValueChange={(value: "newest" | "oldest") =>
                      setSortOrder(value)
                    }
                  >
                    <SelectTrigger className="w-10 h-8 p-0">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-3">
              <ConversationSearch
                domains={domains}
                register={register}
                setValue={setValue}
              />
            </div>
            <div className="flex flex-col overflow-y-auto">
              {renderChatCards(
                filteredChatRooms.expired,
                true,
                "expired",
                true
              )}
            </div>
          </TabsContent>
        </TabsMenu>
      </div>
    </div>
  );
};

export default ConversationList;
