"use server";

import { client } from "@/lib/prisma";
import { RedirectToSignIn } from "@clerk/nextjs";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { onGetAllAccountDomains } from "../auth";
import { getPlanLimits } from "@/lib/plans";
import OpenAI from "openai";

export const onIntegrateDomain = async (domain: string, icon: string) => {
  const user = await currentUser();
  if (!user) return;
  try {
    const subscription = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        _count: {
          select: {
            domains: true,
          },
        },
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!subscription) {
      return {
        status: 400,
        message: "User subscription not found",
      };
    }

    const domainExist = await client.user.findFirst({
      where: {
        clerkId: user.id,
        domains: {
          some: {
            name: domain,
          },
        },
      },
    });

    if (domainExist) {
      return {
        status: 400,
        message: "Domain already exists",
      };
    }

    // Get plan limits
    const planLimits = getPlanLimits(
      subscription.subscription?.plan || "STARTER"
    );
    const currentDomainCount = subscription._count.domains;
    const maxDomains = planLimits.domainLimit;

    // Check if user can add more domains
    if (currentDomainCount >= maxDomains) {
      return {
        status: 400,
        message: `You've reached the maximum number of domains (${maxDomains}) for your ${planLimits.name}. Upgrade your plan to add more domains.`,
      };
    }

    // Add the new domain
    const newDomain = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        domains: {
          create: {
            name: domain,
            icon,
            chatBot: {
              create: {
                welcomeMessage: "Hey there, have a question? Text us here",
              },
            },
          },
        },
      },
    });

    if (newDomain) {
      return { status: 200, message: "Domain successfully added" };
    }

    return {
      status: 400,
      message: "Failed to add domain",
    };
  } catch (error) {
    console.log("Error adding domain:", error);
    return {
      status: 400,
      message: "An error occurred while adding the domain",
    };
  }
};
export const onCompleteUserRegistration = async (
  fullname: string,
  clerkId: string
) => {
  try {
    const registered = await client.user.create({
      data: {
        fullname,
        clerkId,
        role: "admin", // All users are admins
        subscription: {
          create: {
            plan: "STARTER", // Start with trial plan
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          },
        },
      },
      select: {
        fullname: true,
        id: true,
        role: true,
      },
    });
    if (registered) {
      return { status: 200, user: registered };
    }
  } catch (error) {
    return { status: 400, error };
  }
};

export const onGetSubscriptionPlan = async () => {
  const user = await currentUser();
  if (!user) return;
  try {
    const plan = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
            credits: true,
            aiCreditsUsed: true,
            aiCreditsLimit: true,
            emailCreditsUsed: true,
            emailCreditsLimit: true,
            subscriptionStatus: true,
            trialStartDate: true,
            trialEndDate: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
          },
        },
        _count: {
          select: {
            domains: true,
          },
        },
      },
    });
    if (plan) {
      return {
        status: 200,
        plan: plan.subscription?.plan,
        credits: plan.subscription?.credits,
        aiCreditsUsed: plan.subscription?.aiCreditsUsed || 0,
        aiCreditsLimit: plan.subscription?.aiCreditsLimit || 50,
        emailCreditsUsed: plan.subscription?.emailCreditsUsed || 0,
        emailCreditsLimit: plan.subscription?.emailCreditsLimit || 50,
        subscriptionStatus: plan.subscription?.subscriptionStatus,
        trialStartDate: plan.subscription?.trialStartDate,
        trialEndDate: plan.subscription?.trialEndDate,
        currentPeriodStart: plan.subscription?.currentPeriodStart,
        currentPeriodEnd: plan.subscription?.currentPeriodEnd,
        domains: plan._count.domains,
      };
    }
  } catch (error) {
    return { status: 400, error };
  }
};

export const onLoginUser = async () => {
  const user = await currentUser();
  if (!user) RedirectToSignIn({});
  else {
    try {
      const authenticated = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          fullname: true,
          id: true,
          role: true,
        },
      });
      if (authenticated) {
        const domains = await onGetAllAccountDomains();
        return { status: 200, user: authenticated, domain: domains?.domains };
      }
    } catch (error) {
      return { status: 400, error };
    }
  }
};

