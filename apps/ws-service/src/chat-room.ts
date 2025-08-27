export class ChatRoom {
  private state: DurableObjectState;
  private env: any;
  private sessions: Map<string, WebSocket> = new Map();

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/websocket") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected websocket", { status: 400 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();

      const sessionId = crypto.randomUUID();
      this.sessions.set(sessionId, server);

      server.addEventListener("message", async (event) => {
        try {
          const data = JSON.parse(event.data as string);
          await this.handleMessage(sessionId, data, server);
        } catch (error) {
          server.send(JSON.stringify({ error: "Invalid message format" }));
        }
      });

      server.addEventListener("close", () => {
        this.sessions.delete(sessionId);
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response("Not found", { status: 404 });
  }

  private async handleMessage(sessionId: string, data: any, ws: WebSocket) {
    switch (data.type) {
      case "join-room":
        await this.handleJoinRoom(sessionId, data, ws);
        break;
      case "send-message":
        await this.handleSendMessage(sessionId, data, ws);
        break;
      case "typing":
        await this.handleTyping(sessionId, data, ws);
        break;
      default:
        ws.send(JSON.stringify({ error: "Unknown message type" }));
    }
  }

  private async handleJoinRoom(sessionId: string, data: any, ws: WebSocket) {
    const { roomId, userId, userName } = data;

    // Broadcast to other users in the room
    this.broadcastToRoom(
      roomId,
      {
        type: "user-joined",
        userId,
        userName,
        sessionId,
        timestamp: new Date().toISOString(),
      },
      sessionId
    );

    ws.send(
      JSON.stringify({
        type: "joined-room",
        roomId,
        success: true,
      })
    );
  }

  private async handleSendMessage(sessionId: string, data: any, ws: WebSocket) {
    const { roomId, message, userId, userName } = data;

    // Broadcast message to all users in the room
    this.broadcastToRoom(roomId, {
      type: "new-message",
      message,
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });

    ws.send(
      JSON.stringify({
        type: "message-sent",
        success: true,
      })
    );
  }

  private async handleTyping(sessionId: string, data: any, ws: WebSocket) {
    const { roomId, userId, userName, isTyping } = data;

    this.broadcastToRoom(
      roomId,
      {
        type: "user-typing",
        userId,
        userName,
        isTyping,
        timestamp: new Date().toISOString(),
      },
      sessionId
    );
  }

  private broadcastToRoom(
    roomId: string,
    message: any,
    excludeSessionId?: string
  ) {
    for (const [sessionId, ws] of this.sessions.entries()) {
      if (sessionId !== excludeSessionId) {
        ws.send(JSON.stringify(message));
      }
    }
  }
}
