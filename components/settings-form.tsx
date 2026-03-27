"use client";

import Link from "next/link";
import { useState } from "react";

export function SettingsForm({
  settings
}: {
  settings: {
    openaiConfigured: boolean;
    openaiModel: string;
  };
}) {
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState(settings.openaiModel);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openaiApiKey, openaiModel })
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setOpenaiApiKey("");
      setStatus("Settings saved.");
    } catch {
      setStatus("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-[1.5rem] bg-[#faf7f0] p-4 text-sm text-black/65">
        OpenAI key status: {settings.openaiConfigured ? "configured" : "not configured"}
      </div>

      <label className="block text-sm font-medium text-ink">
        OpenAI API key
        <input
          type="password"
          value={openaiApiKey}
          onChange={(event) => setOpenaiApiKey(event.target.value)}
          placeholder={settings.openaiConfigured ? "Saved. Enter a new key to replace it." : "sk-..."}
          className="mt-2 w-full rounded-2xl border border-black/10 bg-[#faf7f0] px-4 py-3"
        />
      </label>

      <label className="block text-sm font-medium text-ink">
        Model
        <input
          type="text"
          value={openaiModel}
          onChange={(event) => setOpenaiModel(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-black/10 bg-[#faf7f0] px-4 py-3"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-ink"
        >
          Back to dashboard
        </Link>
      </div>

      {status ? <p className="text-sm text-black/65">{status}</p> : null}
    </div>
  );
}