export const onUpdatePassword = async (password: string) => {
  try {
    const user = await currentUser();
    if (!user) return null;
    const clerk = await clerkClient();
    const update = await clerk.users.updateUser(user.id, { password });
    if (update) {
      return { status: 200, message: "Password updated" };
    }
  } catch (error) {
    console.log(error);
  }
};

// Credit Management Functions
export const onCheckAiCredits = async (userId: string) => {
  try {
    const subscription = await client.billings.findUnique({
      where: { userId },
      select: {
        plan: true,
        aiCreditsUsed: true,
        aiCreditsLimit: true,
        subscriptionStatus: true,
      },
    });

    if (!subscription) return { hasCredits: false, shouldUsePro: false };

    const { plan, aiCreditsUsed, aiCreditsLimit } = subscription;

    // For STARTER plan (trial), use credits
    if (plan === "STARTER") {
      return {
        hasCredits: aiCreditsUsed < aiCreditsLimit,
        shouldUsePro: aiCreditsUsed < aiCreditsLimit,
        remainingCredits: Math.max(0, aiCreditsLimit - aiCreditsUsed),
      };
    }

    // For GROWTH and PRO plans, check monthly limits
    if (plan === "GROWTH" || plan === "PRO") {
      const hasProCredits = aiCreditsUsed < aiCreditsLimit;
      return {
        hasCredits: true, // Always has unlimited Flash-Lite after Pro credits
        shouldUsePro: hasProCredits,
        remainingCredits: hasProCredits ? aiCreditsLimit - aiCreditsUsed : 0,
        unlimitedFlash: !hasProCredits,
      };
    }

    return { hasCredits: true, shouldUsePro: false };
  } catch (error) {
    console.error("Error checking AI credits:", error);
    return { hasCredits: false, shouldUsePro: false };
  }
};

export const onConsumeAiCredit = async (
  userId: string,
  tokensUsed: number,
  domainId: string,
  chatMessageId: string
) => {
  try {
    const creditsToConsume = Math.ceil(tokensUsed / 1000); // 1 credit = 1000 tokens

    const result = await client.$transaction(async (tx) => {
      // Update billing credits
      const updatedBilling = await tx.billings.update({
        where: { userId },
        data: {
          aiCreditsUsed: {
            increment: creditsToConsume,
          },
        },
        select: {
          plan: true,
          aiCreditsUsed: true,
          aiCreditsLimit: true,
        },
      });

      // Record AI usage
      await tx.aiUsage.create({
        data: {
          chatMessageId,
          modelUsed: "gemini-pro",
          tokensUsed,
          creditsUsed: creditsToConsume,
          domainId,
          userId,
        },
      });

      return updatedBilling;
    });

    return {
      success: true,
      creditsConsumed: creditsToConsume,
      remainingCredits: Math.max(
        0,
        result.aiCreditsLimit - result.aiCreditsUsed
      ),
    };
  } catch (error) {
    console.error("Error consuming AI credit:", error);
    return { success: false, error: "Failed to consume credits" };
  }
};

