#!/bin/bash

# 🚀 WeeziQ WebSocket Service Setup Script
# This script helps you set up and deploy the WebSocket service to Cloudflare Workers

set -e

echo "🚀 Starting WeeziQ WebSocket Service Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Check if Wrangler is installed
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler CLI is not installed. Installing now..."
        npm install -g wrangler
    fi
    
    print_success "Wrangler CLI is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Login to Cloudflare
login_cloudflare() {
    print_status "Logging in to Cloudflare..."
    if ! wrangler whoami &> /dev/null; then
        print_warning "Not logged in to Cloudflare. Please log in now..."
        wrangler login
    else
        print_success "Already logged in to Cloudflare"
    fi
}

# Create KV namespace
create_kv_namespace() {
    print_status "Creating KV namespace for chat storage..."
    
    # Check if namespace already exists
    if wrangler kv:namespace list | grep -q "CHAT_STORAGE"; then
        print_warning "KV namespace CHAT_STORAGE already exists"
    else
        wrangler kv:namespace create "CHAT_STORAGE"
        print_success "KV namespace CHAT_STORAGE created"
    fi
    
    # Create preview namespace
    if wrangler kv:namespace list --preview | grep -q "CHAT_STORAGE"; then
        print_warning "Preview KV namespace CHAT_STORAGE already exists"
    else
        wrangler kv:namespace create "CHAT_STORAGE" --preview
        print_success "Preview KV namespace CHAT_STORAGE created"
    fi
}

# Create R2 bucket (optional)
create_r2_bucket() {
    print_status "Creating R2 bucket for file storage..."
    
    if wrangler r2 bucket list | grep -q "weeziq-files"; then
        print_warning "R2 bucket weeziq-files already exists"
    else
        wrangler r2 bucket create weeziq-files
        print_success "R2 bucket weezi-files created"
    fi
}

# Set environment secrets
set_secrets() {
    print_status "Setting up environment secrets..."
    
    # Check if secrets are already set
    if wrangler secret list | grep -q "OPENAI_API_KEY"; then
        print_warning "OPENAI_API_KEY is already set"
    else
        echo "Please enter your OpenAI API key:"
        read -s OPENAI_API_KEY
        echo "$OPENAI_API_KEY" | wrangler secret put OPENAI_API_KEY
        print_success "OPENAI_API_KEY set successfully"
    fi
    
    if wrangler secret list | grep -q "GOOGLE_AI_API_KEY"; then
        print_warning "GOOGLE_AI_API_KEY is already set"
    else
        echo "Please enter your Google AI API key (or press Enter to skip):"
        read -s GOOGLE_AI_API_KEY
        if [ ! -z "$GOOGLE_AI_API_KEY" ]; then
            echo "$GOOGLE_AI_API_KEY" | wrangler secret put GOOGLE_AI_API_KEY
            print_success "GOOGLE_AI_API_KEY set successfully"
        else
            print_warning "Skipping Google AI API key setup"
        fi
    fi
    
    if wrangler secret list | grep -q "ALLOWED_ORIGINS"; then
        print_warning "ALLOWED_ORIGINS is already set"
    else
        echo "Please enter allowed origins (comma-separated, e.g., https://your-app.vercel.app,https://weeziq.com):"
        read ALLOWED_ORIGINS
        echo "$ALLOWED_ORIGINS" | wrangler secret put ALLOWED_ORIGINS
        print_success "ALLOWED_ORIGINS set successfully"
    fi
}

# Build the project
build_project() {
    print_status "Building the project..."
    npm run build
    print_success "Project built successfully"
}

# Deploy to Cloudflare
deploy_to_cloudflare() {
    print_status "Deploying to Cloudflare Workers..."
    wrangler deploy
    print_success "Deployed to Cloudflare Workers successfully"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Get the worker URL
    WORKER_URL=$(wrangler whoami | grep "Account" | awk '{print $2}' | sed 's/.*@//')
    WORKER_URL="https://weeziq-ws-service.$WORKER_URL.workers.dev"
    
    print_status "Worker URL: $WORKER_URL"
    
    # Test health endpoint
    if curl -s "$WORKER_URL/" | grep -q "ok"; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        exit 1
    fi
}

# Main setup function
main() {
    echo "=========================================="
    echo "🚀 WeeziQ WebSocket Service Setup"
    echo "=========================================="
    
    check_node
    check_npm
    check_wrangler
    install_dependencies
    login_cloudflare
    create_kv_namespace
    create_r2_bucket
    set_secrets
    build_project
    deploy_to_cloudflare
    test_deployment
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "🎉 Your WebSocket service is now deployed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your Next.js app environment variables"
    echo "2. Test the WebSocket connection"
    echo "3. Configure your domain (optional)"
    echo ""
    echo "📚 For more information, see DEPLOYMENT_GUIDE.md"
    echo ""
}

# Run main function
main "$@"
