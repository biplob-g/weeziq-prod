#!/bin/bash

echo "🚀 Setting up WeeziQ WebSocket Service..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Copy environment template
if [ ! -f .dev.vars ]; then
    echo "📝 Creating .dev.vars file..."
    cp env.example .dev.vars
    echo "⚠️  Please edit .dev.vars with your actual values"
fi

# Set up Cloudflare secrets
echo "🔐 Setting up Cloudflare secrets..."
echo "Please run these commands manually:"
echo "wrangler secret put DATABASE_URL"
echo "wrangler secret put OPENAI_API_KEY"
echo "wrangler secret put GOOGLE_AI_API_KEY"

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .dev.vars with your actual values"
echo "2. Set Cloudflare secrets using wrangler"
echo "3. Run 'npm run dev' to start development server"
echo "4. Run 'npm run deploy' to deploy to production"