export const onRecordFlashUsage = async (
  userId: string,
  tokensUsed: number,
  domainId: string,
  chatMessageId: string
) => {
  try {
    await client.aiUsage.create({
      data: {
        chatMessageId,
        modelUsed: "gemini-flash-lite",
        tokensUsed,
        creditsUsed: 0, // No credits used for Flash model
        domainId,
        userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error recording Flash usage:", error);
    return { success: false, error: "Failed to record usage" };
  }
};

export const onResetMonthlyCredits = async (userId: string) => {
  try {
    const subscription = await client.billings.findUnique({
      where: { userId },
      select: { plan: true },
    });

    if (!subscription)
      return { success: false, error: "No subscription found" };

    let aiCreditsLimit = 50; // Default for STARTER
    let emailCreditsLimit = 50; // Default for STARTER

    if (subscription.plan === "GROWTH") {
      aiCreditsLimit = 100;
      emailCreditsLimit = 200;
    } else if (subscription.plan === "PRO") {
      aiCreditsLimit = 500;
      emailCreditsLimit = 1000;
    }

    await client.billings.update({
      where: { userId },
      data: {
        aiCreditsUsed: 0,
        emailCreditsUsed: 0,
        aiCreditsLimit,
        emailCreditsLimit,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting monthly credits:", error);
    return { success: false, error: "Failed to reset credits" };
  }
};

export const onGetCurrentDomainInfo = async (domain: string) => {
  const user = await currentUser();
  if (!user) return;
  try {
    const userDomain = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
        domains: {
          where: {
            name: {
              contains: domain,
            },
          },
          select: {
            id: true,
            name: true,
            icon: true,
            userId: true,
            chatBot: {
              select: {
                id: true,
                welcomeMessage: true,
                icon: true,
              },
            },
          },
        },
      },
    });
    if (userDomain) {
      return userDomain;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
};

export const onUpdateDomain = async (id: string, name: string) => {
  try {
    const domainExist = await client.domain.findFirst({
      where: {
        name: {
          contains: name,
        },
      },
    });
    if (!domainExist) {
      const domain = await client.domain.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });
      if (domain) {
        return {
          status: 200,
          message: "Domain Updated",
        };
      }
      return {
        status: 400,
        message: "Oops something went wrong",
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export const onChatBotImageUpdate = async (id: string, icon: string) => {
  const user = await currentUser();
  if (!user) return;

  try {
    const domain = await client.domain.update({
      where: {
        id,
      },
      data: {
        chatBot: {
          update: {
            data: {
              icon,
            },
          },
        },
      },
    });

    if (domain) {
      return {
        status: 400,
        message: "Domain updated",
      };
    }
    return {
      status: 400,
      message: "Oops something, went wrong",
    };
  } catch (error) {
    console.log(error);
  }
};

export const onUpdateWelcomeMessage = async (
  message: string,
  domainId: string
) => {
  try {
    const update = await client.domain.update({
      where: {
        id: domainId,
      },
      data: {
        chatBot: {
          update: {
            data: {
              welcomeMessage: message,
            },
          },
        },
      },
    });
    if (update) {
      return { status: 200, message: "Welcome message updated" };
    }
  } catch (error) {
    console.log(error);
  }
};

export const onDeleteUserDomain = async (id: string) => {
  const user = await currentUser();
  if (!user) return;
  try {
    const validUser = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
      },
    });
    if (validUser) {
      const deletedDomain = await client.domain.delete({
        where: {
          userId: validUser.id,
          id,
        },
        select: {
          name: true,
        },
      });
      if (deletedDomain) {
        return {
          status: 200,
          message: `${deletedDomain.name} was deleted successfully`,
        };
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const onCreateHelpDeskQuestion = async (
  id: string,
  question: string,
  answer: string
) => {
  try {
    const helpDeskQuestion = await client.domain.update({
      where: {
        id,
      },
      data: {
        helpdesk: {
          create: {
            question,
            answered: answer,
          },
        },
      },
      include: {
        helpdesk: {
          select: {
            id: true,
            question: true,
            answered: true,
          },
        },
      },
    });
    if (helpDeskQuestion) {
      return {
        status: 200,
        message: "New help desk question added",
        question: helpDeskQuestion.helpdesk,
      };
    }
    return {
      status: 400,
      message: "Oops! Something went wrong",
    };
  } catch (error) {
    console.log(error);
  }
};

export const onGetAllHelpDeskQuestions = async (id: string) => {
  try {
    const questions = await client.helpDesk.findMany({
      where: {
        domainId: id,
      },
      select: {
        question: true,
        answered: true,
        id: true,
      },
    });
    return {
      status: 200,
      message: "New help desk question added",
      questions: questions,
    };
  } catch (error) {
    console.log(error);
  }
};

export const onDeleteHelpDeskQuestion = async (questionId: string) => {
  try {
    const deletedQuestion = await client.helpDesk.delete({
      where: {
        id: questionId,
      },
    });

    if (deletedQuestion) {
      return {
        status: 200,
        message: "Help desk question deleted successfully",
      };
    }
    return {
      status: 400,
      message: "Failed to delete help desk question",
    };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: "Error deleting help desk question",
    };
  }
};

export const onUpdateHelpDeskQuestion = async (
  questionId: string,
  question: string,
  answer: string
) => {
  try {
    const updatedQuestion = await client.helpDesk.update({
      where: {
        id: questionId,
      },
      data: {
        question,
        answered: answer,
      },
    });

    if (updatedQuestion) {
      return {
        status: 200,
        message: "Help desk question updated successfully",
        question: updatedQuestion,
      };
    }
    return {
      status: 400,
      message: "Failed to update help desk question",
    };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: "Error updating help desk question",
    };
  }
};

export const onCreatedFilterQuestions = async (
  id: string,
  question: string,
  answered: string
) => {
  try {
    const filterQuestion = await client.domain.update({
      where: {
        id,
      },
      data: {
        filterQuestions: {
          create: {
            question,
            answered,
          },
        },
      },
      include: {
        filterQuestions: {
          select: {
            id: true,
            question: true,
            answered: true,
          },
        },
      },
    });
    if (filterQuestion) {
      return {
        status: 200,
        message: "Filter question added",
        question: filterQuestion.filterQuestions,
      };
    }
    return {
      status: 400,
      message: "Oops something went wrong",
    };
  } catch (error) {
    console.log(error);
  }
};

export const onGetAllFilterQuestions = async (id: string) => {
  console.log(id);
  try {
    const questions = await client.filterQuestions.findMany({
      where: {
        domainId: id,
      },
      select: {
        question: true,
        answered: true,
        id: true,
      },
      orderBy: {
        question: "asc",
      },
    });

    return {
      status: 200,
      message: "",
      questions: questions,
    };
  } catch (error) {
    console.log(error);
  }
};

// New function for static generation - fetches all domains
export const getAllDomainsForStaticGeneration = async () => {
  try {
    // Fetch all domains from the database for static generation
    const allDomains = await client.domain.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        User: {
          select: {
            clerkId: true,
          },
        },
      },
    });

    return allDomains;
  } catch (error) {
    console.error("Error fetching domains for static generation:", error);
    return [];
  }
};

// ✅ NEW: Task Summary Functions
export const onUpdateTaskSummary = async (
  domainId: string,
  taskSummary: string
) => {
  try {
    const updatedChatBot = await client.chatBot.update({
      where: {
        domainID: domainId,
      },
      data: {
        taskSummary: taskSummary,
      },
    });

    if (updatedChatBot) {
      return {
        success: true,
        message: "Task summary updated successfully",
      };
    }

    return {
      success: false,
      error: "Failed to update task summary",
    };
  } catch (error) {
    console.error("Error updating task summary:", error);
    return {
      success: false,
      error: "Failed to update task summary",
    };
  }
};

export const onGetTaskSummary = async (domainId: string) => {
  try {
    const chatBot = await client.chatBot.findUnique({
      where: {
        domainID: domainId,
      },
      select: {
        taskSummary: true,
      },
    });

    return chatBot;
  } catch (error) {
    console.error("Error getting task summary:", error);
    return null;
  }
};

// ✅ NEW: Get AI usage statistics for dashboard
export const onGetAiUsageStats = async (userId: string) => {
  try {
    // Get total tokens used across all domains
    const totalUsage = await client.aiUsage.aggregate({
      where: { userId },
      _sum: {
        tokensUsed: true,
        creditsUsed: true,
      },
      _count: {
        id: true,
      },
    });

    // Get usage by model
    const usageByModel = await client.aiUsage.groupBy({
      by: ["modelUsed"],
      where: { userId },
      _sum: {
        tokensUsed: true,
        creditsUsed: true,
      },
      _count: {
        id: true,
      },
    });

    // Get recent usage (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsage = await client.aiUsage.aggregate({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        tokensUsed: true,
        creditsUsed: true,
      },
      _count: {
        id: true,
      },
    });

    // Get usage by domain
    const usageByDomain = await client.aiUsage.groupBy({
      by: ["domainId"],
      where: { userId },
      _sum: {
        tokensUsed: true,
        creditsUsed: true,
      },
      _count: {
        id: true,
      },
    });

    // Get domain names for the usage by domain
    const domainIds = usageByDomain.map((usage) => usage.domainId);
    const domains = await client.domain.findMany({
      where: { id: { in: domainIds } },
      select: { id: true, name: true },
    });

    const usageByDomainWithNames = usageByDomain.map((usage) => {
      const domain = domains.find((d) => d.id === usage.domainId);
      return {
        domainId: usage.domainId,
        domainName: domain?.name || "Unknown Domain",
        tokensUsed: usage._sum.tokensUsed || 0,
        creditsUsed: usage._sum.creditsUsed || 0,
        messageCount: usage._count.id,
      };
    });

    return {
      success: true,
      stats: {
        total: {
          tokensUsed: totalUsage._sum.tokensUsed || 0,
          creditsUsed: totalUsage._sum.creditsUsed || 0,
          messageCount: totalUsage._count.id,
        },
        recent: {
          tokensUsed: recentUsage._sum.tokensUsed || 0,
          creditsUsed: recentUsage._sum.creditsUsed || 0,
          messageCount: recentUsage._count.id,
        },
        byModel: usageByModel.map((model) => ({
          model: model.modelUsed,
          tokensUsed: model._sum.tokensUsed || 0,
          creditsUsed: model._sum.creditsUsed || 0,
          messageCount: model._count.id,
        })),
        byDomain: usageByDomainWithNames,
      },
    };
  } catch (error) {
    console.error("Error fetching AI usage stats:", error);
    return {
      success: false,
      error: "Failed to fetch AI usage statistics",
      stats: {
        total: { tokensUsed: 0, creditsUsed: 0, messageCount: 0 },
        recent: { tokensUsed: 0, creditsUsed: 0, messageCount: 0 },
        byModel: [],
        byDomain: [],
      },
    };
  }
};

