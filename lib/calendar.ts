type CreateCalendarEventInput = {
  name: string;
  vehicle: string;
  timeLabel: string;
  scheduledAt?: string | null;
  email?: string;
  pageUrl: string;
};

type GoogleEventResponse = {
  id: string;
};

async function getGoogleAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) {
    throw new Error("Unable to refresh Google access token");
  }

  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

export async function createGoogleCalendarEvent(input: CreateCalendarEventInput) {
  const accessToken = await getGoogleAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  if (!accessToken || !input.scheduledAt) {
    return null;
  }

  const start = new Date(input.scheduledAt);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 45);

  const description = [
    `Vehicle: ${input.vehicle}`,
    `Appointment time: ${input.timeLabel}`,
    `Page: ${input.pageUrl}`
  ].join("\n");

  const body = {
    summary: `Appraisal - ${input.name} (${input.vehicle})`,
    description,
    start: {
      dateTime: start.toISOString(),
      timeZone: "America/Chicago"
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: "America/Chicago"
    },
    attendees: input.email ? [{ email: input.email }] : undefined
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=${input.email ? "all" : "none"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    throw new Error("Unable to create Google Calendar event");
  }

  const payload = (await response.json()) as GoogleEventResponse;
  return payload.id;
}
