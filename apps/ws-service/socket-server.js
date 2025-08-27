const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Create HTTP server
const httpServer = createServer();

// Create Socket.io server with CORS configuration
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Store connected users and their rooms
const connectedUsers = new Map();
const userRooms = new Map();

// ✅ NEW: Visitor tracking system
const activeVisitors = new Map(); // domainId -> Set of visitor IDs
const visitorSessions = new Map(); // visitorId -> session data
const domainStats = new Map(); // domainId -> stats object

// ✅ NEW: Helper functions for visitor tracking
const addVisitorToDomain = (domainId, visitorId, visitorData) => {
    if (!activeVisitors.has(domainId)) {
        activeVisitors.set(domainId, new Set());
    }
    activeVisitors.get(domainId).add(visitorId);

    visitorSessions.set(visitorId, {
        domainId,
        joinedAt: new Date(),
        lastActivity: new Date(),
        ...visitorData
    });

    // Update domain stats
    updateDomainStats(domainId);

    console.log(`👤 Visitor ${visitorId} added to domain ${domainId}. Total active: ${activeVisitors.get(domainId).size}`);
};

const removeVisitorFromDomain = (domainId, visitorId) => {
    if (activeVisitors.has(domainId)) {
        activeVisitors.get(domainId).delete(visitorId);
    }

    visitorSessions.delete(visitorId);

    // Update domain stats
    updateDomainStats(domainId);

    console.log(`👤 Visitor ${visitorId} removed from domain ${domainId}. Total active: ${activeVisitors.get(domainId)?.size || 0}`);
};

const updateDomainStats = (domainId) => {
    const activeCount = activeVisitors.get(domainId)?.size || 0;
    domainStats.set(domainId, {
        activeVisitors: activeCount,
        lastUpdated: new Date()
    });
};

const getDomainActiveVisitors = (domainId) => {
    return activeVisitors.get(domainId)?.size || 0;
};

const getAllDomainStats = () => {
    const stats = {};
    for (const [domainId, visitorSet] of activeVisitors.entries()) {
        stats[domainId] = {
            activeVisitors: visitorSet.size,
            lastUpdated: new Date()
        };
    }
    return stats;
};

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // ✅ NEW: Handle visitor joining domain (widget opened)
    socket.on('visitor-joined-domain', (data) => {
        const { domainId, visitorId, visitorData } = data;

        addVisitorToDomain(domainId, visitorId, visitorData);

        // Notify admin about new visitor
        socket.broadcast.emit('visitor-joined-domain', {
            domainId,
            visitorId,
            visitorData,
            activeCount: getDomainActiveVisitors(domainId),
            timestamp: new Date()
        });
    });

    // ✅ NEW: Handle visitor leaving domain (widget closed)
    socket.on('visitor-left-domain', (data) => {
        const { domainId, visitorId } = data;

        removeVisitorFromDomain(domainId, visitorId);

        // Notify admin about visitor leaving
        socket.broadcast.emit('visitor-left-domain', {
            domainId,
            visitorId,
            activeCount: getDomainActiveVisitors(domainId),
            timestamp: new Date()
        });
    });

    // ✅ NEW: Handle visitor activity updates
    socket.on('visitor-activity', (data) => {
        const { domainId, visitorId } = data;

        // Update visitor's last activity
        if (visitorSessions.has(visitorId)) {
            visitorSessions.get(visitorId).lastActivity = new Date();
        }
    });

    // ✅ NEW: Handle domain stats requests
    socket.on('get-domain-stats', (data) => {
        const { domainId } = data;

        socket.emit('domain-stats', {
            domainId,
            activeVisitors: getDomainActiveVisitors(domainId),
            timestamp: new Date()
        });
    });

    // ✅ NEW: Handle all domain stats requests
    socket.on('get-all-domain-stats', () => {
        socket.emit('all-domain-stats', {
            stats: getAllDomainStats(),
            timestamp: new Date()
        });
    });

    // Handle room joining
    socket.on('join-room', (data) => {
        const { roomId, userId, userName } = data;

        // Leave previous room if any
        if (userRooms.has(socket.id)) {
            const previousRoom = userRooms.get(socket.id);
            socket.leave(previousRoom);
        }

        // Join new room
        socket.join(roomId);
        userRooms.set(socket.id, roomId);
        connectedUsers.set(socket.id, { userId, userName, roomId });

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
            userId,
            userName,
            socketId: socket.id,
            timestamp: new Date()
        });

        // Send confirmation to the user
        socket.emit('joined-room', {
            roomId,
            success: true
        });

        console.log(`🎯 User ${userName} joined room: ${roomId}`);
    });

    // Handle room leaving
    socket.on('leave-room', (data) => {
        const { roomId } = data;

        if (userRooms.has(socket.id)) {
            const user = connectedUsers.get(socket.id);
            socket.leave(roomId);
            userRooms.delete(socket.id);
            connectedUsers.delete(socket.id);

            // Notify others in the room
            socket.to(roomId).emit('user-left', {
                userId: user?.userId,
                userName: user?.userName,
                socketId: socket.id,
                timestamp: new Date()
            });

            console.log(`👋 User left room: ${roomId}`);
        }
    });

    // Handle message sending
    socket.on('send-message', (data) => {
        const { roomId, message, userId, userName, role } = data;

        const messageData = {
            id: Date.now().toString(),
            message,
            userId,
            userName,
            role,
            socketId: socket.id,
            timestamp: new Date()
        };

        // Broadcast to room
        io.to(roomId).emit('new-message', messageData);

        // Send confirmation to sender
        socket.emit('message-sent', { success: true });

        console.log(`💬 Message sent to room ${roomId}: ${message.substring(0, 50)}...`);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
        const { roomId, userId, userName } = data;

        socket.to(roomId).emit('user-typing', {
            userId,
            userName,
            isTyping: true
        });
    });

    socket.on('typing-stop', (data) => {
        const { roomId, userId } = data;

        socket.to(roomId).emit('user-typing', {
            userId,
            isTyping: false
        });
    });

    // Handle user online status
    socket.on('user-online', (data) => {
        const { roomId, userId, userName } = data;

        socket.to(roomId).emit('user-presence', {
            userId,
            userName,
            status: 'online',
            timestamp: new Date()
        });
    });

    // ✅ NEW: Handle customer joining room (for admin notifications)
    socket.on('customer-joined-room', (data) => {
        const { roomId, customerId, customerName } = data;

        // Broadcast to admin clients
        socket.broadcast.emit('customer-joined-room', {
            roomId,
            customerId,
            customerName,
            timestamp: new Date()
        });

        console.log(`👤 Customer ${customerName} joined room: ${roomId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);

        // Clean up user data
        if (userRooms.has(socket.id)) {
            const roomId = userRooms.get(socket.id);
            const user = connectedUsers.get(socket.id);

            // Notify others in the room
            socket.to(roomId).emit('user-left', {
                userId: user?.userId,
                userName: user?.userName,
                socketId: socket.id,
                timestamp: new Date()
            });

            userRooms.delete(socket.id);
            connectedUsers.delete(socket.id);
        }
    });
});

// Start server
const PORT = process.env.PORT || 8787;

httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.io server running on port ${PORT}`);
    console.log(`🌐 CORS enabled for: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`);
    console.log(`📊 Visitor tracking system active`);
    console.log(`💬 Real-time chat system ready`);
});

module.exports = { io, httpServer };
