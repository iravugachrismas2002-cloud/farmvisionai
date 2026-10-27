import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In a real implementation, this would query the database
    // for farms owned by the authenticated user
    const farms = [
      {
        id: "farm-1",
        name: "Main Farm",
        locationLabel: "Green Valley",
        createdAt: new Date().toISOString(),
      },
      {
        id: "farm-2",
        name: "North Field",
        locationLabel: "North District",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    return NextResponse.json({ farms });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch farms" },
      { status: 500 }
    );
  }
}