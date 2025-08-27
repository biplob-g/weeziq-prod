"use server";

import { client } from "@/lib/prisma";
import { extractEmailsFromString, extractURLfromString } from "@/lib/utils";
// import { onRealTimeChat } from "../conversation";
import { clerkClient } from "@clerk/nextjs/server";
import { onMailer } from "../mailer";

// OpenAI Import - Migrated from Gemini AI
import OpenAI from "openai";
import { onCheckAiCredits, onConsumeAiCredit } from "../settings";

// Initialize OpenAI client with gpt-4o-mini model
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Model Configuration
const GPT_4O = "gpt-4o";
const GPT_4O_MINI = "gpt-4o-mini";

// ✅ NEW: Function to analyze query complexity and route to appropriate model
const analyzeQueryComplexity = (message: string): "complex" | "simple" => {
  const message_lower = message.toLowerCase();

  // Complex query indicators
  const complexIndicators = [
    // Analysis & reasoning
    "analyze",
    "comparison",
    "compare",
    "evaluate",
    "assess",
    "pros and cons",
    "advantages",
    "disadvantages",
    "benefits",
    "drawbacks",
    "detailed explanation",

    // Technical/professional content
    "strategy",
    "implementation",
    "architecture",
    "design",
    "optimize",
    "algorithm",
    "technical",
    "professional",
    "business plan",
    "market analysis",
    "financial",

    // Multi-step processes
    "step by step",
    "guide",
    "tutorial",
    "how to implement",
    "comprehensive",
    "detailed process",
    "methodology",
    "framework",
    "systematic approach",

    // Complex reasoning
    "because",
    "therefore",
    "however",
    "moreover",
    "furthermore",
    "in contrast",
    "on the other hand",
    "considering",
    "given that",
    "taking into account",

    // Long-form content
    "explain in detail",
    "provide examples",
    "elaborate",
    "comprehensive overview",
    "in-depth",
    "thorough",
    "extensive",
    "complete analysis",
  ];

  // Simple query indicators
  const simpleIndicators = [
    // Basic greetings
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",

    // Simple questions
    "what is",
    "who is",
    "when",
    "where",
    "which",
    "yes",
    "no",
    "ok",
    "okay",

    // Basic information
    "price",
    "cost",
    "hours",
    "location",
    "contact",
    "phone",
    "email",
    "address",

    // FAQ-style questions
    "do you",
    "can you",
    "will you",
    "are you",
    "is it",
    "does it",
    "can i",

    // Simple requests
    "help",
    "support",
    "information",
    "details",
    "more info",
    "tell me about",
  ];

  // Check message length (longer messages often require more complex reasoning)
  if (message.length > 200) {
    return "complex";
  }

  // Count indicators
  const complexMatches = complexIndicators.filter((indicator) =>
    message_lower.includes(indicator)
  ).length;

  const simpleMatches = simpleIndicators.filter((indicator) =>
    message_lower.includes(indicator)
  ).length;

  // Decision logic
  if (complexMatches > simpleMatches) {
    return "complex";
  } else if (simpleMatches > complexMatches) {
    return "simple";
  } else {
    // Default to simple for efficiency and cost reduction
    // Only use complex model when clearly needed
    return "simple";
  }
};

