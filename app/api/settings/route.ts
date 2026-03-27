import { NextRequest, NextResponse } from "next/server";
import { getPublicAppSettings, updateAppSettings } from "@/lib/app-settings";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getPublicAppSettings());
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    openaiApiKey?: string;
    openaiModel?: string;
  };

  const nextSettings: { openaiApiKey?: string; openaiModel?: string } = {
    openaiModel: body.openaiModel?.trim() || "gpt-4.1-mini"
  };

  if (body.openaiApiKey?.trim()) {
    nextSettings.openaiApiKey = body.openaiApiKey.trim();
  }

  await updateAppSettings(nextSettings);
  return NextResponse.json(await getPublicAppSettings());
}
