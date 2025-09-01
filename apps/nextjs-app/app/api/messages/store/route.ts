import { NextRequest, NextResponse } from "next/server";
import { client as prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatRoomId, message, role, aiUsage } = body;

    if (!chatRoomId || !message || !role) {
      return NextResponse.json(
        { error: "Missing required fields: chatRoomId, message, role" },
        { status: 400 }
      );
    }

    // Store the message in the database
    const chatMessage = await prisma.chatMessage.create({
      data: {
        message,
        role: role === "assistant" ? "OWNER" : "CUSTOMER",
        chatRoomId,
        seen: false,
      },
    });

    // If this is an AI response, track AI usage
    if (role === "assistant" && aiUsage) {
      await prisma.aiUsage.create({
        data: {
          chatMessageId: chatMessage.id,
          model: aiUsage.model || "gpt-4o-mini",
          tokensUsed: aiUsage.tokensUsed || 0,
          creditsUsed: aiUsage.creditsUsed || 1,
          estimatedCost: aiUsage.estimatedCost || 0.001,
          messageType: "chat",
          success: true,
          domainId: aiUsage.domainId,
          userId: aiUsage.userId,
        },
      });
    }

    // Update the chat room's updatedAt timestamp
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: chatMessage.id,
        message: chatMessage.message,
        role: chatMessage.role,
        createdAt: chatMessage.createdAt,
        seen: chatMessage.seen,
      },
    });
  } catch (error) {
    console.error("Error storing message:", error);
    return NextResponse.json(
      { error: "Failed to store message" },
      { status: 500 }
    );
  }
}
