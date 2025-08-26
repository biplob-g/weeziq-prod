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

        // Send current stats to the visitor
        socket.emit('domain-stats-updated', {
            domainId,
            activeVisitors: getDomainActiveVisitors(domainId)
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

    // ✅ NEW: Handle visitor activity (heartbeat)
    socket.on('visitor-activity', (data) => {
        const { domainId, visitorId } = data;

        const session = visitorSessions.get(visitorId);
        if (session) {
            session.lastActivity = new Date();
            visitorSessions.set(visitorId, session);
        }
    });

    // ✅ NEW: Admin requesting domain stats
    socket.on('get-domain-stats', (data) => {
        const { domainId } = data;

        socket.emit('domain-stats', {
            domainId,
            activeVisitors: getDomainActiveVisitors(domainId),
            timestamp: new Date()
        });
    });

    // ✅ NEW: Admin requesting all domain stats
    socket.on('get-all-domain-stats', () => {
        socket.emit('all-domain-stats', {
            stats: getAllDomainStats(),
            timestamp: new Date()
        });
    });

    // Join chat room
    socket.on('join-room', (data) => {
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
        socket.to(roomId).emit('user-joined', {
            userId,
            userName,
            socketId: socket.id,
            timestamp: new Date()
        });

        // Send current online users in the room
        const roomUsers = Array.from(connectedUsers.values())
            .filter(user => user.roomId === roomId)
            .map(user => ({ userId: user.userId, userName: user.userName }));

        socket.emit('room-users', roomUsers);
    });

    // Handle new message
    socket.on('send-message', (data) => {
        const { roomId, message, userId, userName, role } = data;

        console.log(`💬 Message in room ${roomId}: ${message.substring(0, 50)}...`);

        // Broadcast message to room
        io.to(roomId).emit('new-message', {
            id: Date.now().toString(),
            message,
            userId,
            userName,
            role,
            timestamp: new Date(),
            socketId: socket.id
        });
    });

    // Handle typing indicator
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

    // Handle user presence
    socket.on('user-online', (data) => {
        const { roomId, userId, userName } = data;
        socket.to(roomId).emit('user-presence', {
            userId,
            userName,
            status: 'online',
            timestamp: new Date()
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const userInfo = connectedUsers.get(socket.id);
        if (userInfo) {
            const { roomId, userId, userName } = userInfo;

            console.log(`🔌 User disconnected: ${socket.id} from room: ${roomId}`);

            // Notify others in the room
            socket.to(roomId).emit('user-left', {
                userId,
                userName,
                socketId: socket.id,
                timestamp: new Date()
            });

            // Clean up
            connectedUsers.delete(socket.id);
            userRooms.delete(socket.id);
        }

        // ✅ NEW: Clean up visitor tracking on disconnect
        // Find and remove visitor from all domains
        for (const [visitorId, session] of visitorSessions.entries()) {
            if (session.socketId === socket.id) {
                removeVisitorFromDomain(session.domainId, visitorId);
                break;
            }
        }
    });

    // Handle room leave
    socket.on('leave-room', (data) => {
        const { roomId } = data;
        socket.leave(roomId);
        userRooms.delete(socket.id);
        connectedUsers.delete(socket.id);
        console.log(`👋 User ${socket.id} left room: ${roomId}`);
    });

    // ✅ NEW: Handle customer joined room notification for admin
    socket.on('customer-joined-room', (data) => {
        const { roomId, customerId, customerName } = data;
        console.log(`👤 Customer ${customerName} (${customerId}) joined room: ${roomId}`);

        // Broadcast to all admin clients that a customer joined a room
        socket.broadcast.emit('customer-joined-room', {
            roomId,
            customerId,
            customerName,
            timestamp: new Date()
        });
    });
});

// Start server
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.io server running on port ${PORT}`);
    console.log(`🌐 CORS origin: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`);
});

module.exports = { io, httpServer };
