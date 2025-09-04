interface ChatSession {
  customerId: string;
  chatRoomId: string;
  domainId: string;
  isLiveAgentMode: boolean;
  lastActivity: Date;
}

// ChatMessage interface for type safety
interface _ChatMessage {
  id: string;
  message: string;
  userId: string;
  userName: string;
  role: "user" | "assistant";
  timestamp: string;
  roomId: string;
  domainId?: string;
  customerId?: string;
}

class CloudflareSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageQueue: string[] = [];
  private eventListeners: { [key: string]: ((data: any) => void)[] } = {};
  private currentSession: ChatSession | null = null;
  private currentRoomId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Initialize event listeners
    this.eventListeners = {
      "new-message": [],
      "ai-response": [],
      "user-joined": [],
      "user-left": [],
      "user-typing": [],
      "customer-joined-room": [],
      "message-stored": [],
      "room-joined": [],
      "message-history": [],
      "session-initialized": [],
      "live-agent-toggled": [],
      "customer-message": [],
      error: [],
    };
  }

  // Initialize chat session with customer data
  async initializeChatSession(
    customerData: any,
    domainId: string,
    roomId: string
  ): Promise<ChatSession> {
    try {
      console.log("🔄 Initializing chat session:", {
        customerData,
        domainId,
        roomId,
      });

      // Connect to WebSocket if not already connected
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        await this.connect(
          roomId,
          customerData.id,
          customerData.name || "Customer"
        );
      }

      // Send session initialization message
      const initMessage = {
        type: "initialize-session",
        customerData,
        domainId,
        roomId,
      };

      this.sendMessage(initMessage);

      // Wait for session confirmation
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Session initialization timeout"));
        }, 10000);

        this.on("session-initialized", (data) => {
          clearTimeout(timeout);
          this.currentSession = data.session;
          this.currentRoomId = roomId;
          console.log("✅ Chat session initialized:", data.session);
          resolve(data.session);
        });

        this.on("error", (data) => {
          clearTimeout(timeout);
          reject(new Error(data.message || "Session initialization failed"));
        });
      });
    } catch (error) {
      console.error("❌ Failed to initialize chat session:", error);
      throw error;
    }
  }

  connect(
    roomId: string,
    userId: string,
    userName: string,
    role: "customer" | "admin" = "customer",
    domainId?: string
  ) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      console.log("🔌 Already connected or connecting");
      return;
    }

    this.isConnecting = true;
    this.currentRoomId = roomId;

    const wsUrl =
      process.env.NODE_ENV === "development"
        ? `ws://localhost:8787/ws?roomId=${roomId}`
        : `wss://weeziq-ws-service.ghatakbits.workers.dev/ws?roomId=${roomId}`;

    console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Start heartbeat
        this.startHeartbeat();

        // Join room immediately after connection
        this.joinRoom(roomId, userId, userName, role, domainId);

        // Send queued messages
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Received WebSocket message:", data.type, data);
          this.handleMessage(data);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
        this.isConnecting = false;
        this.stopHeartbeat();
        this.handleReconnect(roomId, userId, userName, role, domainId);
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        this.isConnecting = false;
        this.stopHeartbeat();
      };
    } catch (error) {
      console.error("❌ Error creating WebSocket connection:", error);
      this.isConnecting = false;
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: "ping" });
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleReconnect(
    roomId: string,
    userId: string,
    userName: string,
    role: "customer" | "admin",
    domainId?: string
  ) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect(roomId, userId, userName, role, domainId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  private handleMessage(data: any) {
    const eventType = data.type;

    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  joinRoom(
    roomId: string,
    userId: string,
    userName: string,
    role: "customer" | "admin" = "customer",
    domainId?: string
  ) {
    const message = {
      type: "join-room",
      roomId,
      userId,
      userName,
      role,
      domainId,
    };

    console.log(`🎯 Joining room: ${roomId} as ${userName} (${role})`);
    this.sendMessage(message);
  }

  sendMessage(message: any) {
    const messageStr = JSON.stringify(message);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(messageStr);
    } else {
      console.log("📤 Queuing message (WebSocket not ready):", message.type);
      this.messageQueue.push(messageStr);
    }
  }

  private flushMessageQueue() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.ws.send(message);
        }
      }
    }
  }

  // Send message to room with enhanced functionality
  sendMessageToRoom(
    roomId: string,
    message: string,
    userId: string,
    userName: string,
    role: "user" | "assistant" = "user",
    domainId?: string
  ) {
    const msg = {
      type: "send-message",
      roomId,
      message,
      userId,
      userName,
      role,
      domainId,
    };

    console.log(`💬 Sending message to room ${roomId}: ${message}`);
    this.sendMessage(msg);
  }

  // Send message with domainId for AI integration
  sendMessageWithDomain(
    roomId: string,
    message: string,
    userId: string,
    userName: string,
    role: "user" | "assistant" = "user",
    domainId?: string
  ) {
    const msg = {
      type: "send-message",
      roomId,
      message,
      userId,
      userName,
      role,
      domainId,
    };

    console.log(
      `💬 Sending message to room ${roomId}: ${message} (domainId: ${domainId})`
    );
    this.sendMessage(msg);
  }

  // Toggle live agent mode
  toggleLiveAgentMode(roomId: string, enabled: boolean) {
    const msg = {
      type: "toggle-live-agent",
      roomId,
      enabled,
    };

    console.log(`👮‍♂️ Toggling live agent mode: ${enabled} for room ${roomId}`);
    this.sendMessage(msg);
  }

  // Notify admin that customer joined room
  notifyAdminCustomerJoined(
    roomId: string,
    customerId: string,
    customerName: string
  ) {
    const msg = {
      type: "customer-joined-room",
      roomId,
      customerId,
      customerName,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `👤 Notifying admin: Customer ${customerName} joined room ${roomId}`
    );
    this.sendMessage(msg);
  }

  // Leave room
  leaveRoom(roomId: string) {
    const message = {
      type: "leave-room",
      roomId,
    };

    console.log(`👋 Leaving room: ${roomId}`);
    this.sendMessage(message);
  }

  // Disconnect
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      console.log("🔌 Disconnecting WebSocket");
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    this.messageQueue = [];
    this.currentSession = null;
    this.currentRoomId = null;
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Get current session
  getCurrentSession(): ChatSession | null {
    return this.currentSession;
  }

  // Get current room ID
  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  // Event listener methods
  on(event: string, callback: (data: any) => void) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.eventListeners[event]) {
      if (callback) {
        this.eventListeners[event] = this.eventListeners[event].filter(
          (cb) => cb !== callback
        );
      } else {
        this.eventListeners[event] = [];
      }
    }
  }

  // Specific event methods for backward compatibility
  onNewMessage(callback: (data: any) => void) {
    this.on("message-received", callback);
  }

  onAIResponse(callback: (data: any) => void) {
    this.on("ai-response", callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.on("user-joined", callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.on("user-left", callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.on("user-typing", callback);
  }

  onCustomerJoinedRoom(callback: (data: any) => void) {
    this.on("customer-joined-room", callback);
  }

  onMessageStored(callback: (data: any) => void) {
    this.on("message-stored", callback);
  }

  onRoomJoined(callback: (data: any) => void) {
    this.on("room-joined", callback);
  }

  onMessageHistory(callback: (data: any) => void) {
    this.on("message-history", callback);
  }

  onSessionInitialized(callback: (data: any) => void) {
    this.on("session-initialized", callback);
  }

  onLiveAgentToggled(callback: (data: any) => void) {
    this.on("live-agent-toggled", callback);
  }

  onCustomerMessage(callback: (data: any) => void) {
    this.on("customer-message", callback);
  }

  onError(callback: (data: any) => void) {
    this.on("error", callback);
  }

  // Remove specific event listeners
  offNewMessage() {
    this.off("message-received");
  }

  offAIResponse() {
    this.off("ai-response");
  }

  offMessageStored() {
    this.off("message-stored");
  }

  offUserJoined() {
    this.off("user-joined");
  }

  offUserLeft() {
    this.off("user-left");
  }

  offUserTyping() {
    this.off("user-typing");
  }

  offCustomerJoinedRoom() {
    this.off("customer-joined-room");
  }

  offSessionInitialized() {
    this.off("session-initialized");
  }

  offLiveAgentToggled() {
    this.off("live-agent-toggled");
  }

  offCustomerMessage() {
    this.off("customer-message");
  }
}

export default CloudflareSocketClient;
