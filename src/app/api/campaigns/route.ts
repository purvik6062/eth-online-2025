import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "../../../lib/mongodb";
import { v4 as uuidv4 } from "uuid";

// GET /api/campaigns - Fetch all public campaigns
export async function GET(request: NextRequest) {
  try {
    const campaignsCollection = await getCollection("campaigns");

    // Only fetch campaigns that are approved and public
    const campaigns = await campaignsCollection
      .find({
        status: "approved",
        isPublic: true,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaigns",
      },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      goal,
      deadline,
      chain,
      image,
      documents,
      milestones,
      teamMembers,
      userAddress,
    } = body;

    // Validate required fields
    if (!name || !description || !goal || !deadline || !userAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const campaignsCollection = await getCollection("campaigns");

    // Determine if DAO verification is required
    const daoVerificationRequired = goal > 10000;

    const campaign = {
      campaignId: uuidv4(),
      name,
      description,
      goal: Number(goal),
      deadline,
      chain,
      image,
      documents: documents || [],
      milestones: milestones || [],
      teamMembers: teamMembers || [],
      userAddress,
      status: daoVerificationRequired ? "pending_verification" : "approved",
      isPublic: !daoVerificationRequired,
      daoVerificationRequired,
      raised: 0,
      backers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await campaignsCollection.insertOne(campaign);

    return NextResponse.json({
      success: true,
      data: campaign,
      message: daoVerificationRequired
        ? "Campaign created and submitted for DAO verification"
        : "Campaign created and published",
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create campaign",
      },
      { status: 500 }
    );
  }
}
