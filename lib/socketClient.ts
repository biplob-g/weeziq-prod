import { io, Socket } from "socket.io-client";

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("❌ Failed to initialize Socket.io client:", error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("🔌 Socket.io connected:", this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket.io disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket.io connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("❌ Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket.io reconnected after", attemptNumber, "attempts");
      this.isConnected = true;
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("❌ Socket.io reconnection error:", error);
    });
  }

  // Join a chat room
  public joinRoom(roomId: string, userId: string, userName: string) {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot join room");
      return;
    }

    console.log(`🎯 Joining room: ${roomId} as ${userName}`);
    this.socket.emit("join-room", {
      roomId,
      userId,
      userName,
    });
  }

  // Leave a chat room
  public leaveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot leave room");
      return;
    }

    console.log(`👋 Leaving room: ${roomId}`);
    this.socket.emit("leave-room", { roomId });
  }

  // Send a message
  public sendMessage(
    roomId: string,
    message: string,
    userId: string,
    userName: string,
    role: "assistant" | "user"
  ) {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot send message");
      return;
    }

    console.log(`💬 Sending message to room: ${roomId}`);
    this.socket.emit("send-message", {
      roomId,
      message,
      userId,
      userName,
      role,
    });
  }

  // Start typing indicator
  public startTyping(roomId: string, userId: string, userName: string) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("typing-start", {
      roomId,
      userId,
      userName,
    });
  }

  // Stop typing indicator
  public stopTyping(roomId: string, userId: string) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("typing-stop", {
      roomId,
      userId,
    });
  }

  // Set user online status
  public setUserOnline(roomId: string, userId: string, userName: string) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("user-online", {
      roomId,
      userId,
      userName,
    });
  }

  // Listen for new messages
  public onNewMessage(
    callback: (data: {
      id: string;
      message: string;
      role: string;
      timestamp: string;
      userId: string;
      userName: string;
      socketId: string;
    }) => void
  ) {
    if (!this.socket) return;

    this.socket.on("new-message", callback);
  }

  // Listen for user joined
  public onUserJoined(
    callback: (data: {
      userId: string;
      userName: string;
      socketId: string;
      timestamp: string;
    }) => void
  ) {
    if (!this.socket) return;

    this.socket.on("user-joined", callback);
  }

  // Listen for user left
  public onUserLeft(
    callback: (data: {
      userId: string;
      userName: string;
      socketId: string;
      timestamp: string;
    }) => void
  ) {
    if (!this.socket) return;

    this.socket.on("user-left", callback);
  }

  // Listen for typing indicators
  public onUserTyping(
    callback: (data: {
      userId: string;
      userName?: string;
      isTyping: boolean;
    }) => void
  ) {
    if (!this.socket) return;

    this.socket.on("user-typing", callback);
  }

  // Listen for user presence changes
  public onUserPresence(
    callback: (data: {
      userId: string;
      userName: string;
      status: string;
      timestamp: string;
    }) => void
  ) {
    if (!this.socket) return;

    this.socket.on("user-presence", callback);
  }

  // Listen for room users update
  public onRoomUsers(
    callback: (
      data: Array<{
        userId: string;
        userName: string;
      }>
    ) => void
  ) {
    if (!this.socket) return;

    this.socket.on("room-users", callback);
  }

  // ✅ NEW: Global chat room monitoring for admin panel
  public onCustomerJoinedRoom(
    callback: (data: {
      roomId: string;
      customerId: string;
      customerName: string;
    }) => void
  ) {
    if (this.socket) {
      this.socket.on("customer-joined-room", callback);
    }
  }

  // ✅ NEW: Notify admin when customer joins a room
  public notifyAdminCustomerJoined(
    roomId: string,
    customerId: string,
    customerName: string
  ) {
    if (this.socket) {
      this.socket.emit("customer-joined-room", {
        roomId,
        customerId,
        customerName,
        timestamp: new Date(),
      });
    }
  }

  // ✅ NEW: Visitor tracking methods
  public joinDomainAsVisitor(
    domainId: string,
    visitorId: string,
    visitorData: { socketId?: string; userAgent: string; timestamp: Date }
  ) {
    if (this.socket) {
      this.socket.emit("visitor-joined-domain", {
        domainId,
        visitorId,
        visitorData,
      });
    }
  }

  public leaveDomainAsVisitor(domainId: string, visitorId: string) {
    if (this.socket) {
      this.socket.emit("visitor-left-domain", {
        domainId,
        visitorId,
      });
    }
  }

  public sendVisitorActivity(domainId: string, visitorId: string) {
    if (this.socket) {
      this.socket.emit("visitor-activity", {
        domainId,
        visitorId,
      });
    }
  }

  public requestDomainStats(domainId: string) {
    if (this.socket) {
      this.socket.emit("get-domain-stats", { domainId });
    }
  }

  public requestAllDomainStats() {
    if (this.socket) {
      this.socket.emit("get-all-domain-stats");
    }
  }

  // ✅ NEW: Event listener methods for visitor tracking
  public onAllDomainStats(
    callback: (data: {
      stats: Record<string, { activeVisitors: number; lastUpdated: Date }>;
    }) => void
  ) {
    if (this.socket) {
      this.socket.on("all-domain-stats", callback);
    }
  }

  public onVisitorJoinedDomain(
    callback: (data: {
      domainId: string;
      visitorId: string;
      activeCount: number;
    }) => void
  ) {
    if (this.socket) {
      this.socket.on("visitor-joined-domain", callback);
    }
  }

  public onVisitorLeftDomain(
    callback: (data: {
      domainId: string;
      visitorId: string;
      activeCount: number;
    }) => void
  ) {
    if (this.socket) {
      this.socket.on("visitor-left-domain", callback);
    }
  }

  public offAllDomainStats() {
    if (this.socket) {
      this.socket.off("all-domain-stats");
    }
  }

  public offVisitorJoinedDomain() {
    if (this.socket) {
      this.socket.off("visitor-joined-domain");
    }
  }

  public offVisitorLeftDomain() {
    if (this.socket) {
      this.socket.off("visitor-left-domain");
    }
  }

  // Get socket instance (for internal use)
  public getSocket() {
    return this.socket;
  }

  // Remove event listeners
  public off(event: string) {
    if (!this.socket) return;

    this.socket.off(event);
  }

  // Get connection status
  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Disconnect socket
  public disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting Socket.io client");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Reconnect socket
  public reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.initializeSocket();
    }
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;