// ✅ NEW: Generate task summary using AI (Unlimited)
export const onGenerateTaskSummary = async (
  inputText: string,
  domainId: string
) => {
  try {
    // Get domain info for user tracking
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: {
        User: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!domain?.User) {
      return { success: false, error: "Domain or user not found" };
    }

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `You are an expert business analyst and content writer. Your task is to create a well-structured, professional task summary for a business platform based on the provided input.

REQUIREMENTS:
- Create a clear, concise description of what the platform does
- Use professional, business-friendly language
- Structure the content with proper HTML formatting
- Focus on the value proposition and key features
- Keep it between 100-300 words
- Use bullet points and sections for better readability
- Make it engaging and informative for potential customers

FORMAT:
- Use <h3> for section headers
- Use <ul> and <li> for bullet points
- Use <p> for paragraphs
- Use <strong> for emphasis on key terms
- Keep the HTML clean and semantic
- IMPORTANT: Return ONLY the HTML content, NO markdown code blocks, NO \`\`\`html or \`\`\` tags

INPUT TEXT: "${inputText}"

Generate a professional task summary that explains what this platform does and how it helps businesses. Return the content as clean HTML without any markdown formatting.`;

    const result = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Please generate a well-structured task summary for this business: ${inputText}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    if (!result?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from AI service");
    }

    const generatedSummary = result.choices[0].message.content;

    // ✅ UNLIMITED: No credit consumption for task summary generation
    // This feature is available to all users without restrictions

    return {
      success: true,
      taskSummary: generatedSummary,
    };
  } catch (error) {
    console.error("Error generating task summary:", error);

    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        return {
          success: false,
          error: "AI service is not configured. Please contact support.",
        };
      }
    }

    return {
      success: false,
      error: "Failed to generate task summary. Please try again.",
    };
  }
};

