"use client";

import {
  onGetConversationMode,
  onToggleRealtime,
} from "@/actions/conversation";
import { useChatContext } from "@/context/useChatContext";
import { useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const useSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [realtime, setRealtime] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Determine if we're on the dashboard page
  const isDashboardPage = pathname === "/dashboard";

  // Start with expanded sidebar only on dashboard, collapsed on other pages
  const [open, setOpen] = useState<boolean>(isDashboardPage);

  // Update sidebar state when pathname changes
  useEffect(() => {
    setOpen(isDashboardPage);
  }, [pathname, isDashboardPage]);

  const { chatRoom } = useChatContext();
  const onActivateRealtime = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const realtime = await onToggleRealtime(
        chatRoom!,
        e.target.ariaChecked === "true" ? false : true
      );
      if (realtime) {
        setRealtime(realtime.chatRoom.live);
        toast.success(realtime.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onGetCurrentMode = useCallback(async () => {
    setLoading(true);
    const mode = await onGetConversationMode(chatRoom!);
    if (mode) {
      setRealtime(mode.live);
      setLoading(false);
    }
  }, [chatRoom]);

  useEffect(() => {
    if (chatRoom) {
      onGetCurrentMode();
    }
  }, [chatRoom, onGetCurrentMode]);

  const page = pathname.split("/").pop();

  const { signOut } = useClerk();
  const onSignOut = () => signOut(() => router.push("/"));
  const onExpand = (newOpen: boolean) => setOpen(newOpen);

  return {
    expand: open, // Keep for backward compatibility
    open, // New property for shadcn/ui sidebar
    onExpand,
    page,
    onSignOut,
    realtime,
    onActivateRealtime,
    chatRoom,
    loading,
  };
};

export default useSidebar;
