import { Hono } from "hono";
import { cors } from "hono/cors";
import { AIHandler } from "./ai-handler.js";

// Define environment types for Cloudflare Workers
interface Env {
  OPENAI_API_KEY?: string;
  GOOGLE_AI_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Get allowed origins from environment
const getAllowedOrigins = (env: Env) => {
  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());
  }

  // Fallback to common origins including localhost for development
  return [
    "http://localhost:3000",
    "http://localhost:3001",
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

// WebSocket upgrade endpoint
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
        case "send-message":
          await handleSendMessage(data, server, c.env);
          break;
        case "typing-start":
          handleTypingStart(data, server);
          break;
        case "typing-stop":
          handleTypingStop(data, server);
          break;
        case "ping":
          handlePing(server);
          break;
        default:
          server.send(
            JSON.stringify({
              type: "error",
              message: "Unknown message type",
              timestamp: new Date().toISOString(),
            })
          );
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
      server.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
          timestamp: new Date().toISOString(),
        })
      );
    }
  });

  server.addEventListener("close", () => {
    console.log("WebSocket connection closed");
  });

  server.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
});

// AI chat endpoint
app.post("/ai/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { message, conversationId, domainId, userId } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const aiHandler = new AIHandler();
    const response = await aiHandler.getResponse(
      message,
      "gpt-3.5-turbo",
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

// AI streaming endpoint
app.post("/ai/stream", async (c) => {
  try {
    const body = await c.req.json();
    const { message, conversationId, domainId, userId } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const aiHandler = new AIHandler();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await aiHandler.streamResponse(
            message,
            "gpt-3.5-turbo",
            domainId,
            controller,
            userId,
            conversationId
          );
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
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
    console.error("AI stream error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// WebSocket message handlers
async function handleSendMessage(data: any, ws: WebSocket, env: Env) {
  const { message, userId, userName, role, conversationId, domainId } = data;

  try {
    // Send user message back to confirm receipt
    ws.send(
      JSON.stringify({
        type: "message-received",
        message,
        userId,
        userName,
        role: "user",
        timestamp: new Date().toISOString(),
      })
    );

    // Get AI response
    const aiHandler = new AIHandler();
    const aiResponse = await aiHandler.getResponse(
      message,
      "gpt-3.5-turbo",
      domainId,
      userId,
      conversationId
    );

    // Send AI response
    ws.send(
      JSON.stringify({
        type: "ai-response",
        message: aiResponse.message,
        role: "assistant",
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error handling message:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to process message",
        timestamp: new Date().toISOString(),
      })
    );
  }
}

function handleTypingStart(data: any, ws: WebSocket) {
  const { userId, userName } = data;

  ws.send(
    JSON.stringify({
      type: "typing-start",
      userId,
      userName,
      timestamp: new Date().toISOString(),
    })
  );
}

function handleTypingStop(data: any, ws: WebSocket) {
  const { userId, userName } = data;

  ws.send(
    JSON.stringify({
      type: "typing-stop",
      userId,
      userName,
      timestamp: new Date().toISOString(),
    })
  );
}

function handlePing(ws: WebSocket) {
  ws.send(
    JSON.stringify({
      type: "pong",
      timestamp: new Date().toISOString(),
    })
  );
}

export default app;
