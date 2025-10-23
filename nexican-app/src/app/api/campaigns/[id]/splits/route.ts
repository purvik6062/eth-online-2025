import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "../../../../../lib/mongodb";
import { v4 as uuidv4 } from "uuid";

// POST /api/campaigns/[id]/splits - Create a new split for a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { recipients, totalAmount, splitType, transactionHash, userAddress } =
      body;

    // Validate required fields
    if (!recipients || !totalAmount || !userAddress || !transactionHash) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: recipients, totalAmount, userAddress, transactionHash",
        },
        { status: 400 }
      );
    }

    const campaignsCollection = await getCollection("campaigns");
    const splitsCollection = await getCollection("campaign_splits");

    // Check if campaign exists and user is the creator
    const campaign = await campaignsCollection.findOne({
      campaignId: campaignId,
      userAddress: RegExp(userAddress, 'i'),
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Campaign not found or you don't have permission to split funds",
        },
        { status: 404 }
      );
    }

    // Validate that total amount doesn't exceed raised amount
    if (parseFloat(totalAmount) > campaign.raised) {
      return NextResponse.json(
        {
          success: false,
          error: `Split amount (${totalAmount}) cannot exceed raised amount (${campaign.raised})`,
        },
        { status: 400 }
      );
    }

    // Validate recipients
    const validRecipients = recipients.filter(
      (r: any) => r.address && r.amount && parseFloat(r.amount) > 0
    );

    if (validRecipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one valid recipient is required",
        },
        { status: 400 }
      );
    }

    // Calculate total split amount
    const calculatedTotal = validRecipients.reduce(
      (sum: number, r: any) => sum + parseFloat(r.amount),
      0
    );

    if (Math.abs(calculatedTotal - parseFloat(totalAmount)) > 0.01) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipient amounts don't match total amount",
        },
        { status: 400 }
      );
    }

    // Create split record
    const splitRecord = {
      splitId: uuidv4(),
      campaignId,
      userAddress: userAddress.toLowerCase(),
      recipients: validRecipients.map((r: any) => ({
        address: r.address.toLowerCase(),
        amount: parseFloat(r.amount),
        percentage: (parseFloat(r.amount) / parseFloat(totalAmount)) * 100,
      })),
      totalAmount: parseFloat(totalAmount),
      splitType: splitType || "manual",
      transactionHash,
      status: "completed",
      createdAt: new Date(),
    };

    const result = await splitsCollection.insertOne(splitRecord);

    // Update campaign to track split amount
    await campaignsCollection.updateOne(
      { campaignId: campaignId },
      {
        $inc: { splitAmount: parseFloat(totalAmount) },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      data: { ...splitRecord, _id: result.insertedId },
      message: "Funds split successfully",
    });
  } catch (error) {
    console.error("Error creating campaign split:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create split",
      },
      { status: 500 }
    );
  }
}

// GET /api/campaigns/[id]/splits - Get splits for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const splitsCollection = await getCollection("campaign_splits");

    const splits = await splitsCollection
      .find({ campaignId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: splits,
      count: splits.length,
    });
  } catch (error) {
    console.error("Error fetching campaign splits:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch splits",
      },
      { status: 500 }
    );
  }
}
