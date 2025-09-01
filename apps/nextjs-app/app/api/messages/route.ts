import { NextRequest, NextResponse } from "next/server";
import { client as prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, message, userId, userName, role, roomId, domainId, timestamp } =
      body;

    console.log("📝 Storing message in database:", {
      id,
      message,
      userId,
      userName,
      role,
      roomId,
      domainId,
    });

    // First, check if the chat room exists, if not create it
    let chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!chatRoom) {
      // Create a new chat room if it doesn't exist
      chatRoom = await prisma.chatRoom.create({
        data: {
          id: roomId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log("✅ Created new chat room:", chatRoom.id);
    }

    // Store message in database
    const storedMessage = await prisma.chatMessage.create({
      data: {
        id,
        message,
        role: role === "user" ? "CUSTOMER" : "OWNER",
        chatRoomId: roomId,
        createdAt: new Date(timestamp),
      },
    });

    console.log("✅ Message stored successfully:", storedMessage.id);

    return NextResponse.json({
      success: true,
      message: storedMessage,
    });
  } catch (error) {
    console.error("❌ Error storing message:", error);
    return NextResponse.json(
      { error: "Failed to store message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const domainId = searchParams.get("domainId");

    if (!roomId || !domainId) {
      return NextResponse.json(
        { error: "Room ID and Domain ID are required" },
        { status: 400 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        chatRoomId: roomId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