// ✅ NEW: Get uploaded file content for AI context
const getUploadedFileContext = async (domainId: string): Promise<string> => {
  try {
    const files = await client.fileUpload.findMany({
      where: {
        domainId,
        uploadStatus: "COMPLETED",
        fileContent: {
          not: null,
        },
      },
      select: {
        fileName: true,
        fileType: true,
        fileContent: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, // Limit to 5 most recent files to avoid token overflow
    });

    if (files.length === 0) {
      return "";
    }

    // ✅ NEW: Process actual file content for AI context
    const contextSections = files
      .map((file, index) => {
        let content = file.fileContent || "";

        // Truncate very long content to prevent token overflow
        if (content.length > 2000) {
          content = content.substring(0, 2000) + "... [content truncated]";
        }

        return `=== FILE ${index + 1}: ${file.fileName} (${file.fileType}) ===
${content}
=== END OF FILE ${index + 1} ===`;
      })
      .join("\n\n");

    return `\n\nUPLOADED CONTEXT FILES (${files.length} files available):
${contextSections}

INSTRUCTIONS: Use the content from these uploaded files to provide more accurate and informed responses. Reference specific information from the files when relevant to the user's question.\n`;
  } catch (error) {
    console.error("Error getting uploaded file context:", error);
    return "";
  }
};

export const onStoreConversations = async (
  id: string,
  message: string,
  role: "assistant" | "user"
) => {
  console.log(id, ":", message);

  const result = await client.chatRoom.update({
    where: {
      id,
    },
    data: {
      message: {
        create: {
          message,
          role: role === "user" ? "CUSTOMER" : "OWNER",
        },
      },
    },
    include: {
      message: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // Return the ID of the newly created message
  return result.message[0]?.id || null;
};

export const onGetCurrentChatBot = async (id: string) => {
  try {
    console.log("🔍 Searching for domain with ID:", id);

    const chatbot = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        helpdesk: {
          select: {
            id: true,
            question: true,
            answered: true,
            domainId: true,
          },
        },
        name: true,
        chatBot: {
          select: {
            id: true,
            welcomeMessage: true,
            icon: true,
            textColor: true,
            background: true,
            helpdesk: true,
          },
        },
      },
    });

    // If domain exists but has no chatBot, create a default one
    if (chatbot && !chatbot.chatBot) {
      console.log(
        "🔄 Domain found but no chatBot exists, creating default chatBot..."
      );

      const updatedDomain = await client.domain.update({
        where: { id },
        data: {
          chatBot: {
            create: {
              welcomeMessage: "Hello! How can I help you today?",
              helpdesk: true,
            },
          },
        },
        select: {
          helpdesk: {
            select: {
              id: true,
              question: true,
              answered: true,
              domainId: true,
            },
          },
          name: true,
          chatBot: {
            select: {
              id: true,
              welcomeMessage: true,
              icon: true,
              textColor: true,
              background: true,
              helpdesk: true,
            },
          },
        },
      });

      console.log("✅ Default chatBot created:", updatedDomain);
      return updatedDomain;
    }

    console.log("📋 Domain query result:", chatbot);

    if (chatbot) {
      console.log("✅ Domain found:", chatbot.name);
      return chatbot;
    } else {
      console.log("❌ No domain found with ID:", id);
      return null;
    }
  } catch (error) {
    console.error("💥 Database error in onGetCurrentChatBot:", error);
    return null;
  }
};

let customerEmail: string | undefined;

export const onAiChatBotAssistant = async (
  id: string,
  chat: { role: "assistant" | "user"; content: string }[],
  author: "user",
  message: string,
  providedCustomerEmail?: string
) => {
  try {
    console.log("🤖 AI ChatBot Assistant called with:", {
      id,
      chatLength: chat.length,
      author,
      messageLength: message.length,
      providedCustomerEmail,
    });

    // ✅ Enhanced API key validation
    const openaiApiKey = process.env.OPENAI_API_KEY;
    console.log("🔑 OPENAI_API_KEY check:", {
      exists: !!openaiApiKey,
      length: openaiApiKey?.length,
      startsWith: openaiApiKey?.substring(0, 10) + "...",
    });

    if (!openaiApiKey) {
      console.error("❌ OPENAI_API_KEY is missing from environment variables");
      throw new Error(
        "OPENAI_API_KEY environment variable is required. Please check your .env.local file."
      );
    }

    if (openaiApiKey.length < 10) {
      console.error("❌ OPENAI_API_KEY appears to be invalid (too short)");
      throw new Error(
        "OPENAI_API_KEY appears to be invalid. Please check your API key."
      );
    }

    const chatBotDomain = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        User: {
          select: {
            id: true,
            clerkId: true,
          },
        },
        helpdesk: {
          select: {
            id: true,
            question: true,
            answered: true,
          },
        },
        chatBot: {
          select: {
            id: true,
            taskSummary: true,
            welcomeMessage: true,
          },
        },
        filterQuestions: {
          where: {
            answered: "",
          },
          select: {
            question: true,
          },
        },
      },
    });

    if (chatBotDomain) {
      console.log("✅ ChatBot domain found:", chatBotDomain.name);

      const extractEmail = extractEmailsFromString(message);
      console.log("📧 Extracted email:", extractEmail);

      // Use provided customer email if available, otherwise extract from message
      if (providedCustomerEmail) {
        customerEmail = providedCustomerEmail;
        console.log("📧 Customer email provided from form:", customerEmail);
      } else if (extractEmail) {
        customerEmail = extractEmail[0];
        console.log("📧 Customer email extracted from message:", customerEmail);
      }

      console.log("🔍 Current customer email:", customerEmail);

      if (customerEmail) {
        console.log(
          "✅ Customer email exists, proceeding with customer logic..."
        );
        const checkCustomer = await client.domain.findUnique({
          where: {
            id,
          },
          select: {
            User: {
              select: {
                clerkId: true,
              },
            },
            name: true,
            customer: {
              where: {
                email: customerEmail,
              },
              select: {
                id: true,
                email: true,
                questions: true,
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                    mailed: true,
                  },
                },
              },
            },
          },
        });

        console.log("🔍 Customer query result:", checkCustomer);
        console.log(
          "🔍 Customer array length:",
          checkCustomer?.customer?.length
        );

        if (checkCustomer && !checkCustomer.customer.length) {
          const newCustomer = await client.domain.update({
            where: {
              id,
            },
            data: {
              customer: {
                create: {
                  email: customerEmail,
                  questions: {
                    create: chatBotDomain.filterQuestions.map((question) => ({
                      question: question.question,
                      answered: "",
                    })),
                  },
                  chatRoom: {
                    create: {},
                  },
                },
              },
            },
            include: {
              customer: {
                include: {
                  chatRoom: true,
                },
              },
            },
          });
          if (newCustomer) {
            console.log("new customer made");
            const response = {
              role: "assistant",
              content: `Welcome aboard ${customerEmail.split("@")[0]}!
                    I'm glad to connect with you. Is there anything you need help with?`,
            };
            const newlyCreatedCustomer =
              newCustomer.customer[newCustomer.customer.length - 1];
            if (newlyCreatedCustomer?.chatRoom?.[0]?.id) {
              await onStoreConversations(
                newlyCreatedCustomer.chatRoom?.[0]?.id,
                response.content,
                "assistant"
              );
            }
            return { response };
          }
        }
        if (checkCustomer && checkCustomer.customer[0]?.chatRoom?.[0]?.live) {
          await onStoreConversations(
            checkCustomer?.customer[0].chatRoom[0].id,
            message,
            author
          );
          //WIP : Setup realtime mode
          // onRealTimeChat(
          //   checkCustomer.customer[0].chatRoom[0].id,
          //   message,
          //   "user",
          //   author
          // );
          if (!checkCustomer.customer[0]?.chatRoom?.[0]?.mailed) {
            if (checkCustomer && checkCustomer.User?.clerkId) {
              const clerk = await clerkClient();
              const user = await clerk.users.getUser(
                checkCustomer.User.clerkId
              );
              onMailer(user.emailAddresses[0].emailAddress);
            }

            // update mail status to prevent spamming
            const mailed = await client.chatRoom.update({
              where: {
                id: checkCustomer.customer[0]?.chatRoom?.[0]?.id,
              },
              data: {
                mailed: true,
              },
            });

            if (mailed) {
              return {
                live: true,
                chatRoom: checkCustomer.customer[0]?.chatRoom?.[0]?.id,
              };
            }
          }
          return {
            live: true,
            chatRoom: checkCustomer.customer[0]?.chatRoom?.[0]?.id,
          };
        }
        if (checkCustomer?.customer[0]?.chatRoom?.[0]?.id) {
          await onStoreConversations(
            checkCustomer.customer[0]?.chatRoom?.[0]?.id,
            message,
            author
          );
        }

        // ✅ NEW: Get uploaded file context for AI processing
        const fileContext = await getUploadedFileContext(id);

        // ✅ NEW: Analyze query complexity to choose appropriate model
        const queryComplexity = analyzeQueryComplexity(message);
        // ✅ FIXED: Reduced logging to prevent console spam
        if (process.env.NODE_ENV === "development") {
          console.log(`🧠 Query complexity: ${queryComplexity}`);
        }

        // OpenAI API call with enhanced context
        const taskSummary = chatBotDomain.chatBot?.taskSummary || "";
        const helpdeskInfo = chatBotDomain.helpdesk || [];

        const systemPrompt = `You are an expert Customer success engineer and sales enthusiast for ${
          chatBotDomain.name
        }.

${taskSummary ? `PLATFORM: ${taskSummary}` : ""}

${
  helpdeskInfo.length > 0
    ? `FAQ: ${helpdeskInfo
        .map((h) => `Q: ${h.question} A: ${h.answered}`)
        .join(" | ")}`
    : ""
}

${fileContext}

RULES:
- Ask questions from the list above and mark them with "(complete)" when done. 
- Always keep replies concise, human-like, and in normal conversational tone. 
- If the user asks about your origin (e.g., "which model are you" or "who trained you"), reply in layman terms: 
  👉 "I was created by WeezIQ.com to assist businesses with their customer support." 
- If anyone ask which model you use or similar questions. Simply tell them: "I'm not allowed to reveal which model I use. Let's focus on how I can help with your business needs instead!"
- If user says anything inappropriate, politely respond with: "This is beyond my scope (realtime)."
- Stay professional, empathetic, and helpful while guiding conversations toward solutions. 
- Adapt to the user's tone: if casual → reply casually, if formal → reply formally.
- Think logically like a human: interpret implied meaning, clarify doubts, and reason step-by-step when needed.
- IMPORTANT: Respond immediately and directly to user questions. Don't use any streaming or delays.
- If uploaded files are available, use their content to provide more accurate and informed responses.`;

        const conversationHistory = chat
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n");

        const fullPrompt = `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}\n\nAssistant:`;

        // ✅ NEW: Dynamic model selection based on query complexity
        const selectedModel =
          queryComplexity === "complex" ? GPT_4O : GPT_4O_MINI;
        // ✅ FIXED: Reduced logging to prevent console spam
        if (process.env.NODE_ENV === "development") {
          console.log(`🤖 Model: ${selectedModel} (${queryComplexity})`);
        }

        console.log("🔑 OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

        if (!process.env.OPENAI_API_KEY) {
          console.error("❌ OPENAI_API_KEY is missing!");
          throw new Error("OPENAI_API_KEY environment variable is required");
        }

        // Check AI credits for the domain owner
        const domainOwnerClerkId = checkCustomer?.User?.clerkId;
        if (!domainOwnerClerkId) {
          throw new Error("Domain owner not found");
        }

        // Get the domain owner's user ID from clerk ID
        const domainOwnerUser = await client.user.findUnique({
          where: { clerkId: domainOwnerClerkId },
          select: { id: true },
        });

        if (!domainOwnerUser) {
          throw new Error("Domain owner user record not found");
        }

        const creditCheck = await onCheckAiCredits(domainOwnerUser.id);
        // ✅ FIXED: Reduced logging to prevent console spam
        if (process.env.NODE_ENV === "development") {
          console.log("💳 Credits:", creditCheck);
        }

        // ✅ NEW: Fallback to GPT-4o-mini if GPT-4o fails or no credits
        let finalModel = selectedModel;
        if (selectedModel === GPT_4O && !creditCheck.shouldUsePro) {
          finalModel = GPT_4O_MINI;
          // ✅ FIXED: Reduced logging to prevent console spam
          if (process.env.NODE_ENV === "development") {
            console.log("💳 Falling back to gpt-4o-mini due to credit limits");
          }
        }

        // ✅ FIXED: Reduced logging to prevent console spam
        if (process.env.NODE_ENV === "development") {
          console.log(`🤖 Using ${finalModel}`);
        }

        const result = await openai.chat.completions
          .create({
            model: finalModel,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              ...chat,
              {
                role: "user",
                content: message,
              },
            ],
          })
          .catch(async (error) => {
            // ✅ NEW: Fallback mechanism if GPT-4o fails
            if (finalModel === GPT_4O) {
              // ✅ FIXED: Reduced logging to prevent console spam
              if (process.env.NODE_ENV === "development") {
                console.log("⚠️ GPT-4o failed, falling back to gpt-4o-mini");
              }
              return await openai.chat.completions.create({
                model: GPT_4O_MINI,
                messages: [
                  {
                    role: "system",
                    content: systemPrompt,
                  },
                  ...chat,
                  {
                    role: "user",
                    content: message,
                  },
                ],
              });
            }
            throw error;
          });
        console.log(
          "✅ OpenAI response received:",
          result.choices[0].message.content
        );

        // ✅ Add null checks for OpenAI response
        if (
          !result ||
          !result.choices ||
          !result.choices[0] ||
          !result.choices[0].message
        ) {
          console.error("❌ Invalid OpenAI response:", result);
          throw new Error("Invalid response from OpenAI API");
        }

        const responseText = result.choices[0].message.content;
        if (!responseText) {
          console.error("❌ Empty response text from OpenAI");
          throw new Error("Empty response from OpenAI API");
        }

        console.log("✅ OpenAI response text:", responseText);

        // Estimate token usage (rough estimation: 4 characters per token)
        const estimatedTokens = Math.ceil(
          (fullPrompt.length + responseText.length) / 4
        );
        console.log(`📊 Estimated tokens used: ${estimatedTokens}`);

        // Store the AI response message first to get the message ID
        let chatMessageId: string | null = null;
        if (checkCustomer?.customer[0]?.chatRoom?.[0]?.id) {
          chatMessageId = await onStoreConversations(
            checkCustomer.customer[0].chatRoom[0].id,
            responseText,
            "assistant"
          );
          console.log(
            "✅ AI response stored in database with ID:",
            chatMessageId
          );
        }

        // ✅ NEW: Track AI usage with proper model differentiation
        if (chatMessageId) {
          // ✅ FIXED: Reduced logging to prevent console spam
          if (process.env.NODE_ENV === "development") {
            console.log(`💳 Tracking usage for ${finalModel}`);
          }

          // Create AI usage record with actual model used
          await client.aiUsage.create({
            data: {
              chatMessageId,
              modelUsed: finalModel,
              tokensUsed: estimatedTokens,
              creditsUsed:
                finalModel === GPT_4O ? Math.ceil(estimatedTokens / 1000) : 0, // Only consume credits for GPT-4o
              domainId: id,
              userId: domainOwnerUser.id,
            },
          });

          // Only consume billing credits for GPT-4o (premium model)
          if (finalModel === GPT_4O) {
            await onConsumeAiCredit(
              domainOwnerUser.id,
              estimatedTokens,
              id, // domainId
              chatMessageId
            );
          }
        }

        const chatCompletion = {
          choices: [
            {
              message: {
                content: responseText,
              },
            },
          ],
        };

        // ✅ Add null checks for chatCompletion structure
        if (
          !chatCompletion ||
          !chatCompletion.choices ||
          !chatCompletion.choices[0] ||
          !chatCompletion.choices[0].message
        ) {
          console.error("❌ Invalid chatCompletion structure:", chatCompletion);
          throw new Error("Invalid chat completion structure");
        }

        const messageContent = chatCompletion.choices[0].message.content;
        if (!messageContent) {
          console.error("❌ Empty message content in chatCompletion");
          throw new Error("Empty message content from AI");
        }

        console.log("✅ Message content:", messageContent);

        // ✅ FIXED: Always return response immediately, handle special cases after
        const response = {
          role: "assistant",
          content: messageContent,
        };

        if (messageContent.includes("(realtime)")) {
          const realtime = await client.chatRoom.update({
            where: {
              id: checkCustomer?.customer[0].chatRoom[0].id,
            },
            data: {
              live: true,
            },
          });

          if (realtime) {
            // ✅ AI response already stored above, no need to store again
            console.log("✅ Realtime mode activated, response already stored");

            return {
              response: {
                ...response,
                content: messageContent.replace("(realtime)", ""),
              },
            };
          }
        }
        // ✅ FIXED: Handle completion logic but still return standard response
        if (
          chat &&
          chat.length > 0 &&
          chat[chat.length - 1] &&
          chat[chat.length - 1].content &&
          chat[chat.length - 1].content.includes("(complete)")
        ) {
          const firstUnansweredQuestion =
            await client.customerResponses.findFirst({
              where: {
                customerId: checkCustomer?.customer[0].id,
                answered: "",
              },
              select: {
                id: true,
              },
              orderBy: {
                question: "asc",
              },
            });
          if (firstUnansweredQuestion) {
            await client.customerResponses.update({
              where: {
                id: firstUnansweredQuestion.id,
              },
              data: {
                answered: message,
              },
            });
          }

          // Check for generated links
          const generatedLink = extractURLfromString(messageContent as string);
          if (generatedLink) {
            const link = generatedLink[0];
            return {
              response: {
                ...response,
                content: "Great! you can follow the link to proceed",
                link: link.slice(0, -1),
              },
            };
          }
        }

        // ✅ FIXED: Standard response pathway for all cases
        return { response };
      }

      console.log(
        "🚶 No customer email found, proceeding with general chatbot response..."
      );

      // ✅ NEW: Get uploaded file context for AI processing (no customer path)
      const fileContext = await getUploadedFileContext(id);

      // ✅ NEW: Analyze query complexity for no-customer path
      const queryComplexity = analyzeQueryComplexity(message);
      // ✅ FIXED: Reduced logging to prevent console spam
      if (process.env.NODE_ENV === "development") {
        console.log(`🧠 Query complexity (no customer): ${queryComplexity}`);
      }

      const taskSummary = chatBotDomain.chatBot?.taskSummary || "";
      const helpdeskInfo = chatBotDomain.helpdesk || [];

      const systemPrompt = `You are a helpful AI assistant for ${
        chatBotDomain.name
      }.

${taskSummary ? `PLATFORM: ${taskSummary}` : ""}

${
  helpdeskInfo.length > 0
    ? `FAQ: ${helpdeskInfo
        .map((h) => `Q: ${h.question} A: ${h.answered}`)
        .join(" | ")}`
    : ""
}

${fileContext}

${
  customerEmail
    ? `CUSTOMER EMAIL: ${customerEmail} (already provided)`
    : `NEW CUSTOMER: Welcome them warmly and help with their needs`
}

RULES:
- Be concise and human-like. Use normal text size.
- Stay professional and helpful.
- Understand customer needs before responding.
- Provide relevant information based on platform description.
- If uploaded files are available, use their content to provide more accurate and informed responses.`;

      const conversationHistory = chat
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const fullPrompt = `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}\n\nAssistant:`;

      // ✅ NEW: Dynamic model selection for no-customer path
      const selectedModel =
        queryComplexity === "complex" ? GPT_4O : GPT_4O_MINI;
      // ✅ FIXED: Reduced logging to prevent console spam
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🤖 Model (no customer): ${selectedModel} (${queryComplexity})`
        );
      }

      console.log("🔑 OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

      if (!process.env.OPENAI_API_KEY) {
        console.error("❌ OPENAI_API_KEY is missing!");
        throw new Error("OPENAI_API_KEY environment variable is required");
      }

      // Check AI credits for the domain owner (no customer path)
      if (!chatBotDomain?.User?.id) {
        throw new Error("Domain owner not found in no-customer path");
      }

      const creditCheck = await onCheckAiCredits(chatBotDomain.User.id);
      // ✅ FIXED: Reduced logging to prevent console spam
      if (process.env.NODE_ENV === "development") {
        console.log("💳 Credits (no customer):", creditCheck);
      }

      // ✅ NEW: Fallback logic for no-customer path
      let finalModel = selectedModel;
      if (selectedModel === GPT_4O && !creditCheck.shouldUsePro) {
        finalModel = GPT_4O_MINI;
        // ✅ FIXED: Reduced logging to prevent console spam
        if (process.env.NODE_ENV === "development") {
          console.log("💳 Falling back to gpt-4o-mini (no customer)");
        }
      }

      // ✅ FIXED: Reduced logging to prevent console spam
      if (process.env.NODE_ENV === "development") {
        console.log(`🤖 Using ${finalModel} (no customer)`);
      }

      const result = await openai.chat.completions
        .create({
          model: finalModel,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...chat,
            {
              role: "user",
              content: message,
            },
          ],
        })
        .catch(async (error) => {
          // ✅ NEW: Fallback mechanism for no-customer path
          if (finalModel === GPT_4O) {
            // ✅ FIXED: Reduced logging to prevent console spam
            if (process.env.NODE_ENV === "development") {
              console.log(
                "⚠️ GPT-4o failed, falling back to gpt-4o-mini (no customer)"
              );
            }
            return await openai.chat.completions.create({
              model: GPT_4O_MINI,
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                ...chat,
                {
                  role: "user",
                  content: message,
                },
              ],
            });
          }
          throw error;
        });
      console.log(
        "✅ OpenAI response received:",
        result.choices[0].message.content
      );

      // ✅ Add null checks for OpenAI response
      if (
        !result ||
        !result.choices ||
        !result.choices[0] ||
        !result.choices[0].message
      ) {
        console.error("❌ Invalid OpenAI response:", result);
        throw new Error("Invalid response from OpenAI API");
      }

      const responseText = result.choices[0].message.content;
      if (!responseText) {
        console.error("❌ Empty response text from OpenAI");
        throw new Error("Empty response from OpenAI API");
      }

      console.log("✅ OpenAI response text:", responseText);

      // Estimate token usage (rough estimation: 4 characters per token)
      const estimatedTokens = Math.ceil(
        (fullPrompt.length + responseText.length) / 4
      );
      console.log(`📊 Estimated tokens used (no customer): ${estimatedTokens}`);

      // ✅ NEW: Track AI usage for no-customer path with proper model differentiation
      // ✅ FIXED: Reduced logging to prevent console spam
      if (process.env.NODE_ENV === "development") {
        console.log(`💳 Tracking usage for ${finalModel} (no customer)`);
      }

      // Create AI usage record
      await client.aiUsage.create({
        data: {
          chatMessageId: "temp-no-customer", // temporary placeholder
          modelUsed: finalModel,
          tokensUsed: estimatedTokens,
          creditsUsed:
            finalModel === GPT_4O ? Math.ceil(estimatedTokens / 1000) : 0,
          domainId: id,
          userId: chatBotDomain.User.id,
        },
      });

      // Only consume billing credits for GPT-4o (no customer path)
      if (finalModel === GPT_4O) {
        await onConsumeAiCredit(
          chatBotDomain.User.id,
          estimatedTokens,
          id, // domainId
          "temp-no-customer" // temporary placeholder for chat message ID
        );
      }

      const chatCompletion = {
        choices: [
          {
            message: {
              content: responseText,
            },
          },
        ],
      };

      if (
        chatCompletion &&
        chatCompletion.choices &&
        chatCompletion.choices[0]
      ) {
        const response = {
          role: "assistant",
          content: chatCompletion.choices[0].message.content,
        };
        console.log("✅ Returning AI response:", response);
        return { response };
      } else {
        console.error("❌ Invalid chatCompletion structure:", chatCompletion);
        throw new Error("Invalid chat completion structure");
      }
    }
  } catch (error) {
    console.error("❌ AI ChatBot Assistant Error:", error);

    // ✅ Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        console.error("❌ OpenAI API key is missing or invalid");
        return { error: "AI Error: OpenAI API key is missing or invalid" };
      } else if (error.message.includes("Invalid response")) {
        console.error("❌ Invalid response from OpenAI API");
        return { error: "AI Error: Invalid response from AI service" };
      } else if (error.message.includes("Empty response")) {
        console.error("❌ Empty response from OpenAI API");
        return { error: "AI Error: Empty response from AI service" };
      } else {
        console.error("❌ Unexpected error:", error.message);
        return { error: `AI Error: ${error.message}` };
      }
    } else {
      console.error("❌ Unknown error:", error);
      return { error: "AI Error: An unexpected error occurred" };
    }
  }
};
