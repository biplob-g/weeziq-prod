import { DatabaseService } from "./database";
import { AIService } from "./ai";

interface WebSocketConnection {
  id: string;
  socket: WebSocket;
  userId: string;
  userName: string;
  role: "customer" | "admin";
}

interface ChatMessage {
  id: string;
  message: string;
  userId: string;
  userName: string;
  role: "user" | "assistant";
  timestamp: string;
  chatRoomId: string;
}

export class ChatRoomDurableObject {
  private state: DurableObjectState;
  private env: any;
  private connections: Map<string, WebSocketConnection> = new Map();
  private messages: ChatMessage[] = [];
  private databaseService: DatabaseService;
  private aiService: AIService;
  private chatRoomId: string | null = null;
  private customerId: string | null = null;
  private domainId: string | null = null;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.databaseService = new DatabaseService(env.NEXTJS_API_URL);
    this.aiService = new AIService(env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 400 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();

      const connectionId = crypto.randomUUID();
      const connection: WebSocketConnection = {
        id: connectionId,
        socket: server,
        userId: "",
        userName: "",
        role: "customer",
      };

      this.connections.set(connectionId, connection);

      server.addEventListener("message", async (event) => {
        try {
          const data = JSON.parse(event.data as string);
          await this.handleMessage(connectionId, data);
        } catch (error) {
          console.error("Error handling message:", error);
        }
      });

      server.addEventListener("close", () => {
        this.connections.delete(connectionId);
        console.log(`Connection ${connectionId} closed`);
      });

      server.addEventListener("error", (error) => {
        console.error(`WebSocket error:`, error);
        this.connections.delete(connectionId);
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response("Not found", { status: 404 });
  }

  private async handleMessage(connectionId: string, data: any) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    console.log("Received message:", data.type, data);

    switch (data.type) {
      case "join-room":
        await this.handleJoinRoom(connection, data);
        break;
      case "send-message":
        await this.handleSendMessage(connection, data);
        break;
      case "ping":
        connection.socket.send(
          JSON.stringify({ type: "pong", timestamp: new Date().toISOString() })
        );
        break;
      default:
        console.log("Unknown message type:", data.type);
    }
  }

  private async handleJoinRoom(connection: WebSocketConnection, data: any) {
    try {
      connection.userId = data.userId;
      connection.userName = data.userName;
      connection.role = data.role || "customer";
      this.domainId = data.domainId;

      // Get or create customer
      if (data.customerData && this.domainId) {
        const customer = await this.databaseService.getOrCreateCustomer(
          data.customerData,
          this.domainId
        );
        this.customerId = customer.id!;

        // Get or create chat room
        const chatRoom = await this.databaseService.getOrCreateChatRoom(
          this.customerId
        );
        this.chatRoomId = chatRoom.id!;

        // Get chat history
        const history = await this.databaseService.getChatHistory(
          this.chatRoomId
        );
        this.messages = history.map((msg) => ({
          id: msg.id!,
          message: msg.message,
          userId: msg.role === "user" ? this.customerId! : "ai-assistant",
          userName: msg.role === "user" ? connection.userName : "AI Assistant",
          role: msg.role,
          timestamp: new Date().toISOString(),
          chatRoomId: this.chatRoomId!,
        }));

        // Send room joined confirmation
        connection.socket.send(
          JSON.stringify({
            type: "room-joined",
            roomId: this.chatRoomId,
            timestamp: new Date().toISOString(),
          })
        );

        // Send chat history
        if (this.messages.length > 0) {
          connection.socket.send(
            JSON.stringify({
              type: "message-history",
              messages: this.messages.slice(-10), // Last 10 messages
            })
          );
        }

        console.log(
          `User ${connection.userName} joined room ${this.chatRoomId}`
        );
      }
    } catch (error) {
      console.error("Error joining room:", error);
      connection.socket.send(
        JSON.stringify({
          type: "error",
          message: "Failed to join room",
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  private async handleSendMessage(connection: WebSocketConnection, data: any) {
    try {
      if (!this.chatRoomId) {
        throw new Error("No chat room ID");
      }

      const messageId = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      // Create user message
      const userMessage: ChatMessage = {
        id: messageId,
        message: data.message,
        userId: connection.userId,
        userName: connection.userName,
        role: "user",
        timestamp,
        chatRoomId: this.chatRoomId,
      };

      // Save user message to database
      await this.databaseService.saveMessage({
        id: messageId,
        message: data.message,
        role: "user",
        chatRoomId: this.chatRoomId,
      });

      this.messages.push(userMessage);

      // Broadcast user message to all connections
      this.broadcastMessage(userMessage);

      // Generate AI response
      if (connection.role === "customer") {
        await this.generateAIResponse(data.message);
      }
    } catch (error) {
      console.error("Error handling send message:", error);
      connection.socket.send(
        JSON.stringify({
          type: "error",
          message: "Failed to send message",
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  private async generateAIResponse(userMessage: string) {
    try {
      if (!this.chatRoomId || !this.domainId) {
        throw new Error("Missing chat room or domain ID");
      }

      // Get domain context
      const domainData = await this.databaseService.getDomainData(
        this.domainId
      );
      const context =
        domainData?.chatBot?.taskSummary ||
        "You are a helpful AI assistant for customer support.";

      // Get AI response
      const aiResponse = await this.aiService.getResponse(userMessage, context);

      const aiMessageId = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      // Create AI message
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        message: aiResponse,
        userId: "ai-assistant",
        userName: "AI Assistant",
        role: "assistant",
        timestamp,
        chatRoomId: this.chatRoomId,
      };

      // Save AI message to database
      await this.databaseService.saveMessage({
        id: aiMessageId,
        message: aiResponse,
        role: "assistant",
        chatRoomId: this.chatRoomId,
      });

      this.messages.push(aiMessage);

      // Broadcast AI message to all connections
      this.broadcastMessage(aiMessage);

      console.log("AI response generated and saved");
    } catch (error) {
      console.error("Error generating AI response:", error);
    }
  }

  private broadcastMessage(message: ChatMessage) {
    const messageData = {
      type: "message-received",
      ...message,
    };

    for (const [_, connection] of this.connections) {
      try {
        connection.socket.send(JSON.stringify(messageData));
      } catch (error) {
        console.error("Error broadcasting message:", error);
      }
    }
  }
}