// ✅ NEW: File Upload Functions
export const onUploadFile = async (
  domainId: string,
  file: File,
  filePath: string
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user from database
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      include: { subscription: true },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Validate file type
    const allowedTypes = [".txt", ".json"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedTypes.includes(fileExtension)) {
      return {
        success: false,
        error: "Only .txt and .json files are allowed",
      };
    }

    // Validate file size (2MB limit per file)
    const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxFileSize) {
      return {
        success: false,
        error: "File size must not exceed 2MB",
      };
    }

    // Get current plan limits
    const plan = dbUser.subscription?.plan || "STARTER";
    const planLimits = {
      STARTER: 5 * 1024 * 1024, // 5MB
      GROWTH: 10 * 1024 * 1024, // 10MB
      PRO: 25 * 1024 * 1024, // 25MB
    };

    const maxTotalSize =
      planLimits[plan as keyof typeof planLimits] || planLimits.STARTER;

    // Calculate current total upload size for this domain
    const existingFiles = await client.fileUpload.findMany({
      where: { domainId },
      select: { fileSize: true },
    });

    const currentTotalSize = existingFiles.reduce(
      (sum, file) => sum + file.fileSize,
      0
    );
    const newTotalSize = currentTotalSize + file.size;

    if (newTotalSize > maxTotalSize) {
      return {
        success: false,
        error: `Total upload size would exceed your plan limit (${Math.round(
          maxTotalSize / (1024 * 1024)
        )}MB). Please upgrade your plan or remove some files.`,
      };
    }

    // Create file upload record
    const fileUpload = await client.fileUpload.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: fileExtension,
        filePath: filePath,
        uploadStatus: "PENDING",
        userId: dbUser.id,
        domainId: domainId,
      },
    });

    return { success: true, fileUpload };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error: "Failed to upload file" };
  }
};

