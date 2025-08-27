# WeeziQ WebSocket Service

A Cloudflare Worker-based WebSocket service for real-time chat, AI responses, and visitor tracking.

## Features

- **Real-time WebSocket communication** for chat rooms and messaging
- **AI integration** with OpenAI and Google Generative AI for chat responses
- **Visitor tracking** with domain-based analytics
- **Durable Objects** for persistent state management
- **KV storage** for data persistence
- **R2 bucket** for file storage
- **CORS support** for cross-origin requests

## Architecture

### Durable Objects

This service uses Cloudflare Durable Objects for managing persistent state:

- **ChatRoom**: Manages WebSocket connections and chat room state
- **VisitorTracker**: Tracks visitor activity and domain statistics

### Localhost URLs in Durable Object Communication

**Important**: The `localhost` URLs (e.g., `http://localhost/visitors/add`) used in the code are **NOT** external network calls. These are internal Cloudflare Workers patterns for Durable Object communication.

When you call:

```typescript
const visitorTracker = env.VISITOR_TRACKER.get(
  env.VISITOR_TRACKER.idFromName(domainId)
);
const response = await visitorTracker.fetch(
  new Request("http://localhost/visitors/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domainId, visitorId, visitorData }),
  })
);
```

The `localhost` part is a convention that tells the Cloudflare Workers runtime this is an internal request to the Durable Object itself. The path (`/visitors/add`) is then handled by the Durable Object's `fetch` method. This is safe and will work correctly in production deployment.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Login to Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Set up environment variables**:

   ```bash
   # Set your API keys as secrets
   wrangler secret put OPENAI_API_KEY
   wrangler secret put GOOGLE_AI_API_KEY
   wrangler secret put ALLOWED_ORIGINS
   ```

4. **Create KV namespace and R2 bucket**:

   ```bash
   # Create KV namespace
   wrangler kv:namespace create "CHAT_STORAGE"
   wrangler kv:namespace create "CHAT_STORAGE" --preview

   # Create R2 bucket
   wrangler r2 bucket create "weeziq-files"
   ```

5. **Update wrangler.toml** with your KV namespace IDs and R2 bucket name.

### Development

**Local development with Socket.io**:

```bash
npm run dev
```

**Local development with Wrangler**:

```bash
npm run dev:worker
```

### Deployment

```bash
npm run deploy
```

## API Reference

### WebSocket Endpoints

#### Connect to WebSocket

```
GET /ws
```

#### Message Types

**Join Room**:

```json
{
  "type": "join-room",
  "roomId": "room-123",
  "userId": "user-456",
  "userName": "John Doe"
}
```

**Send Message**:

```json
{
  "type": "send-message",
  "roomId": "room-123",
  "message": "Hello world!",
  "userId": "user-456",
  "userName": "John Doe",
  "role": "user"
}
```

**AI Chat**:

```json
{
  "type": "ai-chat",
  "message": "What is AI?",
  "model": "gpt-3.5-turbo",
  "domainId": "weeziq.com",
  "userId": "user-456",
  "conversationId": "conv-789"
}
```

**AI Stream**:

```json
{
  "type": "ai-stream",
  "message": "Explain quantum computing",
  "model": "gpt-4",
  "domainId": "weeziq.com",
  "userId": "user-456",
  "conversationId": "conv-789"
}
```

### HTTP Endpoints

#### Health Check

```
GET /
```

#### AI Chat (Non-streaming)

```
POST /ai/chat
Content-Type: application/json

{
  "message": "Hello AI!",
  "model": "gpt-3.5-turbo",
  "domainId": "weeziq.com",
  "userId": "user-123",
  "conversationId": "conv-456"
}
```

#### AI Stream

```
POST /ai/stream
Content-Type: application/json

{
  "message": "Tell me a story",
  "model": "gpt-4",
  "domainId": "weeziq.com",
  "userId": "user-123",
  "conversationId": "conv-456"
}
```

#### Visitor Management

```
POST /visitors/add
POST /visitors/remove
GET /stats/domain/:domainId
```

## Next.js Integration

### Environment Variables

Add to your Next.js app's `.env.local`:

```env
NEXT_PUBLIC_WS_URL=https://your-worker.your-subdomain.workers.dev
NEXT_PUBLIC_AI_API_URL=https://your-worker.your-subdomain.workers.dev
```

### Socket Client

Use the provided `cloudflareSocketClient.ts` for production or `socketClient.ts` for local development.

## Security

- **CORS**: Configured for specific origins
- **API Keys**: Stored as Cloudflare secrets
- **Input Validation**: All inputs are validated
- **Rate Limiting**: Implemented for AI endpoints

## Monitoring

- **Health checks**: Available at `/`
- **Error logging**: All errors are logged to Cloudflare Workers logs
- **Metrics**: Available in Cloudflare dashboard

## Configuration

### wrangler.toml

```toml
name = "weeziq-ws-service"
compatibility_date = "2024-01-15"
compatibility_flags = ["nodejs_compat"]

main = "src/index.ts"

[vars]
NODE_ENV = "production"

[[durable_objects.bindings]]
name = "CHAT_ROOM"
class_name = "ChatRoom"

[[durable_objects.bindings]]
name = "VISITOR_TRACKER"
class_name = "VisitorTracker"

[[kv_namespaces]]
binding = "CHAT_STORAGE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

[[r2_buckets]]
binding = "FILE_STORAGE"
bucket_name = "weeziq-files"

[[migrations]]
tag = "v1"
new_classes = ["ChatRoom", "VisitorTracker"]
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Run `npm run build` to check for type errors
2. **Durable Object Errors**: Ensure migrations are applied with `wrangler deploy`
3. **CORS Errors**: Check origin configuration in CORS middleware
4. **API Key Errors**: Verify secrets are set with `wrangler secret list`

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Performance

- **WebSocket connections**: Handled efficiently with Durable Objects
- **AI responses**: Streaming for better user experience
- **Data persistence**: KV storage for fast access
- **File storage**: R2 for scalable file management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the Cloudflare Workers documentation
- Review the troubleshooting section above
