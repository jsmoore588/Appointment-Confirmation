import { promises as fs } from "fs";
import path from "path";

export type AppSettings = {
  openaiApiKey?: string;
  openaiModel?: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const settingsPath = path.join(dataDirectory, "settings.json");

async function ensureSettingsFile() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(settingsPath);
  } catch {
    await fs.writeFile(settingsPath, JSON.stringify({}, null, 2), "utf8");
  }
}

export async function getAppSettings() {
  await ensureSettingsFile();
  const raw = await fs.readFile(settingsPath, "utf8");
  return JSON.parse(raw) as AppSettings;
}

export async function updateAppSettings(next: AppSettings) {
  const current = await getAppSettings();
  const merged = { ...current, ...next };
  await fs.writeFile(settingsPath, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

export async function getPublicAppSettings() {
  const settings = await getAppSettings();
  return {
    openaiConfigured: Boolean(settings.openaiApiKey),
    openaiModel: settings.openaiModel || "gpt-4.1-mini"
  };
}