export const onGetDomainFiles = async (domainId: string) => {
  try {
    const files = await client.fileUpload.findMany({
      where: { domainId },
      orderBy: { createdAt: "desc" },
    });

    return files;
  } catch (error) {
    console.error("Error getting domain files:", error);
    return [];
  }
};

export const onDeleteFile = async (fileId: string) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user from database
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Check if file exists and belongs to user
    const file = await client.fileUpload.findFirst({
      where: {
        id: fileId,
        userId: dbUser.id,
      },
    });

    if (!file) {
      return { success: false, error: "File not found or access denied" };
    }

    // Delete file record (cascade will handle file cleanup)
    await client.fileUpload.delete({
      where: { id: fileId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, error: "Failed to delete file" };
  }
};

export const onGetUploadLimits = async (domainId: string) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user from database
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      include: { subscription: true },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const plan = dbUser.subscription?.plan || "STARTER";
    const planLimits = {
      STARTER: 5 * 1024 * 1024, // 5MB
      GROWTH: 10 * 1024 * 1024, // 10MB
      PRO: 25 * 1024 * 1024, // 25MB
    };

    const maxTotalSize =
      planLimits[plan as keyof typeof planLimits] || planLimits.STARTER;

    // Calculate current usage
    const existingFiles = await client.fileUpload.findMany({
      where: { domainId },
      select: { fileSize: true },
    });

    const currentTotalSize = existingFiles.reduce(
      (sum, file) => sum + file.fileSize,
      0
    );
    const usedPercentage = (currentTotalSize / maxTotalSize) * 100;

    return {
      success: true,
      plan,
      maxTotalSize,
      currentTotalSize,
      usedPercentage,
      remainingSize: maxTotalSize - currentTotalSize,
    };
  } catch (error) {
    console.error("Error getting upload limits:", error);
    return { success: false, error: "Failed to get upload limits" };
  }
};
