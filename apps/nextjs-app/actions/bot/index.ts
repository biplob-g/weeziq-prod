"use server";

import { client } from "@/lib/prisma";

export async function onGetCurrentChatBot(id: string) {
  try {
    console.log("🔍 Searching for domain with ID:", id);

    const chatbot = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        helpdesk: {
          select: {
            id: true,
            question: true,
            answered: true,
            domainId: true,
          },
        },
        name: true,
        chatBot: {
          select: {
            id: true,
            welcomeMessage: true,
            icon: true,
            textColor: true,
            background: true,
            helpdesk: true,
            taskSummary: true,
          },
        },
      },
    });

    // If domain exists but has no chatBot, create a default one
    if (chatbot && !chatbot.chatBot) {
      console.log(
        "🔄 Domain found but no chatBot exists, creating default chatBot..."
      );

      const updatedDomain = await client.domain.update({
        where: { id },
        data: {
          chatBot: {
            create: {
              welcomeMessage: "Hello! How can I help you today?",
              helpdesk: true,
            },
          },
        },
        select: {
          helpdesk: {
            select: {
              id: true,
              question: true,
              answered: true,
              domainId: true,
            },
          },
          name: true,
          chatBot: {
            select: {
              id: true,
              welcomeMessage: true,
              icon: true,
              textColor: true,
              background: true,
              helpdesk: true,
              taskSummary: true,
            },
          },
        },
      });

      console.log("✅ Default chatBot created:", updatedDomain);
      return updatedDomain;
    }

    console.log("📋 Domain query result:", chatbot);

    if (chatbot) {
      console.log("✅ Domain found:", chatbot.name);
      console.log("📚 Help desk questions:", chatbot.helpdesk?.length || 0);
      console.log("📝 Task summary available:", !!chatbot.chatBot?.taskSummary);
      return chatbot;
    } else {
      console.log("❌ No domain found with ID:", id);
      return null;
    }
  } catch (error) {
    console.error("💥 Database error in onGetCurrentChatBot:", error);
    return null;
  }
}

export async function onStoreConversations(
  id: string,
  message: string,
  role: "assistant" | "user"
) {
  console.log(id, ":", message);

  const result = await client.chatRoom.update({
    where: {
      id,
    },
    data: {
      message: {
        create: {
          message,
          role: role === "user" ? "CUSTOMER" : "OWNER",
        },
      },
    },
    include: {
      message: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // Return the ID of the newly created message
  return result.message[0]?.id || null;
}

export async function onAiChatBotAssistant(
  id: string,
  chatHistory: { role: "assistant" | "user"; content: string }[],
  author: string,
  message: string,
  providedCustomerEmail?: string
) {
  try {
    console.log("🤖 AI ChatBot Assistant called with:", {
      id,
      chatLength: chatHistory.length,
      author,
      messageLength: message.length,
      providedCustomerEmail,
    });

    // ✅ NEW: Use WebSocket service for AI responses instead of direct OpenAI API
    const wsServiceUrl =
      process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8787";

    try {
      const response = await fetch(`${wsServiceUrl}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationId: `chatbot-${id}`,
          domainId: id,
          userId: providedCustomerEmail || "anonymous",
          customerData: {
            email: providedCustomerEmail,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`WebSocket service responded with ${response.status}`);
      }

      const aiResponse = await response.json();
      console.log("🤖 AI Response from WebSocket service:", aiResponse);

      return {
        response: {
          role: "assistant",
          content:
            aiResponse.message || "I'm sorry, I couldn't process that request.",
        },
        // Add these properties to match the expected type
        live: false,
        chatRoom: null,
      };
    } catch (wsError) {
      console.error("❌ WebSocket service error:", wsError);

      // Fallback response if WebSocket service fails
      return {
        response: {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
        // Add these properties to match the expected type
        live: false,
        chatRoom: null,
      };
    }
  } catch (error) {
    console.error("❌ AI ChatBot Assistant Error:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
