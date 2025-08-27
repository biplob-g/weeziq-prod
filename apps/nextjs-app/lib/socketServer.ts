import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";

// Store connected users and their rooms
const connectedUsers = new Map();
const userRooms = new Map();

// Create HTTP server
const httpServer = createServer();

// Create Socket.io server with CORS configuration
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join chat room
  socket.on("join-room", (data) => {
    const { roomId, userId, userName } = data;

    // Leave previous room if any
    const previousRoom = userRooms.get(socket.id);
    if (previousRoom) {
      socket.leave(previousRoom);
      console.log(`👋 User ${socket.id} left room: ${previousRoom}`);
    }

    // Join new room
    socket.join(roomId);
    userRooms.set(socket.id, roomId);
    connectedUsers.set(socket.id, { userId, userName, roomId });

    console.log(`🎯 User ${socket.id} joined room: ${roomId}`);

    // Notify others in the room
    socket.to(roomId).emit("user-joined", {
      userId,
      userName,
      socketId: socket.id,
      timestamp: new Date(),
    });

    // Send current online users in the room
    const roomUsers = Array.from(connectedUsers.values())
      .filter((user) => user.roomId === roomId)
      .map((user) => ({ userId: user.userId, userName: user.userName }));

    socket.emit("room-users", roomUsers);
  });

  // Handle new message
  socket.on("send-message", (data) => {
    const { roomId, message, userId, userName, role } = data;

    console.log(`💬 Message in room ${roomId}: ${message.substring(0, 50)}...`);

    // Broadcast message to room
    io.to(roomId).emit("new-message", {
      id: Date.now().toString(),
      message,
      userId,
      userName,
      role,
      timestamp: new Date(),
      socketId: socket.id,
    });
  });

  // Handle typing indicator
  socket.on("typing-start", (data) => {
    const { roomId, userId, userName } = data;
    socket.to(roomId).emit("user-typing", {
      userId,
      userName,
      isTyping: true,
    });
  });

  socket.on("typing-stop", (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit("user-typing", {
      userId,
      isTyping: false,
    });
  });

  // Handle user presence
  socket.on("user-online", (data) => {
    const { roomId, userId, userName } = data;
    socket.to(roomId).emit("user-presence", {
      userId,
      userName,
      status: "online",
      timestamp: new Date(),
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      const { roomId, userId, userName } = userInfo;

      console.log(`🔌 User disconnected: ${socket.id} from room: ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit("user-left", {
        userId,
        userName,
        socketId: socket.id,
        timestamp: new Date(),
      });

      // Clean up
      connectedUsers.delete(socket.id);
      userRooms.delete(socket.id);
    }
  });

  // Handle room leave
  socket.on("leave-room", (data) => {
    const { roomId } = data;
    socket.leave(roomId);
    userRooms.delete(socket.id);
    connectedUsers.delete(socket.id);
    console.log(`👋 User ${socket.id} left room: ${roomId}`);
  });
});

// Function to emit message from server actions
export const emitMessage = (
  roomId: string,
  messageData: {
    message: string;
    userId: string;
    userName: string;
    role: string;
    [key: string]: unknown;
  }
) => {
  io.to(roomId).emit("new-message", {
    ...messageData,
    timestamp: new Date(),
    socketId: "server",
  });
};

// Start server
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(
    `🌐 CORS origin: ${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }`
  );
});

export { io, httpServer };
