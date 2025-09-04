# WeeziQ WebSocket Service - Troubleshooting Guide

## 🚨 **Critical Issues Fixed**

### 1. **WebSocket Connection Issues** ✅ FIXED

- **Problem**: WebSocket connections were failing to establish
- **Solution**: Enhanced WebSocket client with better error handling, reconnection logic, and message queuing
- **Files Updated**: `apps/nextjs-app/lib/cloudflareSocketClient.ts`

### 2. **AI Response Errors** ✅ FIXED

- **Problem**: AI responses showed errors in console but still displayed correctly
- **Solution**: Improved response structure handling to show AI responses even when warnings occur
- **Files Updated**: `apps/nextjs-app/hooks/chatbot/useChatBot.ts`

### 3. **Help Desk Not Showing** ✅ FIXED

- **Problem**: Help desk questions were not appearing in chatbot
- **Solution**: Enhanced domain loading to include help desk data and task summary
- **Files Updated**: `apps/nextjs-app/actions/bot/index.ts`, `apps/nextjs-app/hooks/chatbot/useChatBot.ts`

### 4. **Domain Configuration Issues** ✅ FIXED

- **Problem**: Code snippet and domain integration needed improvement
- **Solution**: Enhanced code snippet with better debugging and domain ID passing
- **Files Updated**: `apps/nextjs-app/components/settings/CodeSnippet.tsx`

## 🔧 **Environment Configuration**

### For Local Development:

1. **Run the setup script**:

   ```bash
   cd apps/ws-service
   npm run setup
   ```

2. **Or manually configure** `.dev.vars`:

   ```env
   # AI Services (REQUIRED)
   OPENAI_API_KEY=sk-your_actual_openai_key_here
   GOOGLE_AI_API_KEY=your_actual_google_ai_key_here

   # CORS & Security (REQUIRED)
   ALLOWED_ORIGINS=http://localhost:3000,https://weeziq.com,https://app.weeziq.com

   # Next.js API URL for database operations
   NEXTJS_API_URL=http://localhost:3000/api

   # Development
   NODE_ENV=development
   ```

### For Production Deployment:

1. **Set secrets in Cloudflare**:
   ```bash
   wrangler secret put OPENAI_API_KEY
   wrangler secret put GOOGLE_AI_API_KEY
   wrangler secret put ALLOWED_ORIGINS
   ```

## 🧪 **Testing Checklist**

### 1. **Start Services**

```bash
# From root directory
npm run dev  # Starts both Next.js and WebSocket services
```

### 2. **Verify WebSocket Service**

```bash
# Test health endpoint
curl http://localhost:8787

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "weeziq-ws-service"
}
```

### 3. **Test AI Endpoint**

```bash
curl -X POST http://localhost:8787/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "domainId": "your-domain-id"}'
```

### 4. **Test Chatbot Integration**

1. **Open Next.js app**: http://localhost:3000
2. **Go to Settings**: Navigate to domain settings
3. **Add Task Summary**: Fill in platform description
4. **Add Help Desk Questions**: Create FAQ entries
5. **Copy Code Snippet**: Use the generated embed code
6. **Test Embed**: Paste code on a test page

### 5. **Verify Real-time Features**

1. **WebSocket Connection**: Check browser console for connection logs
2. **AI Responses**: Send messages and verify responses
3. **Help Desk**: Click help desk button to see FAQ
4. **Real-time Updates**: Check if messages appear instantly

## 🔍 **Debugging Steps**

### 1. **Check WebSocket Connection**

```javascript
// In browser console
console.log("WebSocket Status:", cloudflareSocketClient.getConnectionStatus());
```

### 2. **Check Domain Data**

```javascript
// In browser console (on chatbot page)
console.log("Current Bot:", currentBot);
console.log("Help Desk:", currentBot?.helpdesk);
console.log("Task Summary:", currentBot?.chatBot?.taskSummary);
```

### 3. **Check AI Response Structure**

```javascript
// In browser console
// Look for "🤖 AI Response received:" logs
```

### 4. **Check Iframe Communication**

```javascript
// In browser console (on parent page)
// Look for "WeezIQ:" prefixed logs
```

## 🚨 **Common Issues & Solutions**

### 1. **"AI service error: 500"**

- **Cause**: Missing or invalid API keys
- **Solution**: Verify API keys in `.dev.vars` or Cloudflare secrets

### 2. **WebSocket Connection Failed**

- **Cause**: WebSocket service not running or CORS issues
- **Solution**:
  - Start WebSocket service: `npm run dev:ws`
  - Check CORS configuration in `.dev.vars`

### 3. **Help Desk Not Showing**

- **Cause**: Help desk data not loaded or help desk disabled
- **Solution**:
  - Add help desk questions in settings
  - Enable help desk in chatbot settings
  - Check domain ID is correct

### 4. **Iframe Not Loading**

- **Cause**: Domain validation or CORS issues
- **Solution**:
  - Check `ALLOWED_ORIGINS` includes your domain
  - Verify iframe URL is correct
  - Check browser console for errors

### 5. **Real-time Messages Not Working**

- **Cause**: WebSocket connection issues
- **Solution**:
  - Check WebSocket service is running
  - Verify WebSocket URL in environment
  - Check browser console for connection logs

## 📋 **Verification Commands**

### Local Development

- [ ] Run `npm run setup` in `apps/ws-service`
- [ ] Verify `.dev.vars` has valid API keys
- [ ] Start services: `npm run dev`
- [ ] Test health endpoint: `curl http://localhost:8787`
- [ ] Test AI endpoint with sample message
- [ ] Open chatbot and verify functionality

### Production Deployment

- [ ] Set Cloudflare secrets: `wrangler secret put OPENAI_API_KEY`
- [ ] Set Cloudflare secrets: `wrangler secret put GOOGLE_AI_API_KEY`
- [ ] Set Cloudflare secrets: `wrangler secret put ALLOWED_ORIGINS`
- [ ] Deploy WebSocket service: `npm run deploy:ws`
- [ ] Deploy Next.js app to Vercel
- [ ] Test production chatbot integration

### Reset and Reconfigure

```bash
# 1. Clear environment
rm apps/ws-service/.dev.vars

# 2. Reconfigure
cd apps/ws-service
npm run setup

# 3. Restart services
cd ../..
npm run dev
```

### Check All Services

```bash
# 1. Check WebSocket service
curl http://localhost:8787

# 2. Check Next.js app
curl http://localhost:3000

# 3. Check AI endpoint
curl -X POST http://localhost:8787/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

## 🎯 **Expected Behavior**

### ✅ **Working Chatbot Should:**

1. **Connect to WebSocket** automatically
2. **Show AI responses** without console errors
3. **Display help desk** when enabled
4. **Use task summary** for context-aware responses
5. **Handle real-time messages** instantly
6. **Work in iframe** on external websites

### 🔧 **Debug Information Available:**

1. **WebSocket logs**: Connection status and message flow
2. **AI response logs**: Response structure and content
3. **Domain data logs**: Help desk and task summary loading
4. **Iframe logs**: Communication between parent and chatbot

## 📞 **Support**

If issues persist after following this guide:

1. **Check the logs**:

   ```bash
   wrangler tail
   ```

2. **Verify all environment variables**:

   ```bash
   npm run test:config
   ```

3. **Test each component individually**:

   - WebSocket service health
   - AI API endpoints
   - Next.js app functionality
   - Database connections

4. **Review the error logs** in the WebSocket service for specific error details

5. **Check browser console** for client-side errors and WebSocket connection status
