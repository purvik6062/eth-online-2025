import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get("user");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User address is required" },
        { status: 400 }
      );
    }

    const subscriptionsCollection = await getCollection("subscriptions");

    const subscriptions = await subscriptionsCollection
      .find({
        subscriberAddress: user.toLowerCase(),
      })
      .toArray();

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      subscriberAddress,
      recipientAddress,
      paymentToken,
      amountPerPayment,
      paymentFrequency,
      numberOfPayments,
      startDate,
      status,
    } = body;

    // Validate required fields
    if (
      !campaignId ||
      !subscriberAddress ||
      !recipientAddress ||
      !paymentToken ||
      !amountPerPayment ||
      !paymentFrequency ||
      !numberOfPayments
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const subscriptionsCollection = await getCollection("subscriptions");

    // Generate unique subscription ID
    const subscriptionId = `sub_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const subscription = {
      subscriptionId,
      campaignId,
      subscriberAddress: subscriberAddress.toLowerCase(),
      recipientAddress: recipientAddress.toLowerCase(),
      paymentToken,
      amountPerPayment: parseFloat(amountPerPayment),
      paymentFrequency,
      numberOfPayments: parseInt(numberOfPayments),
      completedPayments: 0,
      status: status || "pending",
      startDate: startDate || new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour from now
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await subscriptionsCollection.insertOne(subscription);

    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        data: { ...subscription, _id: result.insertedId },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create subscription",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create subscription",
      },
      { status: 500 }
    );
  }
}
