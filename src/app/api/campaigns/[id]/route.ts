import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "../../../../lib/mongodb";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaignsCollection = await getCollection("campaigns");
    const campaign = await campaignsCollection.findOne({
      campaignId: id,
      isPublic: true,
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaign",
      },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const campaignsCollection = await getCollection("campaigns");

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await campaignsCollection.updateOne(
      { campaignId: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update campaign",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaignsCollection = await getCollection("campaigns");
    const result = await campaignsCollection.deleteOne({
      campaignId: id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete campaign",
      },
      { status: 500 }
    );
  }
}
