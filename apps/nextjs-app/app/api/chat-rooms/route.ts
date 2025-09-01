import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, live = true } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await client.customer.findUnique({
      where: { id: customerId },
      include: {
        chatRoom: {
          select: {
            id: true,
            live: true,
            mailed: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check if customer already has a chat room
    if (customer.chatRoom && customer.chatRoom.length > 0) {
      const latestChatRoom = customer.chatRoom[0]; // Get the first (latest) chat room
      console.log(`✅ Existing chat room found: ${latestChatRoom.id}`);
      return NextResponse.json(latestChatRoom);
    }

    // Create new chat room
    console.log(`🆕 Creating new chat room for customer: ${customerId}`);

    const newChatRoom = await client.chatRoom.create({
      data: {
        customerId,
        live,
        mailed: false,
      },
    });

    console.log(`✅ Chat room created successfully: ${newChatRoom.id}`);
    return NextResponse.json(newChatRoom);
  } catch (error) {
    console.error("❌ Error creating/getting chat room:", error);
    return NextResponse.json(
      {
        error: "Failed to create chat room",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
