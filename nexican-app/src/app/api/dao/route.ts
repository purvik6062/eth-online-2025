import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "../../../lib/mongodb";

// GET /api/dao - Fetch campaigns pending DAO verification
export async function GET(request: NextRequest) {
  try {
    const campaignsCollection = await getCollection("campaigns");

    // Fetch campaigns that require DAO verification
    const campaigns = await campaignsCollection
      .find({
        daoVerificationRequired: true,
        status: { $in: ["pending_verification", "rejected"] },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    console.error("Error fetching DAO campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch DAO campaigns",
      },
      { status: 500 }
    );
  }
}

// GET /api/dao/membership - Check if a wallet is a DAO member
export async function HEAD() {}
