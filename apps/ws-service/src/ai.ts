export class AIService {
  private openaiApiKey: string;
  private googleApiKey: string;

  constructor(env: any) {
    this.openaiApiKey = env.OPENAI_API_KEY;
    this.googleApiKey = env.GOOGLE_AI_API_KEY;
  }

  // Get AI response from OpenAI
  async getOpenAIResponse(message: string, context?: string): Promise<string> {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  context ||
                  "You are a helpful AI assistant for customer support.",
              },
              {
                role: "user",
                content: message,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API error:", error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
    }
  }

  // Get AI response from Google AI
  async getGoogleAIResponse(
    message: string,
    context?: string
  ): Promise<string> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.googleApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${
                      context ||
                      "You are a helpful AI assistant for customer support."
                    }\n\nUser: ${message}`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Google AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Google AI API error:", error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
    }
  }

  // Get AI response (tries OpenAI first, falls back to Google AI)
  async getResponse(
    message: string,
    context?: string,
    model: "openai" | "google" = "openai"
  ): Promise<string> {
    try {
      if (model === "openai" && this.openaiApiKey) {
        return await this.getOpenAIResponse(message, context);
      } else if (model === "google" && this.googleApiKey) {
        return await this.getGoogleAIResponse(message, context);
      } else {
        // Fallback logic
        if (this.openaiApiKey) {
          return await this.getOpenAIResponse(message, context);
        } else if (this.googleApiKey) {
          return await this.getGoogleAIResponse(message, context);
        } else {
          throw new Error("No AI API keys available");
        }
      }
    } catch (error) {
      console.error("AI response error:", error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
    }
  }
}

