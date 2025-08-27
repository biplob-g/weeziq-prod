"use client";

import { createContext, useContext, useState } from "react";

type ChatInitialValueProps = {
  realtime: boolean;
  setRealtime: React.Dispatch<React.SetStateAction<boolean>>;
  chatRoom: string | undefined;
  setChatRoom: React.Dispatch<React.SetStateAction<string | undefined>>;
  chatRooms: any[];
  setChatRooms: React.Dispatch<React.SetStateAction<any[]>>;
  chats: {
    message: string;
    id: string;
    role: "assistant" | "user" | null;
    createdAt: Date;
    seen: boolean;
  }[];
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        message: string;
        id: string;
        role: "assistant" | "user" | null;
        createdAt: Date;
        seen: boolean;
      }[]
    >
  >;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatInitialValues: ChatInitialValueProps = {
  chatRoom: undefined,
  setChatRoom: () => undefined,
  chatRooms: [],
  setChatRooms: () => undefined,
  chats: [],
  setChats: () => undefined,
  loading: false,
  setLoading: () => undefined,
  realtime: false,
  setRealtime: () => undefined,
};

const chatContext = createContext(ChatInitialValues);
const { Provider } = chatContext;

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState(ChatInitialValues.chats);
  const [loading, setLoading] = useState(ChatInitialValues.loading);
  const [chatRoom, setChatRoom] = useState(ChatInitialValues.chatRoom);
  const [chatRooms, setChatRooms] = useState(ChatInitialValues.chatRooms);
  const [realtime, setRealtime] = useState(ChatInitialValues.realtime);

  const values = {
    chats,
    setChats,
    loading,
    setLoading,
    chatRoom,
    setChatRoom,
    chatRooms,
    setChatRooms,
    realtime,
    setRealtime,
  };
  return <Provider value={values}>{children}</Provider>;
};

export const useChatContext = () => {
  const state = useContext(chatContext);
  return state;
};
