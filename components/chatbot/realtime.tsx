import React from "react";
import { useRealtime } from "@/hooks/chatbot/useChatBot";

type Props = {
  chatRoomId: string;
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: "user" | "assistant";
        content: string;
        link?: string | undefined;
      }[]
    >
  >;
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
};

const RealTimeMode = ({ chatRoomId, setChats, setAllChatRooms }: Props) => {
  // ✅ NEW: Use realtime hook for socket.io integration
  useRealtime(chatRoomId, setChats, setAllChatRooms);

  return (
    // <div className="px-3 rounded-full py-1 bg-green-500 font-bold text-white text-sm">
    //   Real Time Active
    // </div>
    <h1></h1>
  );
};

export default RealTimeMode;
