# WeeziQ WebSocket Service

A simple Cloudflare Workers service that acts as a proxy and real-time layer for the WeeziQ chatbot platform.

## 🏗️ Architecture

```
Client → WebSocket → Cloudflare Worker → Neon Database (via Prisma)
                ↓
            AI Response (OpenAI/Google AI)
```

## 🚀 Features

- **Real-time WebSocket connections** via Durable Objects
- **Direct database access** to Neon via Prisma
- **AI responses** from OpenAI GPT and Google Gemini
- **Message persistence** in PostgreSQL database
- **Chat room management** with customer tracking

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Set Environment Variables

```bash
# Copy environment template
cp env.example .dev.vars

# Edit .dev.vars with your values
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
OPENAI_API_KEY="sk-..."
GOOGLE_AI_API_KEY="..."
```

### 4. Set Cloudflare Secrets

```bash
wrangler secret put DATABASE_URL
wrangler secret put OPENAI_API_KEY
wrangler secret put GOOGLE_AI_API_KEY
```

### 5. Deploy

```bash
npm run deploy
```

## 📡 API Endpoints

### WebSocket Connection

```
GET /ws?roomId=<roomId>
```

### AI Chat (Non-streaming)

```
POST /ai/chat
{
  "message": "Hello",
  "context": "You are a helpful assistant",
  "model": "openai"
}
```

### AI Chat (Streaming)

```
POST /ai/stream
{
  "message": "Hello",
  "context": "You are a helpful assistant",
  "model": "openai"
}
```

### Save Message

```
POST /api/messages
{
  "message": "Hello",
  "role": "user",
  "chatRoomId": "room-id"
}
```

### Get Chat History

```
GET /api/messages?chatRoomId=<roomId>
```

## 💬 WebSocket Messages

### Join Room

```json
{
  "type": "join-room",
  "userId": "user-123",
  "userName": "John Doe",
  "role": "customer",
  "domainId": "domain-123",
  "customerData": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Send Message

```json
{
  "type": "send-message",
  "message": "Hello, how can you help me?"
}
```

### Ping

```json
{
  "type": "ping"
}
```

## 📨 WebSocket Responses

### Room Joined

```json
{
  "type": "room-joined",
  "roomId": "room-123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Message Received

```json
{
  "type": "message-received",
  "id": "msg-123",
  "message": "Hello! How can I help you today?",
  "userId": "ai-assistant",
  "userName": "AI Assistant",
  "role": "assistant",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "chatRoomId": "room-123"
}
```

### Message History

```json
{
  "type": "message-history",
  "messages": [...]
}
```

### Pong

```json
{
  "type": "pong",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Flow

1. **Client connects** to WebSocket with room ID
2. **User sends message** via WebSocket
3. **Worker saves message** to Neon database
4. **Worker generates AI response** using OpenAI/Google AI
5. **Worker saves AI response** to database
6. **Worker broadcasts messages** to all connected clients

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build
npm run build

# Deploy
npm run deploy
```

## 📊 Database Schema

The service uses the same Prisma schema as the Next.js app for:

- Customers
- Chat Rooms
- Chat Messages
- Domains
- AI Usage tracking

## 🔒 Security

- CORS enabled for cross-origin requests
- Environment variables for sensitive data
- WebSocket connection validation
- Database connection pooling

## 🚨 Error Handling

- Graceful WebSocket disconnection
- Database operation retries
- AI service fallbacks
- Comprehensive error logging
