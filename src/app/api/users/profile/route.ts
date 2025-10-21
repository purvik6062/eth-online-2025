import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "../../../../lib/mongodb";

// GET /api/users/profile - Get user profile with unified balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Wallet address is required",
        },
        { status: 400 }
      );
    }

    const campaignsCollection = await getCollection("campaigns");
    const contributionsCollection = await getCollection("contributions");
    // const usersCollection = await getCollection("users");

    // Get campaigns created by user
    const createdCampaigns = await campaignsCollection
      .find({ userAddress: walletAddress })
      .sort({ createdAt: -1 })
      .toArray();

    // Get campaigns contributed to by user
    const contributions = await contributionsCollection
      .find({ userAddress: walletAddress })
      .sort({ createdAt: -1 })
      .toArray();

    // Get campaign details for contributions
    const contributedCampaignIds = contributions.map((c) => c.campaignId);
    const contributedCampaigns = await campaignsCollection
      .find({
        campaignId: { $in: contributedCampaignIds },
      })
      .toArray();

    // Calculate unified balance
    const totalContributed = contributions.reduce(
      (sum, c) => sum + c.amount,
      0
    );
    const totalRaised = createdCampaigns.reduce((sum, c) => sum + c.raised, 0);
    const totalEarned = createdCampaigns.reduce((sum, c) => {
      // Calculate earnings based on completed milestones
      return (
        sum +
        (c.milestones
          ?.filter((m) => m.status === "completed")
          .reduce((milestoneSum, m) => milestoneSum + m.amount, 0) || 0)
      );
    }, 0);

    // Get recent activity
    const recentActivity = [
      ...createdCampaigns.slice(0, 5).map((campaign) => ({
        type: "campaign_created",
        campaignId: campaign.campaignId,
        campaignName: campaign.name,
        amount: campaign.goal,
        timestamp: campaign.createdAt,
        status: campaign.status,
      })),
      ...contributions.slice(0, 5).map((contribution) => ({
        type: "contribution",
        campaignId: contribution.campaignId,
        campaignName:
          contributedCampaigns.find(
            (c) => c.campaignId.toString() === contribution.campaignId
          )?.name || "Unknown Campaign",
        amount: contribution.amount,
        timestamp: contribution.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const profile = {
      user: {
        // id: user._id,
        // name: user.name,
        // email: user.email,
        walletAddress: walletAddress,
        // avatar: user.avatar,
        // verified: user.verified,
        // joinedAt: user.createdAt,
      },
      stats: {
        campaignsCreated: createdCampaigns.length,
        campaignsContributed: contributedCampaigns.length,
        totalContributions: contributions.length,
      },
      campaigns: {
        created: createdCampaigns,
        contributed: contributedCampaigns.map((campaign) => ({
          ...campaign,
          contribution: contributions.find(
            (c) => c.campaignId === campaign.campaignId.toString()
          ),
        })),
      },
      recentActivity: recentActivity.slice(0, 10),
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user profile",
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, ...updateData } = body;

    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Wallet address is required",
        },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection("users");

    const result = await usersCollection.updateOne(
      { walletAddress },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
