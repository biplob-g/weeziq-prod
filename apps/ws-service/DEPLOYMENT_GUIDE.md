# 🚀 WeeziQ WebSocket Service - Cloudflare Deployment Guide

## 📋 Overview

This guide will help you deploy the WeeziQ WebSocket service to Cloudflare Workers with full AI integration, Socket.io functionality, and visitor tracking.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Cloudflare      │    │   AI Services   │
│   (Vercel)      │◄──►│  Workers         │◄──►│  (OpenAI/Gemini)│
│                 │    │                  │    │                 │
│ - Frontend      │    │ - WebSocket      │    │ - GPT-3.5/4     │
│ - Chat UI       │    │ - AI Streaming   │    │ - Gemini Pro    │
│ - User Auth     │    │ - Visitor Track  │    │ - Context Mgmt  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛠️ Prerequisites

1. **Cloudflare Account** with Workers enabled
2. **OpenAI API Key** (for GPT models)
3. **Google AI API Key** (for Gemini models)
4. **Node.js** (v18+) and **npm**
5. **Wrangler CLI** installed globally

## 📦 Installation

### 1. Install Dependencies

```bash
cd apps/ws-service
npm install
```

### 2. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 3. Login to Cloudflare

```bash
wrangler login
```

## ⚙️ Configuration

### 1. Update wrangler.toml

```toml
name = "weeziq-ws-service"
compatibility_date = "2024-01-15"
compatibility_flags = ["nodejs_compat"]

# Main entry point
main = "src/index.ts"

# Environment variables
[vars]
NODE_ENV = "production"

# Durable Objects for WebSocket connections and chat rooms
[[durable_objects.bindings]]
name = "CHAT_ROOM"
class_name = "ChatRoom"

[[durable_objects.bindings]]
name = "VISITOR_TRACKER"
class_name = "VisitorTracker"

# KV Namespace for storing visitor data and chat history
[[kv_namespaces]]
binding = "CHAT_STORAGE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

# R2 bucket for file storage (optional)
[[r2_buckets]]
binding = "FILE_STORAGE"
bucket_name = "weeziq-files"

# Durable Objects migrations
[[migrations]]
tag = "v1"
new_classes = ["ChatRoom", "VisitorTracker"]
```

### 2. Create KV Namespace

```bash
# Create KV namespace for chat storage
wrangler kv:namespace create "CHAT_STORAGE"

# Create preview namespace for development
wrangler kv:namespace create "CHAT_STORAGE" --preview
```

### 3. Create R2 Bucket (Optional)

```bash
# Create R2 bucket for file storage
wrangler r2 bucket create weeziq-files
```

### 4. Set Environment Secrets

```bash
# Set OpenAI API key
wrangler secret put OPENAI_API_KEY

# Set Google AI API key
wrangler secret put GOOGLE_AI_API_KEY

# Set allowed origins
wrangler secret put ALLOWED_ORIGINS
```

When prompted, enter:

- `OPENAI_API_KEY`: Your OpenAI API key
- `GOOGLE_AI_API_KEY`: Your Google AI API key
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://your-app.vercel.app,https://weeziq.com`)

## 🚀 Deployment

### 1. Build the Project

```bash
npm run build
```

### 2. Deploy to Cloudflare

```bash
npm run deploy
```

Or manually:

```bash
wrangler deploy
```

### 3. Verify Deployment

```bash
# Check deployment status
wrangler whoami

# Test the health endpoint
curl https://weeziq-ws-service.your-subdomain.workers.dev/
```

## 🔧 Development

### Local Development

```bash
# Start local development server
npm run dev

# Start Cloudflare Worker locally
npm run dev:worker
```

### Testing WebSocket Connection

```bash
# Test WebSocket connection
wscat -c wss://weeziq-ws-service.your-subdomain.workers.dev/ws

# Send test message
{"type": "join-room", "roomId": "test-room", "userId": "user1", "userName": "Test User"}
```

## 🔌 Integration with Next.js App

### 1. Update Environment Variables

In your Next.js app (`.env.local`):

```env
# Development (Socket.io)
NEXT_PUBLIC_SOCKET_URL=http://localhost:8787

# Production (Cloudflare Workers)
NEXT_PUBLIC_WS_URL=wss://weeziq-ws-service.your-subdomain.workers.dev/ws
NEXT_PUBLIC_AI_API_URL=https://weeziq-ws-service.your-subdomain.workers.dev/ai
```

### 2. Update Socket Client Configuration

The socket client automatically switches between Socket.io (development) and WebSocket (production) based on `NODE_ENV`.

## 📊 Features

### ✅ Implemented Features

1. **WebSocket Communication**

   - Real-time chat rooms
   - Typing indicators
   - User presence
   - Message broadcasting

