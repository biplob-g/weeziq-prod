# Socket.io Setup Guide

## 🚀 **Socket.io Implementation Complete!**

Your WeezGen chatbot platform now has real-time communication using Socket.io instead of Pusher.

## 📋 **Environment Variables**

Add these to your `.env.local` file:

```env
# Socket.io Configuration
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🏃‍♂️ **Running the Application**

### **Option 1: Run Both Servers Separately**

```bash
# Terminal 1: Start Next.js app
npm run dev

# Terminal 2: Start Socket.io server
npm run dev:socket
```

### **Option 2: Run Both Servers Together**

```bash
npm run dev:all
```

### **Option 3: Use the Convenience Scripts**

**Windows Batch File:**

```bash
start-dev.bat
```

**PowerShell Script:**

```powershell
.\start-dev.ps1
```

### **Option 4: Manual Concurrent Execution**

```bash
npm run dev:with-socket
```

## 🔧 **What's Been Implemented**

### **✅ Server-Side (Socket.io Server)**

- **File**: `socket-server.js`
- **Port**: 3001
- **Features**:
  - Real-time message broadcasting
  - Room-based chat management
  - User presence tracking
  - Typing indicators
  - Connection management

### **✅ Client-Side (Socket.io Client)**

- **File**: `lib/socketClient.ts`
- **Features**:
  - Automatic reconnection
  - Event listeners for all chat events
  - Connection status monitoring
  - Error handling

### **✅ Integration Points**

- **Admin Panel**: `hooks/conversation/useConversation.ts`
- **Chatbot**: `hooks/chatbot/useChatBot.ts`
- **Server Actions**: `actions/conversation/index.ts`

## 🎯 **Real-time Features**

### **✅ Message Broadcasting**

- Instant message delivery between admin and customers
- Message persistence in database
- Real-time UI updates

### **✅ User Presence**

- Online/offline status tracking
- User join/leave notifications
- Room-based user management

### **✅ Typing Indicators**

- Real-time typing status
- User activity indicators

### **✅ Connection Management**

- Automatic reconnection
- Connection status monitoring
- Error handling and fallbacks

## 🔄 **Migration from Pusher**

### **✅ What's Replaced**

- ❌ Pusher client (`pusher-js`)
- ❌ Pusher server (`pusher`)
- ❌ Commented Pusher code in hooks

### **✅ What's Added**

- ✅ Socket.io client (`socket.io-client`)
- ✅ Socket.io server (`socket.io`)
- ✅ Real-time message handling
- ✅ User presence tracking
- ✅ Typing indicators

## 🧪 **Testing the Implementation**

### **1. Start Both Servers**

```bash
npm run dev:all
```

### **2. Test Real-time Chat**

1. Open admin panel in one browser
2. Open chatbot in another browser
3. Send messages and verify real-time delivery

### **3. Check Console Logs**

- Socket.io connection status
- Message broadcasting
- User presence updates

## 🚨 **Troubleshooting**

### **Connection Issues**

- Ensure Socket.io server is running on port 3001
- Check CORS configuration
- Verify environment variables

### **WebSocket Connection Error**

If you see `❌ Socket.io connection error: TransportError: websocket error`:

1. **Make sure Socket.io server is running:**

   ```bash
   # Check if server is running
   netstat -an | findstr :3001

   # Start the server if not running
   npm run dev:socket
   ```

2. **Use the convenience scripts:**

   ```bash
   # Windows
   start-dev.bat

   # PowerShell
   .\start-dev.ps1
   ```

3. **Check environment variables:**
   ```env
   SOCKET_PORT=3001
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### **Message Not Delivering**

- Check browser console for errors
- Verify room IDs match
- Ensure both client and server are connected

### **Performance Issues**

- Monitor Socket.io server logs
- Check for memory leaks
- Verify cleanup functions are working

## 📊 **Benefits of Socket.io Over Pusher**

### **✅ Advantages**

- **Self-hosted**: No external dependencies
- **Cost-effective**: No per-message charges
- **Customizable**: Full control over implementation
- **Real-time**: Lower latency
- **Scalable**: Can handle high message volumes

### **✅ Features**

- **Room-based messaging**: Each chat room is a Socket.io room
- **User presence**: Track online/offline status
- **Typing indicators**: Real-time typing status
- **Message persistence**: Store in database + real-time delivery
- **Error handling**: Automatic reconnection and fallbacks

## 🎉 **Success!**

Your WeezGen platform now has:

- ✅ Real-time chat communication
- ✅ User presence tracking
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Automatic reconnection
- ✅ Message persistence
- ✅ Room-based chat management

The implementation maintains all existing functionality while adding powerful real-time features!
