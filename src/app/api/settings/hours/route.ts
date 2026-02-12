export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { getSiteSettings, saveSiteSettings } from "../../../../../lib/siteSettings";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error reading site settings:", error);
    return NextResponse.json(
      { error: "Failed to load site settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const settings = await saveSiteSettings({
      openDate: typeof body.openDate === "string" ? body.openDate : undefined,
      openHours: typeof body.openHours === "string" ? body.openHours : undefined,
      doorDashUrl:
        typeof body.doorDashUrl === "string" ? body.doorDashUrl : undefined,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating site settings:", error);
    return NextResponse.json(
      { error: "Failed to update site settings" },
      { status: 500 }
    );
  }
}
