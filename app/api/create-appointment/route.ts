import { NextRequest, NextResponse } from "next/server";
import { createAppointment, updateAppointment } from "@/lib/storage";
import { createUuid } from "@/lib/uuid";
import { Appointment } from "@/lib/types";
import { parseAppointmentTime, formatAppointmentDate } from "@/lib/datetime";
import { createGoogleCalendarEvent } from "@/lib/calendar";

type CreatePayload = Pick<
  Appointment,
  "name" | "vehicle" | "time" | "advisor" | "mileage" | "notes" | "phone" | "email"
>;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<CreatePayload>;

  if (!body.name || !body.vehicle || !body.time || !body.advisor) {
    return NextResponse.json(
      { error: "name, vehicle, time, and advisor are required" },
      { status: 400 }
    );
  }

  const scheduledAt = parseAppointmentTime(body.time);
  const id = createUuid();
  const publicBaseUrl = (process.env.PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "");
  const pageUrl = `${publicBaseUrl}/appt/${id}`;

  const appointment: Appointment = {
    id,
    name: body.name,
    vehicle: body.vehicle,
    time: scheduledAt ? formatAppointmentDate(scheduledAt) : body.time,
    scheduled_at: scheduledAt ?? undefined,
    advisor: body.advisor,
    mileage: body.mileage,
    notes: body.notes,
    phone: body.phone,
    email: body.email,
    confirmed: false,
    opened_count: 0,
    engagement_score: 0,
    created_at: new Date().toISOString()
  };

  await createAppointment(appointment);

  let calendarEventId: string | null = null;

  try {
    calendarEventId = await createGoogleCalendarEvent({
      name: appointment.name,
      vehicle: appointment.vehicle,
      timeLabel: appointment.time,
      scheduledAt: appointment.scheduled_at,
      email: appointment.email,
      pageUrl
    });
  } catch (error) {
    console.error("Google Calendar error", error);
  }

  if (calendarEventId) {
    await updateAppointment(id, { calendar_event_id: calendarEventId });
  }

  return NextResponse.json({
    url: pageUrl,
    id,
    calendar_event_id: calendarEventId
  });
}
