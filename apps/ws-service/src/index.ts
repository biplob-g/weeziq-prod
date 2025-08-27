import { Hono } from "hono";
import { cors } from "hono/cors";
import { AIHandler } from "./ai-handler.js";

// Define environment types for Cloudflare Workers
interface Env {
  CHAT_ROOM: DurableObjectNamespace;
  VISITOR_TRACKER: DurableObjectNamespace;
  CHAT_STORAGE?: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// Get allowed origins from environment or use defaults
const getAllowedOrigins = (env: Env) => {
  // In Cloudflare Workers, we'll use environment variables set via wrangler secret
  // For now, return default origins
  return [
    "http://localhost:3000",
    "https://your-vercel-domain.vercel.app",
    "https://weeziq.com",
    "https://app.weeziq.com",
    "https://*.vercel.app",
  ];
};

// CORS middleware with proper origins for deployment
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowedOrigins = getAllowedOrigins(c.env);
      return allowedOrigins.includes(origin) ? origin : undefined;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check endpoint
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "WeeziQ WebSocket service is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// WebSocket upgrade endpoint with Durable Object integration
app.get("/ws", async (c) => {
  const upgradeHeader = c.req.header("Upgrade");

  if (upgradeHeader !== "websocket") {
    return c.json({ error: "Expected websocket" }, 400);
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  // Handle WebSocket connection
  server.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(event.data as string);

      // Handle different message types
      switch (data.type) {
        case "join-room":
          await handleJoinRoom(data, server, c.env);
          break;
        case "send-message":
          await handleSendMessage(data, server, c.env);
          break;
        case "typing-start":
          await handleTypingStart(data, server, c.env);
          break;
        case "typing-stop":
          await handleTypingStop(data, server, c.env);
          break;
        case "user-online":
          await handleUserOnline(data, server, c.env);
          break;
        case "visitor-joined-domain":
          await handleVisitorJoinedDomain(data, server, c.env);
          break;
        case "visitor-left-domain":
          await handleVisitorLeftDomain(data, server, c.env);
          break;
        case "visitor-activity":
          await handleVisitorActivity(data, server, c.env);
          break;
        case "get-domain-stats":
          await handleGetDomainStats(data, server, c.env);
          break;
        case "get-all-domain-stats":
          await handleGetAllDomainStats(server, c.env);
          break;
        case "customer-joined-room":
          await handleCustomerJoinedRoom(data, server, c.env);
          break;
        case "ai-chat":
          await handleAIChat(data, server, c.env);
          break;
        case "ai-stream":
          await handleAIStream(data, server, c.env);
          break;
        default:
          server.send(JSON.stringify({ error: "Unknown message type" }));
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
      server.send(
        JSON.stringify({ error: "Invalid JSON or processing error" })
      );
    }
  });

  server.addEventListener("close", () => {
    console.log("WebSocket connection closed");
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
});

// AI streaming endpoint
app.post("/ai/stream", async (c) => {
  try {
    const body = await c.req.json();
    const {
      message,
      model = "gpt-3.5-turbo",
      domainId,
      userId,
      conversationId,
    } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const aiHandler = new AIHandler();
          await aiHandler.streamResponse(
            message,
            model,
            domainId,
            controller,
            userId,
            conversationId
          );
        } catch (error) {
          console.error("AI streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// AI chat endpoint (non-streaming)
app.post("/ai/chat", async (c) => {
  try {
    const body = await c.req.json();
    const {
      message,
      model = "gpt-3.5-turbo",
      domainId,
      userId,
      conversationId,
    } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const aiHandler = new AIHandler();
    const response = await aiHandler.getResponse(
      message,
      model,
      domainId,
      userId,
      conversationId
    );

    return c.json(response);
  } catch (error) {
    console.error("AI chat error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Visitor tracking endpoints
app.post("/visitors/add", async (c) => {
  try {
    const body = await c.req.json();
    const { domainId, visitorId, visitorData } = body;

    if (!domainId || !visitorId) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const visitorTracker = c.env.VISITOR_TRACKER.get(
      c.env.VISITOR_TRACKER.idFromName(domainId)
    );
    const response = await visitorTracker.fetch(
      new Request("http://localhost/visitors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, visitorId, visitorData }),
      })
    );

    const result = (await response.json()) as any;
    return c.json(result);
  } catch (error) {
    console.error("Error adding visitor:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/visitors/remove", async (c) => {
  try {
    const body = await c.req.json();
    const { domainId, visitorId } = body;

    if (!domainId || !visitorId) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const visitorTracker = c.env.VISITOR_TRACKER.get(
      c.env.VISITOR_TRACKER.idFromName(domainId)
    );
    const response = await visitorTracker.fetch(
      new Request("http://localhost/visitors/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, visitorId }),
      })
    );

    const result = (await response.json()) as any;
    return c.json(result);
  } catch (error) {
    console.error("Error removing visitor:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/stats/domain/:domainId", async (c) => {
  try {
    const domainId = c.req.param("domainId");

    if (!domainId) {
      return c.json({ error: "Missing domainId parameter" }, 400);
    }

    const visitorTracker = c.env.VISITOR_TRACKER.get(
      c.env.VISITOR_TRACKER.idFromName(domainId)
    );
    const response = await visitorTracker.fetch(
      new Request(`http://localhost/stats/domain?domainId=${domainId}`)
    );

    const result = (await response.json()) as any;
    return c.json(result);
  } catch (error) {
    console.error("Error getting domain stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// WebSocket message handlers with Durable Object integration
async function handleJoinRoom(data: any, ws: WebSocket, env: Env) {
  const { roomId, userId, userName } = data;

  try {
    const chatRoom = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromName(roomId));
    const response = await chatRoom.fetch(
      new Request("http://localhost/websocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "join-room", roomId, userId, userName }),
      })
    );

    if (response.ok) {
      ws.send(
        JSON.stringify({
          type: "joined-room",
          roomId,
          success: true,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Failed to join room",
          timestamp: new Date().toISOString(),
        })
      );
    }
  } catch (error) {
    console.error("Error joining room:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      })
    );
  }
}

async function handleSendMessage(data: any, ws: WebSocket, env: Env) {
  const { roomId, message, userId, userName, role } = data;

  try {
    const chatRoom = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromName(roomId));
    const response = await chatRoom.fetch(
      new Request("http://localhost/websocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "send-message",
          roomId,
          message,
          userId,
          userName,
          role,
        }),
      })
    );

    if (response.ok) {
      ws.send(
        JSON.stringify({
          type: "message-sent",
          success: true,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Failed to send message",
          timestamp: new Date().toISOString(),
        })
      );
    }
  } catch (error) {
    console.error("Error sending message:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      })
    );
  }
}

async function handleTypingStart(data: any, ws: WebSocket, env: Env) {
  const { roomId, userId, userName } = data;

  try {
    const chatRoom = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromName(roomId));
    await chatRoom.fetch(
      new Request("http://localhost/websocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "typing-start",
          roomId,
          userId,
          userName,
        }),
      })
    );
  } catch (error) {
    console.error("Error handling typing start:", error);
  }
}

async function handleTypingStop(data: any, ws: WebSocket, env: Env) {
  const { roomId, userId } = data;

  try {
    const chatRoom = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromName(roomId));
    await chatRoom.fetch(
      new Request("http://localhost/websocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "typing-stop", roomId, userId }),
      })
    );
  } catch (error) {
    console.error("Error handling typing stop:", error);
  }
}

async function handleUserOnline(data: any, ws: WebSocket, env: Env) {
  const { roomId, userId, userName } = data;

  try {
    const chatRoom = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromName(roomId));
    await chatRoom.fetch(
      new Request("http://localhost/websocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "user-online", roomId, userId, userName }),
      })
    );
  } catch (error) {
    console.error("Error handling user online:", error);
  }
}

async function handleVisitorJoinedDomain(data: any, ws: WebSocket, env: Env) {
  const { domainId, visitorId, visitorData } = data;

  try {
    const visitorTracker = env.VISITOR_TRACKER.get(
      env.VISITOR_TRACKER.idFromName(domainId)
    );
    const response = await visitorTracker.fetch(
      new Request("http://localhost/visitors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, visitorId, visitorData }),
      })
    );

    if (response.ok) {
      const result = (await response.json()) as any;
      ws.send(
        JSON.stringify({
          type: "visitor-joined-domain",
          domainId,
          visitorId,
          visitorData,
          activeCount: result.domainStats?.activeVisitors || 0,
          timestamp: new Date().toISOString(),
        })
      );
    }
  } catch (error) {
    console.error("Error handling visitor joined domain:", error);
  }
}

async function handleVisitorLeftDomain(data: any, ws: WebSocket, env: Env) {
  const { domainId, visitorId } = data;

  try {
    const visitorTracker = env.VISITOR_TRACKER.get(
      env.VISITOR_TRACKER.idFromName(domainId)
    );
    const response = await visitorTracker.fetch(
      new Request("http://localhost/visitors/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, visitorId }),
      })
    );

    if (response.ok) {
      const result = (await response.json()) as any;
      ws.send(
        JSON.stringify({
          type: "visitor-left-domain",
          domainId,
          visitorId,
          activeCount: result.domainStats?.activeVisitors || 0,
          timestamp: new Date().toISOString(),
        })
      );
    }
  } catch (error) {
    console.error("Error handling visitor left domain:", error);
  }
}

async function handleVisitorActivity(data: any, ws: WebSocket, env: Env) {
  const { domainId, visitorId } = data;

  try {
    const visitorTracker = env.VISITOR_TRACKER.get(
      env.VISITOR_TRACKER.idFromName(domainId)
    );
    await visitorTracker.fetch(
      new Request("http://localhost/visitors/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, visitorId }),
      })
    );
  } catch (error) {
    console.error("Error handling visitor activity:", error);
  }
}

async function handleGetDomainStats(data: any, ws: WebSocket, env: Env) {
  const { domainId } = data;

  try {
    const visitorTracker = env.VISITOR_TRACKER.get(
      env.VISITOR_TRACKER.idFromName(domainId)
    );
    const response = await visitorTracker.fetch(
      new Request(`http://localhost/stats/domain?domainId=${domainId}`)
    );

    if (response.ok) {
      const stats = (await response.json()) as any;
      ws.send(
        JSON.stringify({
          type: "domain-stats",
          domainId,
          ...stats,
          timestamp: new Date().toISOString(),
        })
      );
    }
  } catch (error) {
    console.error("Error getting domain stats:", error);
  }
}

async function handleGetAllDomainStats(ws: WebSocket, env: Env) {
  try {
    // This would need to be implemented to get stats from all domains
    // For now, return empty stats
    ws.send(
      JSON.stringify({
        type: "all-domain-stats",
        stats: {},
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error getting all domain stats:", error);
  }
}

async function handleCustomerJoinedRoom(data: any, ws: WebSocket, env: Env) {
  const { roomId, customerId, customerName } = data;

  try {
    const chatRoom = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromName(roomId));
    await chatRoom.fetch(
      new Request("http://localhost/websocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "customer-joined-room",
          roomId,
          customerId,
          customerName,
        }),
      })
    );
  } catch (error) {
    console.error("Error handling customer joined room:", error);
  }
}

