import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "../../../lib/mongodb";

// POST /api/contributions - Create a new contribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      userId,
      amount,
      transactionHash,
      type = "one-time",
    } = body;

    if (!campaignId || !userId || !amount || !transactionHash) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: campaignId, userId, amount, transactionHash",
        },
        { status: 400 }
      );
    }

    const campaignsCollection = await getCollection("campaigns");
    const contributionsCollection = await getCollection("contributions");

    // Check if campaign exists and is public
    const campaign = await campaignsCollection.findOne({
      campaignId: campaignId,
      isPublic: true,
      status: "approved",
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found or not available for contributions",
        },
        { status: 404 }
      );
    }

    // Create contribution record
    const contribution = {
      campaignId,
      userId,
      amount: Number(amount),
      transactionHash,
      type,
      status: "confirmed",
      createdAt: new Date(),
    };

    const result = await contributionsCollection.insertOne(contribution);

    // Update campaign raised amount and backers count
    await campaignsCollection.updateOne(
      { campaignId: campaignId },
      {
        $inc: {
          raised: Number(amount),
          backers: 1,
        },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        ...contribution,
      },
      message: "Contribution recorded successfully",
    });
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create contribution",
      },
      { status: 500 }
    );
  }
}

// GET /api/contributions - Get contributions for a user or campaign
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const campaignId = searchParams.get("campaignId");

    if (!userId && !campaignId) {
      return NextResponse.json(
        {
          success: false,
          error: "Either userId or campaignId is required",
        },
        { status: 400 }
      );
    }

    const contributionsCollection = await getCollection("contributions");

    let query: any = {};
    if (userId) query.userId = userId;
    if (campaignId) {
      query.campaignId = campaignId;
    }

    const contributions = await contributionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: contributions,
      count: contributions.length,
    });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contributions",
      },
      { status: 500 }
    );
  }
}
