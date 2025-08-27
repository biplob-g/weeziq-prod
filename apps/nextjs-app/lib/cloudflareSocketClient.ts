// Define proper callback types for better type safety
type MessageCallback = (data: any) => void;
type UserCallback = (data: any) => void;
type TypingCallback = (data: any) => void;
type PresenceCallback = (data: any) => void;
type RoomUsersCallback = (data: any) => void;
type CustomerCallback = (data: any) => void;
type StatsCallback = (data: any) => void;
type VisitorCallback = (data: any) => void;
type GenericCallback = (data: any) => void;

class CloudflareSocketClient {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, GenericCallback[]> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      const wsUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        "wss://your-cloudflare-worker.your-subdomain.workers.dev/ws";

      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error("❌ Failed to initialize WebSocket client:", error);
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("🔌 WebSocket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = (event) => {
      console.log("🔌 WebSocket disconnected:", event.code, event.reason);
      this.isConnected = false;

      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.initializeSocket();
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch (error) {
        console.error("❌ Failed to parse WebSocket message:", error);
      }
    };
  }

  // Send message to WebSocket
  private send(data: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not connected, cannot send message");
      return;
    }

    this.ws.send(JSON.stringify(data));
  }

  // Event handling
  public on(event: string, callback: GenericCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback?: GenericCallback) {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  // WebSocket methods
  public joinRoom(roomId: string, userId: string, userName: string) {
    this.send({
      type: "join-room",
      roomId,
      userId,
      userName,
    });
  }

  public leaveRoom(roomId: string) {
    this.send({
      type: "leave-room",
      roomId,
    });
  }

  public sendMessage(
    roomId: string,
    message: string,
    userId: string,
    userName: string,
    role: "assistant" | "user"
  ) {
    this.send({
      type: "send-message",
      roomId,
      message,
      userId,
      userName,
      role,
    });
  }

  public startTyping(roomId: string, userId: string, userName: string) {
    this.send({
      type: "typing-start",
      roomId,
      userId,
      userName,
    });
  }

  public stopTyping(roomId: string, userId: string) {
    this.send({
      type: "typing-stop",
      roomId,
      userId,
    });
  }

  public setUserOnline(roomId: string, userId: string, userName: string) {
    this.send({
      type: "user-online",
      roomId,
      userId,
      userName,
    });
  }

  // Visitor tracking methods
  public joinDomainAsVisitor(
    domainId: string,
    visitorId: string,
    visitorData: { socketId?: string; userAgent: string; timestamp: Date }
  ) {
    this.send({
      type: "visitor-joined-domain",
      domainId,
      visitorId,
      visitorData,
    });
  }

  public leaveDomainAsVisitor(domainId: string, visitorId: string) {
    this.send({
      type: "visitor-left-domain",
      domainId,
      visitorId,
    });
  }

  public sendVisitorActivity(domainId: string, visitorId: string) {
    this.send({
      type: "visitor-activity",
      domainId,
      visitorId,
    });
  }

  public requestDomainStats(domainId: string) {
    this.send({
      type: "get-domain-stats",
      domainId,
    });
  }

  public requestAllDomainStats() {
    this.send({
      type: "get-all-domain-stats",
    });
  }

  public notifyAdminCustomerJoined(
    roomId: string,
    customerId: string,
    customerName: string
  ) {
    this.send({
      type: "customer-joined-room",
      roomId,
      customerId,
      customerName,
    });
  }

  // Event listener methods
  public onNewMessage(callback: MessageCallback) {
    this.on("new-message", callback);
  }

  public onUserJoined(callback: UserCallback) {
    this.on("user-joined", callback);
  }

  public onUserLeft(callback: UserCallback) {
    this.on("user-left", callback);
  }

  public onUserTyping(callback: TypingCallback) {
    this.on("user-typing", callback);
  }

  public onUserPresence(callback: PresenceCallback) {
    this.on("user-presence", callback);
  }

  public onRoomUsers(callback: RoomUsersCallback) {
    this.on("room-users", callback);
  }

  public onCustomerJoinedRoom(callback: CustomerCallback) {
    this.on("customer-joined-room", callback);
  }

  public onAllDomainStats(callback: StatsCallback) {
    this.on("all-domain-stats", callback);
  }

  public onVisitorJoinedDomain(callback: VisitorCallback) {
    this.on("visitor-joined-domain", callback);
  }

  public onVisitorLeftDomain(callback: VisitorCallback) {
    this.on("visitor-left-domain", callback);
  }

  public offAllDomainStats() {
    this.off("all-domain-stats");
  }

  public offVisitorJoinedDomain() {
    this.off("visitor-joined-domain");
  }

  public offVisitorLeftDomain() {
    this.off("visitor-left-domain");
  }

  // Utility methods
  public getSocket() {
    return this.ws;
  }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  public disconnect() {
    if (this.ws) {
      console.log("🔌 Disconnecting WebSocket client");
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  public reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.initializeSocket();
    }, 1000);
  }
}

// Create singleton instance
const cloudflareSocketClient = new CloudflareSocketClient();

export default cloudflareSocketClient;
