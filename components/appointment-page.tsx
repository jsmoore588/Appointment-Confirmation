"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Appointment } from "@/lib/types";
import { formatAppointmentDate } from "@/lib/datetime";

type Props = {
  appointment: Appointment;
};

const progressSteps = [
  { label: "Vehicle Submitted", complete: true },
  { label: "Market Data Pulled", complete: true },
  { label: "Final Walkthrough", complete: false }
];

const arrivalSteps = [
  "Pull into the front lot",
  "Park near the buying center entrance",
  "Ask for your advisor inside"
];

const expectationSteps = [
  { label: "Walkaround", time: "~15 min" },
  { label: "Market review", time: "~10 min" },
  { label: "Offer", time: "~10-15 min" }
];

const sellerQuotes = [
  { quote: "Everything was straightforward and they were ready for me when I got there.", name: "Amanda R." },
  { quote: "I liked knowing what to bring ahead of time. It made the visit easy.", name: "Derrick L." },
  { quote: "It felt organized, calm, and not pushy at all.", name: "Maria T." }
];

export function AppointmentPage({ appointment }: Props) {
  const [confirmed, setConfirmed] = useState(Boolean(appointment.confirmed));
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/appointments/${appointment.id}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "page_opened" }),
      signal: controller.signal
    }).catch(() => null);

    return () => controller.abort();
  }, [appointment.id]);

  const timeLabel = appointment.scheduled_at ? formatAppointmentDate(appointment.scheduled_at) : appointment.time;

  async function handleConfirm() {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/appointments/${appointment.id}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "confirm_clicked" })
      });

      if (!response.ok) {
        throw new Error("Unable to confirm");
      }

      setConfirmed(true);
      setToast("Thanks. We will be ready for you when you arrive.");
    } catch {
      setToast("We could not save that right now, but your time is still reserved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-forest">
              Appointment reserved
            </p>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-ink md:text-6xl">
                {appointment.name} - your appraisal is already in progress
              </h1>
              <p className="max-w-xl text-base leading-7 text-black/65 md:text-lg">
                We are preparing your {appointment.vehicle} at Bullard Buying Center for {timeLabel}.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/5 bg-[#faf7f0] p-4">
              <p className="text-sm font-medium text-ink">We have your time set aside.</p>
              <p className="mt-2 text-sm leading-6 text-black/60">
                This page has everything you need so the visit feels simple and clear before you arrive.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-ink p-5 text-white">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">Progress</p>
            <div className="mt-5 h-3 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "72%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-3 rounded-full bg-[#c9a06f]"
              />
            </div>
            <div className="mt-5 space-y-3">
              {progressSteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12 }}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                >
                  <span className="text-sm">{step.label}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      step.complete ? "bg-white/15 text-white" : "bg-[#c9a06f] text-ink"
                    }`}
                  >
                    {step.complete ? "Complete" : "Pending"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e4ddd0] text-lg font-semibold text-ink">
                {appointment.advisor.slice(0, 1)}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-black/45">Your Appraisal Advisor</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{appointment.advisor}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-black/65">I&apos;ll be ready for you when you get here.</p>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">When You Arrive</p>
            <div className="mt-4 grid gap-3">
              {arrivalSteps.map((step, index) => (
                <div key={step} className="rounded-[1.4rem] border border-black/5 bg-[#faf7f0] p-4">
                  <p className="text-sm font-medium text-ink">
                    {index + 1}. {index === 2 ? `Ask for ${appointment.advisor} inside` : step}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[1.5rem] bg-[linear-gradient(135deg,#d8cfbf,#f8f4ec)] p-5">
              <p className="text-sm font-medium text-ink">Buying Center entrance</p>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Add a location image or map here if you want visual arrival guidance.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">What To Bring</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-black/70">
              <li>Title (if available)</li>
              <li>Payoff info (if applicable)</li>
              <li>Keys</li>
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">Vehicle Snapshot</p>
            <div className="mt-4 space-y-3 text-sm text-black/70">
              <div className="flex items-center justify-between gap-4">
                <span>Vehicle</span>
                <span className="text-right font-medium text-ink">{appointment.vehicle}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Time</span>
                <span className="font-medium text-ink">{timeLabel}</span>
              </div>
              {appointment.mileage ? (
                <div className="flex items-center justify-between gap-4">
                  <span>Mileage</span>
                  <span className="font-medium text-ink">{appointment.mileage}</span>
                </div>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-black/60">
              We have already started preparing your appraisal based on what you shared.
            </p>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">What To Expect</p>
            <p className="mt-3 text-sm leading-7 text-black/65">This usually takes about 30-45 minutes total.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {expectationSteps.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="rounded-[1.4rem] border border-black/5 bg-[#faf7f0] p-4"
                >
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="mt-2 text-sm text-black/55">{item.time}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">What Sellers Say</p>
            <div className="mt-4 space-y-4">
              {sellerQuotes.map((item) => (
                <blockquote key={item.name} className="rounded-[1.5rem] bg-[#faf7f0] p-4 text-sm leading-7 text-black/65">
                  "{item.quote}"
                  <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
                    {item.name}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-[#1d2a26] p-6 text-white shadow-card">
            <p className="text-sm leading-7 text-white/80">
              We&apos;ve reserved this time specifically for you.
            </p>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmed || isSubmitting}
              className="mt-5 w-full rounded-full bg-[#d3a36f] px-5 py-4 text-sm font-medium text-ink transition hover:bg-[#c79660] disabled:cursor-not-allowed disabled:bg-[#b99975]"
            >
              {confirmed ? "You are confirmed" : "I&apos;m planning to be there"}
            </button>
            {toast ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white"
              >
                {toast}
              </motion.p>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
