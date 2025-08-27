import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, feedback, domainId, visitorId, customerId } = body;

    // Validate required fields
    if (!rating || !domainId || !visitorId) {
      return NextResponse.json(
        { error: "Missing required fields: rating, domainId, visitorId" },
        { status: 400 }
      );
    }

    // Validate rating value
    if (!["positive", "negative"].includes(rating)) {
      return NextResponse.json(
        { error: "Rating must be either 'positive' or 'negative'" },
        { status: 400 }
      );
    }

    // Check if domain exists
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: { id: true },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Check if customer exists (if provided)
    if (customerId) {
      const customer = await client.customer.findUnique({
        where: { id: customerId },
        select: { id: true },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
    }

    // Create satisfaction rating
    const satisfactionRating = await client.satisfactionRating.create({
      data: {
        rating,
        feedback: feedback || null,
        domainId,
        visitorId,
        customerId: customerId || null,
      },
      include: {
        Domain: {
          select: {
            name: true,
          },
        },
        Customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("✅ Satisfaction rating stored:", {
      id: satisfactionRating.id,
      rating: satisfactionRating.rating,
      domain: satisfactionRating.Domain.name,
      visitorId: satisfactionRating.visitorId,
    });

    return NextResponse.json({
      success: true,
      data: satisfactionRating,
    });
  } catch (error) {
    console.error("❌ Error storing satisfaction rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("domainId");
    const customerId = searchParams.get("customerId");

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { domainId };
    if (customerId) {
      where.customerId = customerId;
    }

    // Get satisfaction ratings
    const ratings = await client.satisfactionRating.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalRatings = ratings.length;
    const positiveRatings = ratings.filter(
      (r) => r.rating === "positive"
    ).length;
    const negativeRatings = ratings.filter(
      (r) => r.rating === "negative"
    ).length;
    const satisfactionRate =
      totalRatings > 0 ? Math.round((positiveRatings / totalRatings) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        ratings,
        statistics: {
          total: totalRatings,
          positive: positiveRatings,
          negative: negativeRatings,
          satisfactionRate,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching satisfaction ratings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