async function handleAIChat(data: any, ws: WebSocket, env: Env) {
  const { message, model, domainId, userId, conversationId } = data;

  try {
    const aiHandler = new AIHandler();
    const response = await aiHandler.getResponse(
      message,
      model,
      domainId,
      userId,
      conversationId
    );

    ws.send(
      JSON.stringify({
        type: "ai-response",
        ...response,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error handling AI chat:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to get AI response",
        timestamp: new Date().toISOString(),
      })
    );
  }
}

async function handleAIStream(data: any, ws: WebSocket, env: Env) {
  const { message, model, domainId, userId, conversationId } = data;

  try {
    const aiHandler = new AIHandler();
    let fullResponse = "";

    // Create a custom controller for WebSocket streaming
    const controller = {
      enqueue: (chunk: Uint8Array) => {
        const text = new TextDecoder().decode(chunk);
        fullResponse += text;
        ws.send(
          JSON.stringify({
            type: "ai-stream-chunk",
            chunk: text,
            timestamp: new Date().toISOString(),
          })
        );
      },
      close: () => {
        ws.send(
          JSON.stringify({
            type: "ai-stream-complete",
            fullResponse,
            timestamp: new Date().toISOString(),
          })
        );
      },
    };

    await aiHandler.streamResponse(
      message,
      model,
      domainId,
      controller as any,
      userId,
      conversationId
    );
  } catch (error) {
    console.error("Error handling AI stream:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to get AI stream response",
        timestamp: new Date().toISOString(),
      })
    );
  }
}

export default app;

// Export Durable Objects for Cloudflare Workers
export { ChatRoom } from "./chat-room.js";
export { VisitorTracker } from "./visitor-tracker.js";
