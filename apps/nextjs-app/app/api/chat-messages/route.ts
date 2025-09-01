import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, role, chatRoomId, seen = false } = body;

    if (!message || !role || !chatRoomId) {
      return NextResponse.json(
        { error: "message, role, and chatRoomId are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["OWNER", "CUSTOMER"].includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: "role must be either OWNER or CUSTOMER" },
        { status: 400 }
      );
    }

    // Check if chat room exists
    const chatRoom = await client.chatRoom.findUnique({
      where: { id: chatRoomId },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: "Chat room not found" },
        { status: 404 }
      );
    }

    // Create new message
    console.log(`💬 Creating new message in chat room: ${chatRoomId}`);

    const newMessage = await client.chatMessage.create({
      data: {
        message,
        role: role.toUpperCase() as "OWNER" | "CUSTOMER",
        chatRoomId,
        seen,
      },
    });

    // Update chat room's updatedAt timestamp
    await client.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() },
    });

    console.log(`✅ Message created successfully: ${newMessage.id}`);
    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("❌ Error creating chat message:", error);
    return NextResponse.json(
      {
        error: "Failed to create message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatRoomId = searchParams.get("chatRoomId");

    if (!chatRoomId) {
      return NextResponse.json(
        { error: "chatRoomId is required" },
        { status: 400 }
      );
    }

    // Get messages for chat room
    const messages = await client.chatMessage.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("❌ Error fetching chat messages:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch messages",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
