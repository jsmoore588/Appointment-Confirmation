import { promises as fs } from "fs";
import path from "path";
import { Appointment, AppointmentEvent, AppointmentEventType } from "@/lib/types";
import { formatAppointmentDate, hoursUntil, isToday, isTomorrow } from "@/lib/datetime";

type DatabaseShape = {
  appointments: Appointment[];
  events: AppointmentEvent[];
};

export type AppointmentStatus = "confirmed" | "viewed" | "not_opened";
export type AppointmentPriority = "high" | "normal" | "low";

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "appointments.json");

function createSeedAppointment() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(15, 30, 0, 0);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(11, 0, 0, 0);

  return {
    appointments: [
      {
        id: "sample-appointment",
        name: "Mia",
        vehicle: "2021 Toyota Highlander XLE",
        time: formatAppointmentDate(today.toISOString()),
        scheduled_at: today.toISOString(),
        advisor: "Jude",
        mileage: "42,180 miles",
        phone: "(555) 270-4482",
        email: "mia@example.com",
        notes: "Clean title, one key, excellent condition.",
        confirmed: false,
        opened_count: 0,
        engagement_score: 0,
        created_at: now.toISOString()
      },
      {
        id: "sample-tomorrow",
        name: "Chris",
        vehicle: "2020 Ford F-150 Lariat",
        time: formatAppointmentDate(tomorrow.toISOString()),
        scheduled_at: tomorrow.toISOString(),
        advisor: "Jude",
        phone: "(555) 808-1299",
        confirmed: false,
        opened_count: 0,
        engagement_score: 0,
        created_at: now.toISOString()
      }
    ],
    events: []
  } satisfies DatabaseShape;
}

async function ensureDatabase() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(databasePath);
  } catch {
    await fs.writeFile(databasePath, JSON.stringify(createSeedAppointment(), null, 2), "utf8");
  }
}

async function readDatabase() {
  await ensureDatabase();
  const raw = await fs.readFile(databasePath, "utf8");
  const db = JSON.parse(raw) as DatabaseShape;

  if (!Array.isArray(db.appointments)) {
    db.appointments = [];
  }

  if (!Array.isArray(db.events)) {
    db.events = [];
  }

  return db;
}

async function writeDatabase(data: DatabaseShape) {
  await fs.writeFile(databasePath, JSON.stringify(data, null, 2), "utf8");
}

function getStatus(appointment: Appointment): AppointmentStatus {
  if (appointment.confirmed) {
    return "confirmed";
  }

  if ((appointment.opened_count ?? 0) > 0) {
    return "viewed";
  }

  return "not_opened";
}

function getPriority(appointment: Appointment): AppointmentPriority {
  if (appointment.confirmed) {
    return "low";
  }

  const hours = hoursUntil(appointment.scheduled_at);

  if ((appointment.opened_count ?? 0) === 0 && hours >= 0 && hours <= 3) {
    return "high";
  }

  if ((appointment.opened_count ?? 0) > 2 && !appointment.confirmed) {
    return "high";
  }

  return "normal";
}

function toDashboardAppointment(appointment: Appointment) {
  return {
    ...appointment,
    status: getStatus(appointment),
    priority: getPriority(appointment),
    formattedTime: appointment.scheduled_at
      ? formatAppointmentDate(appointment.scheduled_at)
      : appointment.time
  };
}

export async function listAppointments() {
  const db = await readDatabase();
  return db.appointments;
}

