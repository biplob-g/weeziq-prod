# WeezGen - AI Chatbot Platform

A Next.js 15 chatbot platform with AI-powered conversations, user management, and admin dashboard.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

## 🧪 Testing

WeezGen includes comprehensive testing tools to ensure all features work correctly.

### **Testing Tools**

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **Custom Test Scripts**: Feature validation

### **Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test types
npm run test:unit      # Unit tests only
npm run test:integration # Integration tests only
npm run test:db        # Database tests only
```

### **Feature Testing Script**

Test all implemented features with our comprehensive testing script:

```bash
# Run feature tests
npx tsx scripts/test-features.ts
```

This script tests:

- ✅ **User Information Form**: Form validation and submission
- ✅ **IP-based Chat History**: Returning user detection
- ✅ **AI Chatbot**: Response generation and conversation flow
- ✅ **Admin Panel**: Conversation management and filtering
- ✅ **Database Operations**: Customer creation, IP detection, conversation deletion
- ✅ **Country Detection**: IP-based country code auto-detection

### **Test Coverage**

Our testing strategy covers:

#### **Unit Tests** (80%+ coverage)

- Component rendering and interactions
- Hook logic and state management
- Utility functions and validations
- Form handling and validation

#### **Integration Tests** (70%+ coverage)

- Server actions and API endpoints
- Database operations and relationships
- Authentication flows
- AI integration

#### **E2E Tests** (Critical flows)

- Complete user registration flow
- Chatbot conversation flow
- Admin panel operations
- Cross-browser compatibility

### **Testing Best Practices**

1. **Component Testing**: Test user interactions and accessibility
2. **Hook Testing**: Test business logic and state management
3. **Integration Testing**: Test API endpoints and database operations
4. **E2E Testing**: Test complete user workflows
5. **Performance Testing**: Test loading times and responsiveness

### **Test Data Management**

- **Test Database**: Separate test database for isolated testing
- **Mock Data**: Consistent test data for reliable results
- **Cleanup**: Automatic cleanup after each test
- **Isolation**: Each test runs independently

## 📁 Project Structure

```
weezgen/
├── __tests__/              # Test files
│   ├── components/         # Component tests
│   ├── hooks/             # Hook tests
│   ├── lib/               # Utility tests
│   └── integration/       # Integration tests
├── e2e/                   # End-to-end tests
├── scripts/               # Testing and maintenance scripts
├── components/            # React components
├── hooks/                 # Custom React hooks
├── actions/               # Server actions
├── lib/                   # Utilities and configurations
└── prisma/                # Database schema
```

## 🔧 Development

### **Environment Variables**

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# AI
GEMINI_API_KEY="..."

# File Upload
NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY="..."
```

### **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open database GUI
npx prisma studio
```

### **Code Quality**

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Format code
npx prettier --write .
```

## 🎯 Key Features

### **User Information Form**

- Collect user details (name, email, phone)
- IP-based country detection
- Form validation with Zod
- Personalized welcome messages

### **IP-based Chat History**

- Detect returning users by IP address
- Show previous conversations
- 14-day retention period
- Seamless user experience

### **AI Chatbot**

- Google Gemini integration
- Real-time conversations
- File upload support
- Context-aware responses

### **Admin Dashboard**

- Conversation management
- Customer information display
- Filtering (All/Unread/Expired)
- Delete conversations

### **Multi-domain Support**

- Domain-specific chatbots
- User domain management
- URL-based domain selection

## 🚀 Deployment

### **Vercel Deployment**

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Database Migration**

```bash
# Create production migration
npx prisma migrate deploy

# Verify database connection
npx prisma db push
```

## 📊 Monitoring

### **Performance Monitoring**

- Page load times
- API response times
- Database query performance
- Error tracking

### **User Analytics**

- Conversation metrics
- User engagement
- Feature usage
- Conversion tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

### **Testing Checklist**

Before submitting a PR, ensure:

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Code coverage is maintained
- [ ] No linting errors
- [ ] TypeScript compilation succeeds

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review test examples

---

**Built with ❤️ using Next.js 15, React 19, TypeScript, and Prisma**
