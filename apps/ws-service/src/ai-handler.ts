import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ConversationContext {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  domainId?: string;
  userId?: string;
}

export class AIHandler {
  private openai: OpenAI;
  private googleAI: GoogleGenerativeAI;
  private conversationContexts: Map<string, ConversationContext> = new Map();

  constructor() {
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Google AI
    this.googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
  }

  async getResponse(
    message: string,
    model: string = "gpt-3.5-turbo",
    domainId?: string,
    userId?: string,
    conversationId?: string
  ) {
    try {
      // Get or create conversation context
      const contextKey = conversationId || `${domainId}-${userId}`;
      const context = this.getConversationContext(contextKey, domainId, userId);

      // Add user message to context
      context.messages.push({
        role: "user",
        content: message,
        timestamp: new Date(),
      });

      let response;
      if (model.includes("gpt")) {
        response = await this.getOpenAIResponse(message, model, context);
      } else if (model.includes("gemini")) {
        response = await this.getGoogleAIResponse(message, model, context);
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }

      // Add assistant response to context
      context.messages.push({
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      });

      // Limit context to last 10 messages to prevent token overflow
      if (context.messages.length > 10) {
        context.messages = context.messages.slice(-10);
      }

      return {
        ...response,
        conversationId: contextKey,
        contextLength: context.messages.length,
      };
    } catch (error) {
      console.error("AI response error:", error);
      return {
        message: this.getFallbackResponse(domainId),
        timestamp: new Date().toISOString(),
        error: true,
        conversationId: conversationId || `${domainId}-${userId}`,
      };
    }
  }

  async streamResponse(
    message: string,
    model: string = "gpt-3.5-turbo",
    domainId?: string,
    controller?: ReadableStreamDefaultController,
    userId?: string,
    conversationId?: string
  ) {
    try {
      // Get or create conversation context
      const contextKey = conversationId || `${domainId}-${userId}`;
      const context = this.getConversationContext(contextKey, domainId, userId);

      // Add user message to context
      context.messages.push({
        role: "user",
        content: message,
        timestamp: new Date(),
      });

      if (model.includes("gpt")) {
        await this.streamOpenAIResponse(message, model, controller, context);
      } else if (model.includes("gemini")) {
        await this.streamGoogleAIResponse(message, model, controller, context);
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }

      // Note: Assistant response will be added to context after streaming completes
    } catch (error) {
      console.error("AI streaming error:", error);
      if (controller) {
        const fallbackMessage = this.getFallbackResponse(domainId);
        controller.enqueue(new TextEncoder().encode(fallbackMessage));
        controller.close();
      }
    }
  }

  private getConversationContext(
    contextKey: string,
    domainId?: string,
    userId?: string
  ): ConversationContext {
    if (!this.conversationContexts.has(contextKey)) {
      this.conversationContexts.set(contextKey, {
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(domainId),
            timestamp: new Date(),
          },
        ],
        domainId,
        userId,
      });
    }
    return this.conversationContexts.get(contextKey)!;
  }

  private getSystemPrompt(domainId?: string): string {
    const basePrompt =
      "You are a helpful AI assistant. Provide clear, concise, and helpful responses.";

    if (!domainId) {
      return basePrompt;
    }

    // Domain-specific prompts
    const domainPrompts: Record<string, string> = {
      "weeziq.com":
        "You are a customer support assistant for WeeziQ, an AI chatbot platform. Help users with questions about our services, pricing, and features. Be friendly and professional.",
      default: basePrompt,
    };

    return domainPrompts[domainId] || domainPrompts.default;
  }

  private getFallbackResponse(domainId?: string): string {
    const fallbackResponses = {
      "weeziq.com":
        "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment or contact our support team.",
      default:
        "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
    };

    return (
      fallbackResponses[domainId as keyof typeof fallbackResponses] ||
      fallbackResponses.default
    );
  }

  private async getOpenAIResponse(
    message: string,
    model: string,
    context: ConversationContext
  ) {
    const completion = await this.openai.chat.completions.create({
      model: model,
      messages: context.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: 1000,
      temperature: 0.7,
    });

    return {
      message:
        completion.choices[0]?.message?.content || "No response generated",
      timestamp: new Date().toISOString(),
      model: model,
    };
  }

  private async streamOpenAIResponse(
    message: string,
    model: string,
    controller?: ReadableStreamDefaultController,
    context?: ConversationContext
  ) {
    if (!controller) return;

    const stream = await this.openai.chat.completions.create({
      model: model,
      messages: context?.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) || [
        {
          role: "system",
          content: this.getSystemPrompt(),
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        controller.enqueue(new TextEncoder().encode(content));
      }
    }

    // Add assistant response to context if available
    if (context && fullResponse) {
      context.messages.push({
        role: "assistant",
        content: fullResponse,
        timestamp: new Date(),
      });

      // Limit context to last 10 messages
      if (context.messages.length > 10) {
        context.messages = context.messages.slice(-10);
      }
    }

    controller.close();
  }

  private async getGoogleAIResponse(
    message: string,
    model: string,
    context: ConversationContext
  ) {
    const geminiModel = this.googleAI.getGenerativeModel({
      model: "gemini-pro",
    });

    // Prepare conversation history for Gemini
    const history = context.messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

    const systemPrompt =
      context.messages.find((msg) => msg.role === "system")?.content ||
      this.getSystemPrompt();

    const chat = geminiModel.startChat({
      history: history.slice(0, -1), // Exclude the current user message
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(
      `${systemPrompt}\n\nUser: ${message}`
    );
    const response = await result.response;
    const text = response.text();

    return {
      message: text,
      timestamp: new Date().toISOString(),
      model: model,
    };
  }

  private async streamGoogleAIResponse(
    message: string,
    model: string,
    controller?: ReadableStreamDefaultController,
    context?: ConversationContext
  ) {
    if (!controller) return;

    const geminiModel = this.googleAI.getGenerativeModel({
      model: "gemini-pro",
    });

    const systemPrompt =
      context?.messages.find((msg) => msg.role === "system")?.content ||
      this.getSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

    const result = await geminiModel.generateContentStream(fullPrompt);

    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullResponse += chunkText;
        controller.enqueue(new TextEncoder().encode(chunkText));
      }
    }

    // Add assistant response to context if available
    if (context && fullResponse) {
      context.messages.push({
        role: "assistant",
        content: fullResponse,
        timestamp: new Date(),
      });

      // Limit context to last 10 messages
      if (context.messages.length > 10) {
        context.messages = context.messages.slice(-10);
      }
    }

    controller.close();
  }

  // Clear conversation context
  public clearConversation(conversationId: string) {
    this.conversationContexts.delete(conversationId);
  }

  // Get conversation history
  public getConversationHistory(conversationId: string) {
    return this.conversationContexts.get(conversationId)?.messages || [];
  }
}
