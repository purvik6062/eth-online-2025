import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "../../../../lib/mongodb";

// Static DAO member addresses - must match the frontend list
const DAO_MEMBER_ADDRESSES = [
  "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6", // Example DAO member (lowercase)
  "0x1234567890123456789012345678901234567890", // Add more DAO members here
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", // Add more DAO members here
];

// POST /api/dao/verify - Verify or reject a campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, action, verifierId, comments } = body;

    if (!campaignId || !action || !verifierId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: campaignId, action, verifierId",
        },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be "approve" or "reject"',
        },
        { status: 400 }
      );
    }

    // Enforce DAO member permissions using static allowlist
    if (!DAO_MEMBER_ADDRESSES.includes(verifierId.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: "Only DAO members can verify or reject campaigns",
        },
        { status: 403 }
      );
    }

    const campaignsCollection = await getCollection("campaigns");

    // Check if campaign exists and is pending verification
    const campaign = await campaignsCollection.findOne({
      campaignId: campaignId,
      daoVerificationRequired: true,
      status: "pending_verification",
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found or not pending verification",
        },
        { status: 404 }
      );
    }

    // Update campaign status
    const updateData = {
      status: action === "approve" ? "approved" : "rejected",
      isPublic: action === "approve",
      verification: {
        action,
        verifierId,
        comments: comments || "",
        verifiedAt: new Date(),
      },
      updatedAt: new Date(),
    };

    const result = await campaignsCollection.updateOne(
      { campaignId: campaignId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update campaign",
        },
        { status: 500 }
      );
    }

    // Log the verification action
    const verificationLogsCollection = await getCollection("verification_logs");
    await verificationLogsCollection.insertOne({
      campaignId: campaignId,
      action,
      verifierId,
      comments: comments || "",
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Campaign ${
        action === "approve" ? "approved" : "rejected"
      } successfully`,
      data: {
        campaignId,
        status: updateData.status,
        isPublic: updateData.isPublic,
      },
    });
  } catch (error) {
    console.error("Error verifying campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify campaign",
      },
      { status: 500 }
    );
  }
}
