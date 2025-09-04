import { ChatRoomDurableObject } from "./chatroom";
import { DatabaseService } from "./database";
import { AIService } from "./ai";

export interface Env {
  CHATROOMS: DurableObjectNamespace;
  OPENAI_API_KEY: string;
  GOOGLE_AI_API_KEY: string;
  DATABASE_URL: string;
  NEXTJS_API_URL: string;
  ALLOWED_ORIGINS: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // WebSocket connection for real-time chat
    if (url.pathname === "/ws") {
      const roomId = url.searchParams.get("roomId") || "default";
      const id = env.CHATROOMS.idFromName(roomId);
      const obj = env.CHATROOMS.get(id);
      return obj.fetch(request);
    }

    // AI chat endpoint (non-streaming)
    if (url.pathname === "/ai/chat" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          message: string;
          context?: string;
          model?: "openai" | "google";
        };

        const aiService = new AIService(env);
        const response = await aiService.getResponse(
          body.message,
          body.context,
          body.model
        );

        return new Response(JSON.stringify({ response }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error("AI chat error:", error);
        return new Response(JSON.stringify({ error: "AI service error" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    // AI streaming endpoint
    if (url.pathname === "/ai/stream" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          message: string;
          context?: string;
          model?: "openai" | "google";
        };

        const aiService = new AIService(env);

        const stream = new ReadableStream({
          async start(controller) {
            try {
              const response = await aiService.getResponse(
                body.message,
                body.context,
                body.model
              );
              controller.enqueue(new TextEncoder().encode(response));
              controller.close();
            } catch (error) {
              console.error("Streaming error:", error);
              const errorMessage =
                "Sorry, I encountered an error. Please try again.";
              controller.enqueue(new TextEncoder().encode(errorMessage));
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error("AI streaming error:", error);
        return new Response(
          JSON.stringify({ error: "AI streaming service error" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Database operations via API
    if (url.pathname === "/api/messages" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          message: string;
          role: "user" | "assistant";
          chatRoomId: string;
        };

        const databaseService = new DatabaseService(env.NEXTJS_API_URL);
        const savedMessage = await databaseService.saveMessage(body);

        return new Response(JSON.stringify(savedMessage), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error("Database operation error:", error);
        return new Response(
          JSON.stringify({ error: "Database operation failed" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Get chat history
    if (url.pathname === "/api/messages" && request.method === "GET") {
      try {
        const chatRoomId = url.searchParams.get("chatRoomId");
        if (!chatRoomId) {
          return new Response(
            JSON.stringify({ error: "Chat room ID required" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        const databaseService = new DatabaseService(env.NEXTJS_API_URL);
        const history = await databaseService.getChatHistory(chatRoomId);

        return new Response(JSON.stringify(history), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error("Get chat history error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to get chat history" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Health check
    return new Response(
      JSON.stringify({
        status: "WebSocket Service Running",
        timestamp: new Date().toISOString(),
        endpoints: {
          websocket: "/ws?roomId=<roomId>",
          aiChat: "/ai/chat",
          aiStream: "/ai/stream",
          messages: "/api/messages",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  },
};

export { ChatRoomDurableObject };