2. **AI Integration**

   - OpenAI GPT-3.5/4 support
   - Google Gemini Pro support
   - Streaming responses
   - Conversation context management
   - Domain-specific prompts

3. **Visitor Tracking**

   - Real-time visitor monitoring
   - Domain-specific analytics
   - Activity tracking
   - Automatic cleanup

4. **Durable Objects**
   - Persistent chat rooms
   - State management
   - Scalable architecture

### 🔄 Message Types

#### Client to Server

```typescript
// Join chat room
{
  type: "join-room",
  roomId: string,
  userId: string,
  userName: string
}

// Send message
{
  type: "send-message",
  roomId: string,
  message: string,
  userId: string,
  userName: string,
  role: "user" | "assistant"
}

// AI chat request
{
  type: "ai-chat",
  message: string,
  model: "gpt-3.5-turbo" | "gpt-4" | "gemini-pro",
  domainId?: string,
  userId?: string,
  conversationId?: string
}

// AI streaming request
{
  type: "ai-stream",
  message: string,
  model: string,
  domainId?: string,
  userId?: string,
  conversationId?: string
}
```

#### Server to Client

```typescript
// New message
{
  type: "new-message",
  id: string,
  message: string,
  userId: string,
  userName: string,
  role: string,
  timestamp: string
}

// AI response
{
  type: "ai-response",
  message: string,
  timestamp: string,
  model: string,
  conversationId: string,
  contextLength: number
}

// AI streaming chunk
{
  type: "ai-stream-chunk",
  chunk: string,
  timestamp: string
}

// AI streaming complete
{
  type: "ai-stream-complete",
  fullResponse: string,
  timestamp: string
}
```

## 🔍 Monitoring & Debugging

### 1. View Logs

```bash
# View real-time logs
wrangler tail

# View specific deployment logs
wrangler tail --format=pretty
```

### 2. Health Check

```bash
curl https://weeziq-ws-service.your-subdomain.workers.dev/
```

Expected response:

```json
{
  "status": "ok",
  "message": "WeeziQ WebSocket service is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 3. Test AI Endpoints

```bash
# Test AI chat
curl -X POST https://weeziq-ws-service.your-subdomain.workers.dev/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "model": "gpt-3.5-turbo",
    "domainId": "weeziq.com"
  }'

# Test AI streaming
curl -X POST https://weeziq-ws-service.your-subdomain.workers.dev/ai/stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me a story",
    "model": "gpt-3.5-turbo",
    "domainId": "weeziq.com"
  }'
```

## 🛡️ Security

### 1. CORS Configuration

The service includes CORS protection with configurable origins:

```typescript
origin: [
  "http://localhost:3000",
  "https://your-vercel-domain.vercel.app",
  "https://weeziq.com",
  "https://*.vercel.app",
];
```

### 2. API Key Protection

- API keys are stored as Cloudflare secrets
- Never exposed in client-side code
- Rotated regularly

### 3. Rate Limiting

Consider implementing rate limiting for production:

```bash
# Add rate limiting rules in Cloudflare dashboard
# Or implement in the Worker code
```

## 📈 Performance Optimization

### 1. Caching

```typescript
// Cache AI responses for similar queries
const cacheKey = `ai:${domainId}:${messageHash}`;
const cached = await env.CHAT_STORAGE.get(cacheKey);
```

### 2. Connection Pooling

Durable Objects automatically handle connection pooling and scaling.

### 3. Streaming Optimization

AI responses are streamed to reduce perceived latency.

## 🔧 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**

   - Check CORS configuration
   - Verify worker URL
   - Check browser console for errors

2. **AI Responses Not Working**

   - Verify API keys are set correctly
   - Check API key permissions
   - Review Cloudflare logs

3. **Durable Objects Not Working**
   - Ensure migrations are applied
   - Check binding names in wrangler.toml
   - Verify class names match

### Debug Commands

```bash
# Check worker status
wrangler whoami

# View deployment info
wrangler deployments list

# Rollback to previous version
wrangler rollback

# Clear cache
wrangler kv:namespace delete CHAT_STORAGE
```

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/workers/learning/using-durable-objects/)
- [WebSocket API Reference](https://developers.cloudflare.com/workers/runtime-apis/websockets/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google AI Documentation](https://ai.google.dev/docs)

## 🎯 Next Steps

1. **Deploy to Production**

   - Set up custom domain
   - Configure SSL certificates
   - Set up monitoring

2. **Scale Up**

   - Implement rate limiting
   - Add more AI models
   - Optimize performance

3. **Enhance Features**
   - Add file upload support
   - Implement user authentication
   - Add analytics dashboard

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
