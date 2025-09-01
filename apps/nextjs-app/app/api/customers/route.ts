import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, countryCode, domainId } = body;

    if (!email || !domainId) {
      return NextResponse.json(
        { error: "Email and domainId are required" },
        { status: 400 }
      );
    }

    // Check if customer already exists for this domain
    const existingCustomer = await client.customer.findFirst({
      where: {
        email,
        Domain: {
          id: domainId,
        },
      },
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

    if (existingCustomer) {
      console.log(`✅ Existing customer found: ${email}`);
      return NextResponse.json(existingCustomer);
    }

    // Create new customer
    console.log(`🆕 Creating new customer: ${email} for domain: ${domainId}`);

    const newCustomer = await client.customer.create({
      data: {
        email,
        name: name || email.split("@")[0], // Use email prefix as default name
        phone: phone || null,
        countryCode: countryCode || null,
        domainId,
      },
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

    console.log(`✅ Customer created successfully: ${newCustomer.id}`);
    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error("❌ Error creating/getting customer:", error);
    return NextResponse.json(
      {
        error: "Failed to create customer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
