#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 WeeziQ WebSocket Service Environment Setup');
console.log('============================================\n');

const questions = [
  {
    name: 'openaiKey',
    message: 'Enter your OpenAI API Key (sk-...): ',
    required: true
  },
  {
    name: 'googleKey',
    message: 'Enter your Google AI API Key: ',
    required: false
  },
  {
    name: 'nextjsUrl',
    message: 'Enter your Next.js API URL (default: http://localhost:3000/api): ',
    default: 'http://localhost:3000/api'
  },
  {
    name: 'allowedOrigins',
    message: 'Enter allowed origins (comma-separated, default: http://localhost:3000): ',
    default: 'http://localhost:3000,https://weeziq.com,https://app.weeziq.com'
  }
];

let answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    writeEnvFile();
    return;
  }

  const question = questions[index];
  const prompt = question.message;
  
  rl.question(prompt, (answer) => {
    if (answer.trim() === '' && question.required) {
      console.log('❌ This field is required. Please try again.');
      askQuestion(index);
      return;
    }
    
    if (answer.trim() === '' && question.default) {
      answer = question.default;
    }
    
    answers[question.name] = answer.trim();
    askQuestion(index + 1);
  });
}

function writeEnvFile() {
  const envContent = `# AI Services (REQUIRED)
OPENAI_API_KEY=${answers.openaiKey}
${answers.googleKey ? `GOOGLE_AI_API_KEY=${answers.googleKey}` : '# GOOGLE_AI_API_KEY=your_google_ai_api_key_here'}

# CORS & Security (REQUIRED)
ALLOWED_ORIGINS=${answers.allowedOrigins}

# Next.js API URL for database operations
NEXTJS_API_URL=${answers.nextjsUrl}

# Development
NODE_ENV=development
`;

  const envPath = path.join(__dirname, '.dev.vars');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment variables saved to .dev.vars');
    console.log('\n📋 Next steps:');
    console.log('1. Start the WebSocket service: npm run dev:ws');
    console.log('2. Start the Next.js app: npm run dev:next');
    console.log('3. Test the connection at: http://localhost:8787');
    console.log('\n🔧 For production deployment:');
    console.log('- Set secrets in Cloudflare: wrangler secret put OPENAI_API_KEY');
    console.log('- Set secrets in Cloudflare: wrangler secret put GOOGLE_AI_API_KEY');
    console.log('- Set secrets in Cloudflare: wrangler secret put ALLOWED_ORIGINS');
  } catch (error) {
    console.error('❌ Error writing .dev.vars file:', error.message);
  }
  
  rl.close();
}

// Start the setup
askQuestion(0);
