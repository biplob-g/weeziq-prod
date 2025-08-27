@echo off
REM 🚀 WeeziQ WebSocket Service Setup Script for Windows
REM This script helps you set up and deploy the WebSocket service to Cloudflare Workers

echo 🚀 Starting WeeziQ WebSocket Service Setup...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18+ first.
    exit /b 1
)

echo [SUCCESS] Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

echo [SUCCESS] npm is installed

REM Check if Wrangler is installed
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Wrangler CLI is not installed. Installing now...
    npm install -g wrangler
)

echo [SUCCESS] Wrangler CLI is installed

REM Install dependencies
echo [INFO] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Login to Cloudflare
echo [INFO] Logging in to Cloudflare...
wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Not logged in to Cloudflare. Please log in now...
    wrangler login
) else (
    echo [SUCCESS] Already logged in to Cloudflare
)

REM Create KV namespace
echo [INFO] Creating KV namespace for chat storage...
wrangler kv:namespace create "CHAT_STORAGE" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] KV namespace CHAT_STORAGE created
) else (
    echo [WARNING] KV namespace CHAT_STORAGE already exists or failed to create
)

wrangler kv:namespace create "CHAT_STORAGE" --preview 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Preview KV namespace CHAT_STORAGE created
) else (
    echo [WARNING] Preview KV namespace CHAT_STORAGE already exists or failed to create
)

REM Create R2 bucket (optional)
echo [INFO] Creating R2 bucket for file storage...
wrangler r2 bucket create weeziq-files 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] R2 bucket weeziq-files created
) else (
    echo [WARNING] R2 bucket weeziq-files already exists or failed to create
)

REM Set environment secrets
echo [INFO] Setting up environment secrets...

echo Please enter your OpenAI API key:
set /p OPENAI_API_KEY=
if not "%OPENAI_API_KEY%"=="" (
    echo %OPENAI_API_KEY% | wrangler secret put OPENAI_API_KEY
    echo [SUCCESS] OPENAI_API_KEY set successfully
) else (
    echo [WARNING] Skipping OpenAI API key setup
)

echo Please enter your Google AI API key (or press Enter to skip):
set /p GOOGLE_AI_API_KEY=
if not "%GOOGLE_AI_API_KEY%"=="" (
    echo %GOOGLE_AI_API_KEY% | wrangler secret put GOOGLE_AI_API_KEY
    echo [SUCCESS] GOOGLE_AI_API_KEY set successfully
) else (
    echo [WARNING] Skipping Google AI API key setup
)

echo Please enter allowed origins (comma-separated, e.g., https://your-app.vercel.app,https://weeziq.com):
set /p ALLOWED_ORIGINS=
if not "%ALLOWED_ORIGINS%"=="" (
    echo %ALLOWED_ORIGINS% | wrangler secret put ALLOWED_ORIGINS
    echo [SUCCESS] ALLOWED_ORIGINS set successfully
) else (
    echo [WARNING] Skipping allowed origins setup
)

REM Build the project
echo [INFO] Building the project...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build project
    exit /b 1
)
echo [SUCCESS] Project built successfully

REM Deploy to Cloudflare
echo [INFO] Deploying to Cloudflare Workers...
wrangler deploy
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Cloudflare
    exit /b 1
)
echo [SUCCESS] Deployed to Cloudflare Workers successfully

echo.
echo ==========================================
echo [SUCCESS] Setup completed successfully!
echo ==========================================
echo.
echo 🎉 Your WebSocket service is now deployed!
echo.
echo 📋 Next steps:
echo 1. Update your Next.js app environment variables
echo 2. Test the WebSocket connection
echo 3. Configure your domain (optional)
echo.
echo 📚 For more information, see DEPLOYMENT_GUIDE.md
echo.

pause
