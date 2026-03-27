# Appointment Engine

Appointment Engine is a mobile-first Next.js app plus a bundled Chrome extension for creating personalized appointment lock-in pages.

## Features

- Dynamic appointment pages at `/appt/[id]`
- `POST /api/create-appointment` for instant page generation
- Google Calendar event creation on appointment creation
- Dashboard login, logic-based priority scoring, and today/tomorrow boards
- Engagement tracking for page opens and confirmation clicks
- Follow-up guidance based on first-open vs repeat-open behavior
- Manifest V3 extension with DOM autofill, clipboard copy, and optional tab opening
- Public link support through a deployable app URL override
- Dashboard settings page for storing an OpenAI API key and model

## Local setup

1. Run `npm install`
2. Run `npm run dev`
3. Open `http://localhost:6767`
4. Load `extension/` in Chrome via `chrome://extensions` -> `Load unpacked`
5. In the popup, set the API base URL to `http://localhost:6767`
6. Open `/dashboard/settings` after login if you want to save an OpenAI API key for AI-generated action summaries

## Environment

Create a local `.env.local` with:

```env
DASHBOARD_EMAIL=admin@localhost
DASHBOARD_PASSWORD=changeme
AUTH_SECRET=replace-me
PUBLIC_APP_URL=http://localhost:6767
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary
```

Google Calendar creation runs only when the Google values are present and the appointment time can be parsed into a real timestamp.
If you deploy the app publicly, set `PUBLIC_APP_URL` to your real domain so generated links work from anywhere.

## API

### Create appointment

`POST /api/create-appointment`

Example body:

```json
{
  "name": "Mia",
  "vehicle": "2021 Toyota Highlander XLE",
  "time": "Today at 3:30 PM",
  "advisor": "Jude"
}
```

### Track event

`POST /api/appointments/:id/event`

Accepted event types:

- `page_opened`
- `confirm_clicked`

### Read analytics

`GET /api/appointments/:id`

Returns open count, confirmation count, high-intent flag, and resend guidance.

## Data storage

Appointments and events are stored locally in `data/appointments.json`. The app seeds a sample appointment on first run.

## Public access

Localhost links are only reachable on your own machine. To make appointment links viewable from anywhere, deploy the Next.js app to a public host and set `PUBLIC_APP_URL` to that deployed domain.

Example:

```env
PUBLIC_APP_URL=https://appointments.yourdomain.com
```
