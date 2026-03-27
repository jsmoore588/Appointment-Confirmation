import { NextResponse } from "next/server";
import { getAppointmentAnalytics } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const analytics = await getAppointmentAnalytics(id);

  if (!analytics) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  return NextResponse.json(analytics);
}
