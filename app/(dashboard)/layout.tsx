import { onLoginUser } from "@/actions/auth";
import SideBar from "@/components/Sidebar";
import SidebarWrapper from "@/components/Sidebar/SidebarWrapper";
import { SidebarInset } from "@/components/ui/sidebar";
import { ChatProvider } from "@/context/useChatContext";
import React from "react";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

const OwnerLayout = async ({ children }: Props) => {
  const authenticated = await onLoginUser();

  // If not authenticated, redirect to sign-up page
  if (!authenticated) {
    redirect("/auth/sign-up");
  }

  return (
    <ChatProvider>
      <SidebarWrapper>
        <SideBar domains={authenticated.domain} />
        <SidebarInset>
          <div className="flex-1 flex flex-col p-6">{children}</div>
        </SidebarInset>
      </SidebarWrapper>
    </ChatProvider>
  );
};

export default OwnerLayout;
