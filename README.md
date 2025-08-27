# Weeziq Monorepo

This is a monorepo containing both the Next.js frontend application and the WebSocket/AI service.

## 📁 Project Structure

```
weeziq-test/
├── apps/
│   ├── nextjs-app/          # Next.js frontend (deployed on Vercel)
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and configurations
│   │   ├── prisma/         # Database schema and migrations
│   │   └── ...
│   └── ws-service/         # WebSocket + AI service (deployed on Cloudflare)
│       ├── src/            # Cloudflare Worker source code
│       ├── socket-server.js # Legacy socket server
│       └── ...
└── package.json            # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (for frontend deployment)
- Cloudflare account (for WebSocket service)

### Installation

1. **Install all dependencies:**

   ```bash
   npm run install:all
   ```

2. **Start Next.js development server:**

   ```bash
   npm run dev:next
   ```

3. **Start WebSocket service (in another terminal):**
   ```bash
   npm run dev:ws
   ```

## 🏗️ Development

### Next.js App (apps/nextjs-app/)

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Database:** Prisma with PostgreSQL
- **Authentication:** Clerk

### WebSocket Service (apps/ws-service/)

- **Platform:** Cloudflare Workers
- **WebSockets:** Native WebSocket API with Durable Objects
- **AI Integration:** OpenAI API
- **Framework:** Hono (lightweight web framework)

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the **Root Directory** to `apps/nextjs-app`
3. Configure environment variables in Vercel dashboard
4. Deploy

### WebSocket Service (Cloudflare)

1. Install Wrangler CLI: `npm install -g wrangler`
2. Login to Cloudflare: `wrangler login`
3. Navigate to ws-service: `cd apps/ws-service`
4. Deploy: `npm run deploy`

## 🔧 Environment Variables

### Next.js App (.env.local)

```env
# Database
DATABASE_URL="your-postgresql-url"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-key"
CLERK_SECRET_KEY="your-clerk-secret"

# WebSocket Service
NEXT_PUBLIC_WS_URL="wss://your-cloudflare-worker.your-subdomain.workers.dev/ws"
NEXT_PUBLIC_AI_API_URL="https://your-cloudflare-worker.your-subdomain.workers.dev/ai"
```

### WebSocket Service (Cloudflare Workers)

```env
# AI Services
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_AI_API_KEY="your-google-ai-key"

# CORS Origins
ALLOWED_ORIGINS="https://your-vercel-app.vercel.app,http://localhost:3000"
```

## 📝 Scripts

### Root Level

- `npm run dev:next` - Start Next.js development server
- `npm run dev:ws` - Start WebSocket service development
- `npm run build:next` - Build Next.js app
- `npm run build:ws` - Build WebSocket service
- `npm run deploy:next` - Deploy to Vercel
- `npm run deploy:ws` - Deploy to Cloudflare

### Next.js App

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### WebSocket Service

- `npm run dev` - Start Wrangler development server
- `npm run deploy` - Deploy to Cloudflare Workers

## 🔗 Communication Between Services

The Next.js app communicates with the WebSocket service via:

- **WebSocket connections** for real-time chat
- **HTTP API calls** for AI responses

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts:** Make sure ports 3000 (Next.js) and 8787 (Wrangler) are available
2. **CORS errors:** Update `ALLOWED_ORIGINS` in Cloudflare Workers
3. **Environment variables:** Ensure all required env vars are set in both Vercel and Cloudflare

### Development Tips

- Use `npm run dev:next` and `npm run dev:ws` in separate terminals
- Check Cloudflare Workers logs in the Wrangler dashboard
- Use Vercel's function logs for debugging API routes

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
