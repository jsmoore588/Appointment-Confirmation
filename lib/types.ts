export type Appointment = {
  id: string;
  name: string;
  vehicle: string;
  time: string;
  scheduled_at?: string;
  advisor: string;
  created_at: string;
  mileage?: string;
  notes?: string;
  phone?: string;
  email?: string;
  confirmed?: boolean;
  opened_count?: number;
  last_opened_at?: string;
  first_opened_at?: string;
  confirmed_at?: string;
  engagement_score?: number;
  calendar_event_id?: string;
};

export type AppointmentEventType = "page_opened" | "confirm_clicked";

export type AppointmentEvent = {
  id: string;
  appointmentId: string;
  type: AppointmentEventType;
  created_at: string;
  metadata?: Record<string, string | number | boolean>;
};
