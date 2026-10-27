export async function GET(request: Request) {
  try {
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

    return Response.json({ farms });
  } catch (error) {
    return Response.json({ error: "Failed to fetch farms" }, { status: 500 });
  }
}