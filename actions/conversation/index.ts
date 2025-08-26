"use server";

import { client } from "@/lib/prisma";
import { UserInfoFormProps } from "@/schemas/coversation.schema";
import { getClientIP } from "@/lib/ipUtils";
import { headers } from "next/headers";
// import PusherServer from "pusher";

export const onToggleRealtime = async (id: string, state: boolean) => {
  try {
    const chatRoom = await client.chatRoom.update({
      where: {
        id,
      },
      data: {
        live: state,
      },
      select: {
        id: true,
        live: true,
      },
    });

    if (chatRoom) {
      return {
        status: 200,
        message: chatRoom.live
          ? "Realtime mode enabled"
          : "realtime mode disabled",
        chatRoom,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export const onGetConversationMode = async (id: string) => {
  try {
    const mode = await client.chatRoom.findUnique({
      where: {
        id,
      },
      select: {
        live: true,
      },
    });
    console.log(mode);
    return mode;
  } catch (error) {
    console.log(error);
  }
};

export const onGetDomainChatRooms = async (id: string) => {
  try {
    const domains = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            countryCode: true,
            chatRoom: {
              select: {
                createdAt: true,
                id: true,
                message: {
                  select: {
                    message: true,
                    createdAt: true,
                    seen: true,
                  },
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 5, // ✅ Get more messages for better filtering
                },
              },
            },
          },
        },
      },
    });
    if (domains) {
      return domains;
    }
  } catch (error) {
    console.log(error);
  }
};

