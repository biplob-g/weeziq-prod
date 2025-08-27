import { onGetAllAccountDomains } from "@/actions/auth";
import {
  onGetDomainChatRooms,
  onGetChatMessages,
} from "@/actions/conversation";
import ConversationLayout from "@/components/conversations/ConversationLayout";
// import InfoBars from "@/components/infoBar";
import React from "react";

interface ConversationPageProps {
  searchParams: Promise<{ room?: string }>;
}

const ConversationPage = async ({ searchParams }: ConversationPageProps) => {
  const domains = await onGetAllAccountDomains();
  const resolvedSearchParams = await searchParams;

  // Fetch initial data server-side
  let initialChatRooms = null;
  let initialChatMessages = null;
  let initialSelectedConversation = null;

  if (domains?.domains && domains.domains.length > 0) {
    // Get chat rooms for the first domain (or selected domain)
    const domainId = domains.domains[0].id;
    initialChatRooms = await onGetDomainChatRooms(domainId);

    // If a specific room is requested, fetch its messages
    if (resolvedSearchParams.room) {
      initialChatMessages = await onGetChatMessages(resolvedSearchParams.room);

      // Find the customer info for the selected room
      if (initialChatRooms?.customer) {
        const targetCustomer = initialChatRooms.customer.find((customer) =>
          customer.chatRoom.some(
            (room) => room.id === resolvedSearchParams.room
          )
        );

        if (targetCustomer) {
          const targetRoom = targetCustomer.chatRoom.find(
            (room) => room.id === resolvedSearchParams.room
          );
          if (targetRoom) {
            initialSelectedConversation = {
              chatRoomId: resolvedSearchParams.room,
              customerId: targetCustomer.id,
              customerName: targetCustomer.name,
              customerEmail: targetCustomer.email,
              customerPhone: targetCustomer.phone,
              customerCountryCode: targetCustomer.countryCode,
              customerIpAddress: null, // Not available in this context
            };
          }
        }
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-5 py-2">{/* <InfoBars /> */}</div>
      <div className="flex-1 min-h-0">
        <ConversationLayout
          domains={domains?.domains}
          initialRoomId={resolvedSearchParams.room}
          initialChatRooms={initialChatRooms}
          initialChatMessages={initialChatMessages}
          initialSelectedConversation={initialSelectedConversation}
        />
      </div>
    </div>
  );
};

export default ConversationPage;
