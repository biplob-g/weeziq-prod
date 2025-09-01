import { NextRequest, NextResponse } from "next/server";
import { client as prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Domain ID is required" },
        { status: 400 }
      );
    }

    // Fetch domain with all related data
    const domain = await prisma.domain.findUnique({
      where: { id },
      include: {
        chatBot: true,
        helpdesk: true,
        filterQuestions: true,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Format the response for the AI handler
    const domainData = {
      id: domain.id,
      name: domain.name,
      icon: domain.icon,
      taskSummary: domain.chatBot?.taskSummary || null,
      helpdesk: domain.helpdesk.map((h: any) => ({
        id: h.id,
        question: h.question,
        answered: h.answered,
        domainId: h.domainId,
      })),
      filterQuestions: domain.filterQuestions.map((q: any) => ({
        id: q.id,
        question: q.question,
        answered: q.answered,
        domainId: q.domainId,
      })),
      chatbot: domain.chatBot
        ? {
            id: domain.chatBot.id,
            welcomeMessage: domain.chatBot.welcomeMessage,
            icon: domain.chatBot.icon,
            background: domain.chatBot.background,
            textColor: domain.chatBot.textColor,
            helpdesk: domain.chatBot.helpdesk || false,
            taskSummary: domain.chatBot.taskSummary,
          }
        : null,
    };

    return NextResponse.json(domainData);
  } catch (error) {
    console.error("Error fetching domain:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
