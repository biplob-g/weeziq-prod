import { io, Socket } from "socket.io-client";
import cloudflareSocketClient from "./cloudflareSocketClient";

// Define proper callback types for better type safety
type MessageCallback = (data: any) => void;
type UserCallback = (data: any) => void;
type TypingCallback = (data: any) => void;
type PresenceCallback = (data: any) => void;
type RoomUsersCallback = (data: any) => void;
type CustomerCallback = (data: any) => void;
type StatsCallback = (data: any) => void;
type VisitorCallback = (data: any) => void;

class SocketClient {
  private socket: Socket | null = null;
  private cloudflareClient = cloudflareSocketClient;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    // Don't initialize during build time
    if (typeof window === "undefined") {
      return;
    }

    // Use Cloudflare WebSocket client for production, Socket.io for local development
    if (process.env.NODE_ENV === "development") {
      this.initializeSocketIO();
    } else {
      // Use Cloudflare WebSocket client
      this.isConnected =
        this.cloudflareClient.getConnectionStatus().isConnected;
    }
  }

  private initializeSocketIO() {
    try {
      const socketUrl =
        process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8787";

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
    if (process.env.NODE_ENV === "development") {
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
    } else {
      this.cloudflareClient.joinRoom(roomId, userId, userName);
    }
  }

  // Leave a chat room
  public leaveRoom(roomId: string) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn("⚠️ Socket not connected, cannot leave room");
        return;
      }

      console.log(`👋 Leaving room: ${roomId}`);
      this.socket.emit("leave-room", { roomId });
    } else {
      this.cloudflareClient.leaveRoom(roomId);
    }
  }

  // Send a message
  public sendMessage(
    roomId: string,
    message: string,
    userId: string,
    userName: string,
    role: "assistant" | "user"
  ) {
    if (process.env.NODE_ENV === "development") {
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
    } else {
      this.cloudflareClient.sendMessage(
        roomId,
        message,
        userId,
        userName,
        role
      );
    }
  }

  // Start typing indicator
  public startTyping(roomId: string, userId: string, userName: string) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn("⚠️ Socket not connected, cannot start typing");
        return;
      }

      this.socket.emit("typing-start", {
        roomId,
        userId,
        userName,
      });
    } else {
      this.cloudflareClient.startTyping(roomId, userId, userName);
    }
  }

  // Stop typing indicator
  public stopTyping(roomId: string, userId: string) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn("⚠️ Socket not connected, cannot stop typing");
        return;
      }

      this.socket.emit("typing-stop", {
        roomId,
        userId,
      });
    } else {
      this.cloudflareClient.stopTyping(roomId, userId);
    }
  }

  // Set user online status
  public setUserOnline(roomId: string, userId: string, userName: string) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn("⚠️ Socket not connected, cannot set user online");
        return;
      }

      this.socket.emit("user-online", {
        roomId,
        userId,
        userName,
      });
    } else {
      this.cloudflareClient.setUserOnline(roomId, userId, userName);
    }
  }

  // Visitor tracking methods
  public joinDomainAsVisitor(
    domainId: string,
    visitorId: string,
    visitorData: { socketId?: string; userAgent: string; timestamp: Date }
  ) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn("⚠️ Socket not connected, cannot join domain as visitor");
        return;
      }

      this.socket.emit("visitor-joined-domain", {
        domainId,
        visitorId,
        visitorData,
      });
    } else {
      this.cloudflareClient.joinDomainAsVisitor(
        domainId,
        visitorId,
        visitorData
      );
    }
  }

  public leaveDomainAsVisitor(domainId: string, visitorId: string) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn("⚠️ Socket not connected, cannot leave domain as visitor");
        return;
      }

      this.socket.emit("visitor-left-domain", {
        domainId,
        visitorId,
      });
    } else {
      this.cloudflareClient.leaveDomainAsVisitor(domainId, visitorId);
    }
  }

  public sendVisitorActivity(domainId: string, visitorId: string) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn("⚠️ Socket not connected, cannot send visitor activity");
        return;
      }

      this.socket.emit("visitor-activity", {
        domainId,
        visitorId,
      });
    } else {
      this.cloudflareClient.sendVisitorActivity(domainId, visitorId);
    }
  }

  public requestDomainStats(domainId: string) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn("⚠️ Socket not connected, cannot request domain stats");
        return;
      }

      this.socket.emit("get-domain-stats", {
        domainId,
      });
    } else {
      this.cloudflareClient.requestDomainStats(domainId);
    }
  }

  public requestAllDomainStats() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn(
          "⚠️ Socket not connected, cannot request all domain stats"
        );
        return;
      }

      this.socket.emit("get-all-domain-stats");
    } else {
      this.cloudflareClient.requestAllDomainStats();
    }
  }

  public notifyAdminCustomerJoined(
    roomId: string,
    customerId: string,
    customerName: string
  ) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket || !this.isConnected) {
        console.warn("⚠️ Socket not connected, cannot notify admin");
        return;
      }

      this.socket.emit("customer-joined-room", {
        roomId,
        customerId,
        customerName,
      });
    } else {
      this.cloudflareClient.notifyAdminCustomerJoined(
        roomId,
        customerId,
        customerName
      );
    }
  }

  // Event listener methods
  public onNewMessage(callback: MessageCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("new-message", callback);
    } else {
      this.cloudflareClient.onNewMessage(callback);
    }
  }

  public onUserJoined(callback: UserCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("user-joined", callback);
    } else {
      this.cloudflareClient.onUserJoined(callback);
    }
  }

  public onUserLeft(callback: UserCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("user-left", callback);
    } else {
      this.cloudflareClient.onUserLeft(callback);
    }
  }

  public onUserTyping(callback: TypingCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("user-typing", callback);
    } else {
      this.cloudflareClient.onUserTyping(callback);
    }
  }

  public onUserPresence(callback: PresenceCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("user-presence", callback);
    } else {
      this.cloudflareClient.onUserPresence(callback);
    }
  }

  public onRoomUsers(callback: RoomUsersCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("room-users", callback);
    } else {
      this.cloudflareClient.onRoomUsers(callback);
    }
  }

  public onCustomerJoinedRoom(callback: CustomerCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("customer-joined-room", callback);
    } else {
      this.cloudflareClient.onCustomerJoinedRoom(callback);
    }
  }

  public onAllDomainStats(callback: StatsCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("all-domain-stats", callback);
    } else {
      this.cloudflareClient.onAllDomainStats(callback);
    }
  }

  public onVisitorJoinedDomain(callback: VisitorCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("visitor-joined-domain", callback);
    } else {
      this.cloudflareClient.onVisitorJoinedDomain(callback);
    }
  }

  public onVisitorLeftDomain(callback: VisitorCallback) {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.on("visitor-left-domain", callback);
    } else {
      this.cloudflareClient.onVisitorLeftDomain(callback);
    }
  }

  public offAllDomainStats() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("all-domain-stats");
    } else {
      this.cloudflareClient.offAllDomainStats();
    }
  }

  public offVisitorJoinedDomain() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("visitor-joined-domain");
    } else {
      this.cloudflareClient.offVisitorJoinedDomain();
    }
  }

  public offVisitorLeftDomain() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("visitor-left-domain");
    } else {
      this.cloudflareClient.offVisitorLeftDomain();
    }
  }

  // Add missing off methods for individual events
  public offNewMessage() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("new-message");
    } else {
      this.cloudflareClient.off("new-message");
    }
  }

  public offUserJoined() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("user-joined");
    } else {
      this.cloudflareClient.off("user-joined");
    }
  }

  public offUserLeft() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("user-left");
    } else {
      this.cloudflareClient.off("user-left");
    }
  }

  public offUserTyping() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("user-typing");
    } else {
      this.cloudflareClient.off("user-typing");
    }
  }

  public offUserPresence() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("user-presence");
    } else {
      this.cloudflareClient.off("user-presence");
    }
  }

  public offRoomUsers() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("room-users");
    } else {
      this.cloudflareClient.off("room-users");
    }
  }

  public offCustomerJoinedRoom() {
    if (process.env.NODE_ENV === "development") {
      if (!this.socket) return;
      this.socket.off("customer-joined-room");
    } else {
      this.cloudflareClient.off("customer-joined-room");
    }
  }

  // Utility methods
  public getSocket() {
    if (process.env.NODE_ENV === "development") {
      return this.socket;
    } else {
      return this.cloudflareClient.getSocket();
    }
  }

  public getConnectionStatus() {
    if (process.env.NODE_ENV === "development") {
      return {
        isConnected: this.isConnected,
        reconnectAttempts: this.reconnectAttempts,
      };
    } else {
      return this.cloudflareClient.getConnectionStatus();
    }
  }

  public disconnect() {
    if (process.env.NODE_ENV === "development") {
      if (this.socket) {
        console.log("🔌 Disconnecting Socket.io client");
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
      }
    } else {
      this.cloudflareClient.disconnect();
    }
  }

  public reconnect() {
    if (process.env.NODE_ENV === "development") {
      this.disconnect();
      setTimeout(() => {
        this.initializeSocketIO();
      }, 1000);
    } else {
      this.cloudflareClient.reconnect();
    }
  }
}

// Create singleton instance with lazy loading
let socketClientInstance: SocketClient | null = null;

const getSocketClient = () => {
  if (!socketClientInstance) {
    socketClientInstance = new SocketClient();
  }
  return socketClientInstance;
};

export default getSocketClient();
