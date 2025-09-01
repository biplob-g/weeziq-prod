import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      model,
      tokensUsed,
      estimatedCost,
      domainId,
      messageType = "chat",
      success = true,
    } = body;

    if (!userId || !model || !tokensUsed) {
      return NextResponse.json(
        { error: "userId, model, and tokensUsed are required" },
        { status: 400 }
      );
    }

    // Create AI usage record
    console.log(
      `📊 Tracking AI usage: ${model} (${tokensUsed} tokens) for user: ${userId}`
    );

    const usageRecord = await client.aiUsage.create({
      data: {
        userId,
        model,
        tokensUsed,
        estimatedCost: estimatedCost || 0,
        domainId,
        messageType,
        success,
        usedAt: new Date(),
      },
    });

    console.log(`✅ AI usage tracked successfully: ${usageRecord.id}`);
    return NextResponse.json(usageRecord);
  } catch (error) {
    console.error("❌ Error tracking AI usage:", error);
    return NextResponse.json(
      {
        error: "Failed to track AI usage",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const domainId = searchParams.get("domainId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const whereClause: any = { userId };
    if (domainId) {
      whereClause.domainId = domainId;
    }

    // Get AI usage records
    const usageRecords = await client.aiUsage.findMany({
      where: whereClause,
      orderBy: { usedAt: "desc" },
      take: limit,
    });

    // Calculate total usage
    const totalTokens = usageRecords.reduce(
      (sum, record) => sum + record.tokensUsed,
      0
    );
    const totalCost = usageRecords.reduce(
      (sum, record) => sum + (record.estimatedCost || 0),
      0
    );

    return NextResponse.json({
      usage: usageRecords,
      summary: {
        totalRecords: usageRecords.length,
        totalTokens,
        totalCost,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching AI usage:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch AI usage",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
