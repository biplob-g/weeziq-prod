# 🚀 Environment Variables Quick Reference

## 📋 Required Variables Checklist

### **Next.js App (`apps/nextjs-app/.env.local`)**

```env
# 🔐 Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# 🗄️ Database
DATABASE_URL="postgresql://..."

# 🌐 App URLs (update after deployment)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=wss://your-worker.workers.dev/ws
NEXT_PUBLIC_AI_API_URL=https://your-worker.workers.dev

# 📤 UploadCare
NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY=...
```

### **WebSocket Service (`apps/ws-service/.dev.vars`)**

```env
# 🤖 AI Services
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...

# 🔒 CORS & Security
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 Where to Get API Keys

| Service        | URL                                                                          | Notes               |
| -------------- | ---------------------------------------------------------------------------- | ------------------- |
| **Clerk**      | [dashboard.clerk.com](https://dashboard.clerk.com/)                          | Authentication      |
| **OpenAI**     | [platform.openai.com/api-keys](https://platform.openai.com/api-keys)         | AI responses        |
| **Google AI**  | [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) | AI responses        |
| **UploadCare** | [uploadcare.com/dashboard](https://uploadcare.com/dashboard/)                | File uploads        |
| **Razorpay**   | [dashboard.razorpay.com](https://dashboard.razorpay.com/)                    | Payments (optional) |

## 🚀 Deployment Commands

### **1. Deploy WebSocket Service**

```bash
cd apps/ws-service

# Set secrets
wrangler secret put OPENAI_API_KEY
wrangler secret put GOOGLE_AI_API_KEY
wrangler secret put ALLOWED_ORIGINS

# Deploy
npm run deploy
```

### **2. Deploy Next.js App**

1. Connect GitHub repo to Vercel
2. Set root directory: `apps/nextjs-app`
3. Add environment variables in Vercel Dashboard
4. Deploy

## 🔄 Update URLs After Deployment

Replace these in your Next.js app environment variables:

```env
# Before (local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=wss://localhost:8787

# After (production)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-worker.workers.dev/ws
NEXT_PUBLIC_AI_API_URL=https://your-worker.workers.dev
```

## ⚡ Quick Setup Commands

```bash
# 1. Copy environment templates
cp apps/nextjs-app/env.example apps/nextjs-app/.env.local
cp apps/ws-service/env.example apps/ws-service/.dev.vars

# 2. Edit the files with your actual values
# 3. Start development
cd apps/nextjs-app && npm run dev
cd apps/ws-service && npm run dev
```

## 🚨 Critical Notes

- ✅ **Never commit** `.env.local` or `.dev.vars`
- ✅ **Use different keys** for dev/production
- ✅ **Update CORS origins** for production
- ✅ **Test WebSocket connections** after deployment
- ❌ **Don't change** Durable Object localhost URLs (they're internal)