export const onGetChatMessages = async (id: string) => {
  try {
    const messages = await client.chatRoom.findMany({
      where: {
        id,
      },
      select: {
        id: true,
        live: true,
        message: {
          select: {
            id: true,
            role: true,
            message: true,
            createdAt: true,
            seen: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (messages) {
      return messages;
    }
  } catch (error) {
    console.log(error);
  }
};

export const onViewUnReadMessages = async (id: string) => {
  try {
    await client.chatMessage.updateMany({
      where: {
        chatRoomId: id,
      },
      data: {
        seen: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const onOwnerSendMessage = async (
  chatRoom: string,
  message: string,
  role: "assistant" | "user"
) => {
  try {
    const chat = await client.chatRoom.update({
      where: {
        id: chatRoom,
      },
      data: {
        message: {
          create: {
            message,
            role: role === "assistant" ? "OWNER" : "CUSTOMER",
          },
        },
      },
      select: {
        message: {
          select: {
            id: true,
            role: true,
            message: true,
            createdAt: true,
            seen: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (chat) {
      return chat;
    }
  } catch (error) {
    console.log(error);
  }
};

export const onCreateCustomerWithInfo = async (
  domainId: string,
  userInfo: UserInfoFormProps
) => {
  try {
    // Get client IP address
    const headersList = await headers();
    const clientIP = getClientIP(headersList);

    const customer = await client.customer.create({
      data: {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        countryCode: userInfo.countryCode,
        ipAddress: clientIP, // ✅ Store IP address
        domainId: domainId,
        chatRoom: {
          create: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        countryCode: true,
        ipAddress: true,
        domainId: true,
        createdAt: true,
        chatRoom: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (customer) {
      return { success: true, customer };
    }
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error("Failed to create customer");
  }
};

// ✅ NEW: Find existing customer by IP address with ALL chat rooms
export const onFindCustomerByIP = async (domainId: string) => {
  try {
    // ✅ FIXED: Skip IP detection if disabled via environment variable or in development
    if (
      process.env.SKIP_IP_DETECTION === "true" ||
      (process.env.NODE_ENV as string) === "development"
    ) {
      console.log(
        "🔄 IP detection disabled (development mode or env flag), skipping"
      );
      return null;
    }

    const headersList = await headers();
    const clientIP = getClientIP(headersList);

    // ✅ FIXED: Minimal logging to prevent console spam
    if (
      (process.env.NODE_ENV as string) === "development" &&
      process.env.DEBUG_IP === "true"
    ) {
      console.log("🔍 IP Detection:", { domainId, clientIP });
    }

    if (!clientIP) {
      console.log("❌ No client IP detected");
      return null;
    }

    // ✅ FIXED: Improved query to ensure we get ALL chat rooms for the customer
    const customer = await client.customer.findFirst({
      where: {
        ipAddress: clientIP,
        domainId: domainId,
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Within 14 days
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        countryCode: true,
        ipAddress: true,
        createdAt: true,
        // ✅ FIXED: Fetch ALL chat rooms for this customer without date filtering
        chatRoom: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            message: {
              select: {
                id: true,
                message: true,
                role: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc", // Most recent first
          },
        },
      },
    });

    // ✅ FIXED: Minimal logging to prevent console spam
    if (
      (process.env.NODE_ENV as string) === "development" &&
      process.env.DEBUG_IP === "true"
    ) {
      console.log("✅ Customer found by IP:", customer ? "YES" : "NO");
      if (customer) {
        console.log(
          "  - Customer:",
          customer.name,
          `(${customer.chatRoom?.length || 0} chat rooms)`
        );
      }
    }

    if (customer) {
      // ✅ FIXED: Filter chat rooms to only include those within 14 days AFTER fetching
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const filteredChatRooms =
        customer.chatRoom?.filter(
          (room) => room.createdAt >= fourteenDaysAgo
        ) || [];

      // ✅ FIXED: Return customer with filtered chat rooms
      return {
        ...customer,
        chatRoom: filteredChatRooms,
      };
    }

    return customer;
  } catch (error) {
    console.error("❌ Error finding customer by IP:", error);
    return null;
  }
};

// ✅ NEW: Get chat history for a customer
export const onGetCustomerChatHistory = async (customerId: string) => {
  try {
    const chatHistory = await client.customer.findUnique({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        countryCode: true,
        createdAt: true,
        chatRoom: {
          select: {
            id: true,
            createdAt: true,
            message: {
              select: {
                id: true,
                message: true,
                role: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    return chatHistory;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return null;
  }
};

// ✅ NEW: Update customer IP address (for returning users)
export const onUpdateCustomerIP = async (customerId: string) => {
  try {
    const headersList = await headers();
    const clientIP = getClientIP(headersList);

    const customer = await client.customer.update({
      where: {
        id: customerId,
      },
      data: {
        ipAddress: clientIP,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        countryCode: true,
        ipAddress: true,
      },
    });

    return customer;
  } catch (error) {
    console.error("Error updating customer IP:", error);
    return null;
  }
};

// ✅ NEW: Clean up old customer records (older than 14 days)
export const onCleanupOldCustomers = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const deletedCount = await client.customer.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${deletedCount.count} old customer records`);
    return deletedCount.count;
  } catch (error) {
    console.error("Error cleaning up old customers:", error);
    return 0;
  }
};

// ✅ NEW: Clean up old chat rooms and customers (14-day retention)
export const onCleanupOldData = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    console.log("🧹 Starting cleanup of data older than 14 days...");
    console.log("📅 Cutoff date:", cutoffDate.toISOString());

    // Delete old chat rooms (this will cascade to messages and AI usage)
    const deletedChatRooms = await client.chatRoom.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    // Delete old customers (this will cascade to chat rooms)
    const deletedCustomers = await client.customer.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`✅ Cleanup completed:`);
    console.log(`  - Deleted ${deletedChatRooms.count} old chat rooms`);
    console.log(`  - Deleted ${deletedCustomers.count} old customers`);

    return {
      success: true,
      deletedChatRooms: deletedChatRooms.count,
      deletedCustomers: deletedCustomers.count,
    };
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    return {
      success: false,
      error: "Failed to cleanup old data",
    };
  }
};

export const onGetCustomerInfo = async (customerId: string) => {
  try {
    const customer = await client.customer.findUnique({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        countryCode: true,
        ipAddress: true, // Include IP address
        createdAt: true, // Include creation date
        domainId: true,
        chatRoom: {
          select: {
            id: true,
            createdAt: true,
            live: true,
            message: {
              select: {
                id: true,
                message: true,
                role: true,
                createdAt: true,
                seen: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1, // Get the latest message for status
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get the latest chat room
        },
      },
    });

    if (customer) {
      // Calculate additional metrics
      const latestChatRoom = customer.chatRoom?.[0];
      const latestMessage = latestChatRoom?.message?.[0];

      return {
        ...customer,
        lastActiveAt: latestMessage?.createdAt || customer.createdAt,
        isOnline: latestChatRoom?.live || false,
        hasUnreadMessages: latestMessage ? !latestMessage.seen : false,
      };
    }
  } catch (error) {
    console.error("Error fetching customer info:", error);
    throw new Error("Failed to fetch customer information");
  }
};

// ✅ NEW: Delete conversation/chat room
export const onDeleteConversation = async (chatRoomId: string) => {
  try {
    console.log("🗑️ Deleting conversation:", chatRoomId);

    // First, check if the chat room exists
    const existingChatRoom = await client.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: { id: true, customerId: true },
    });

    if (!existingChatRoom) {
      throw new Error("Chat room not found");
    }

    // Delete the chat room (this will cascade delete messages due to foreign key constraints)
    const deletedChatRoom = await client.chatRoom.delete({
      where: {
        id: chatRoomId,
      },
      select: {
        id: true,
        customerId: true,
      },
    });

    console.log("✅ Conversation deleted successfully:", deletedChatRoom.id);
    return { success: true, deletedChatRoom };
  } catch (error) {
    console.error("❌ Error deleting conversation:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        throw new Error("Conversation not found");
      } else if (error.message.includes("foreign key")) {
        throw new Error(
          "Cannot delete conversation due to existing references"
        );
      } else {
        throw new Error(`Failed to delete conversation: ${error.message}`);
      }
    }

    throw new Error("Failed to delete conversation");
  }
};

// ✅ NEW: Socket.io real-time chat function
export const onRealTimeChat = async (
  chatroomId: string,
  message: string,
  id: string,
  role: "assistant" | "user",
  userId?: string,
  userName?: string
) => {
  try {
    // For now, we'll use a simpler approach - the client will handle the broadcasting
    // This avoids the server-side import issues
    console.log(`📡 Socket.io: Message ready for room ${chatroomId}`);
    console.log(`📡 Message: ${message.substring(0, 50)}...`);
    console.log(`📡 Role: ${role}, User: ${userName || "Unknown"}`);

    // The actual broadcasting will be handled by the client-side Socket.io
    // This function is called after the message is stored in the database
    return { success: true, message: "Message ready for real-time broadcast" };
  } catch (error) {
    console.error("❌ Error in real-time chat function:", error);
    return { success: false, error: "Failed to process real-time message" };
  }
};

// ✅ NEW: Get all chat rooms for a customer (for conversation history) with 14-day retention
export const onGetAllCustomerChatRooms = async (customerId: string) => {
  try {
    const customer = await client.customer.findUnique({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        countryCode: true,
        createdAt: true,
        chatRoom: {
          where: {
            // ✅ NEW: Only include chat rooms created within 14 days
            createdAt: {
              gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            },
          },
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            message: {
              select: {
                id: true,
                message: true,
                role: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc", // Most recent first
          },
        },
      },
    });

    return customer;
  } catch (error) {
    console.error("Error fetching all customer chat rooms:", error);
    return null;
  }
};