export async function getDashboardMetrics() {
  const db = await readDatabase();
  const appointments = db.appointments.map(toDashboardAppointment);
  const totalAppointments = appointments.length;
  const totalOpens = db.events.filter((event) => event.type === "page_opened").length;
  const totalConfirmations = db.events.filter((event) => event.type === "confirm_clicked").length;
  const highIntent = appointments.filter((appointment) => (appointment.opened_count ?? 0) > 2).length;
  const viewedAppointments = appointments.filter((appointment) => (appointment.opened_count ?? 0) > 0).length;
  const todayAppointments = appointments
    .filter((appointment) => isToday(appointment.scheduled_at))
    .sort((a, b) => (a.scheduled_at || "").localeCompare(b.scheduled_at || ""));
  const tomorrowAppointments = appointments
    .filter((appointment) => isTomorrow(appointment.scheduled_at))
    .sort((a, b) => (a.scheduled_at || "").localeCompare(b.scheduled_at || ""));

  const suggestions = [
    appointments.some(
      (appointment) => appointment.priority === "high" && appointment.status === "not_opened"
    )
      ? "Prioritize not-opened appointments that are less than 3 hours away."
      : null,
    highIntent > 0 ? "Prioritize repeat-open appointments. They are signaling strong intent." : null,
    totalConfirmations > 0 ? "Deprioritize confirmed appointments unless timing changes." : null
  ].filter(Boolean) as string[];

  return {
    totalAppointments,
    totalOpens,
    totalConfirmations,
    highIntent,
    openRate: totalAppointments === 0 ? 0 : Math.round((viewedAppointments / totalAppointments) * 100),
    confirmationRate:
      totalAppointments === 0 ? 0 : Math.round((totalConfirmations / totalAppointments) * 100),
    showRate:
      totalAppointments === 0 ? 0 : Math.round((totalConfirmations / totalAppointments) * 100),
    suggestions,
    todayAppointments,
    tomorrowAppointments
  };
}

export async function getAppointmentById(id: string) {
  const db = await readDatabase();
  return db.appointments.find((appointment) => appointment.id === id) ?? null;
}

export async function createAppointment(appointment: Appointment) {
  const db = await readDatabase();
  db.appointments.unshift(appointment);
  await writeDatabase(db);
  return appointment;
}

export async function updateAppointment(id: string, partial: Partial<Appointment>) {
  const db = await readDatabase();
  const appointment = db.appointments.find((item) => item.id === id);

  if (!appointment) {
    return null;
  }

  Object.assign(appointment, partial);
  await writeDatabase(db);
  return appointment;
}

export async function registerEvent(
  appointmentId: string,
  type: AppointmentEventType,
  metadata?: Record<string, string | number | boolean>
) {
  const db = await readDatabase();
  const appointment = db.appointments.find((item) => item.id === appointmentId);

  if (!appointment) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const event: AppointmentEvent = {
    id: crypto.randomUUID(),
    appointmentId,
    type,
    created_at: timestamp,
    metadata
  };

  db.events.unshift(event);

  if (type === "page_opened") {
    appointment.opened_count = (appointment.opened_count ?? 0) + 1;
    appointment.last_opened_at = timestamp;
    appointment.first_opened_at = appointment.first_opened_at ?? timestamp;
    appointment.engagement_score = Math.min((appointment.engagement_score ?? 0) + 20, 100);
  }

  if (type === "confirm_clicked") {
    appointment.confirmed = true;
    appointment.confirmed_at = timestamp;
    appointment.engagement_score = Math.min((appointment.engagement_score ?? 0) + 35, 100);
  }

  await writeDatabase(db);
  return {
    appointment,
    event
  };
}

export async function getAppointmentAnalytics(appointmentId: string) {
  const db = await readDatabase();
  const appointment = db.appointments.find((item) => item.id === appointmentId) ?? null;

  if (!appointment) {
    return null;
  }

  const events = db.events.filter((event) => event.appointmentId === appointmentId);
  const opens = events.filter((event) => event.type === "page_opened").length;
  const confirmations = events.filter((event) => event.type === "confirm_clicked").length;
  const status = getStatus(appointment);
  const priority = getPriority(appointment);

  return {
    appointment,
    metrics: {
      opens,
      confirmations,
      status,
      priority,
      hasHighIntent: opens > 2,
      resendRecommendation:
        opens > 0
          ? "They opened the link. Follow up with a softer reminder because intent is already established."
          : "They have not opened the link yet. Resend with a stronger future-paced message and a tighter reason to respond."
    }
  };
}
