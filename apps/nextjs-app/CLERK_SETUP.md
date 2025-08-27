# 🔐 Clerk Authentication Setup Guide

## Current Issue

Your application is running in "keyless mode" which means Clerk authentication is not properly configured.

## 🔧 Setup Steps

### 1. Create Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get Your API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** and **Secret Key**

### 3. Configure Environment Variables

Create a `.env.local` file in `apps/nextjs-app/` with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
CLERK_SECRET_KEY=sk_test_your_actual_secret_key

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"

# WebSocket Service (Cloudflare)
NEXT_PUBLIC_WS_URL=wss://your-cloudflare-worker.workers.dev/ws
NEXT_PUBLIC_AI_API_URL=https://your-cloudflare-worker.workers.dev/ai

# Other Services
NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY=your_uploadcare_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 4. Configure Clerk Settings

1. In Clerk Dashboard, go to **User & Authentication**
2. Enable **Email address** as a sign-up method
3. Configure **Email verification** settings
4. Set up **Redirect URLs**:
   - After sign up: `http://localhost:3000/dashboard`
   - After sign in: `http://localhost:3000/dashboard`

### 5. Restart Development Server

```bash
npm run dev
```

## ✅ What's Fixed

1. **Loading States**: Added proper loading indicators to signup/signin buttons
2. **Button States**: Buttons are disabled during authentication processes
3. **Error Handling**: Better error messages and user feedback
4. **Form Validation**: Proper form validation and submission handling

## 🚨 Common Issues

### "Authentication system is not ready"

- **Cause**: Clerk keys not configured
- **Fix**: Add proper environment variables

### "Account already exists"

- **Cause**: User trying to sign up with existing email
- **Fix**: Direct them to sign in instead

### "Invalid credentials"

- **Cause**: Wrong email/password combination
- **Fix**: Check credentials and try again

## 🔍 Testing

1. **Sign Up Flow**:

   - Fill out registration form
   - Verify email with OTP
   - Should redirect to dashboard

2. **Sign In Flow**:

   - Enter email and password
   - Should redirect to dashboard

3. **Error Handling**:
   - Try invalid credentials
   - Should show proper error messages

## 📞 Support

If you continue having issues:

1. Check Clerk dashboard for any configuration errors
2. Verify environment variables are loaded correctly
3. Check browser console for any JavaScript errors
