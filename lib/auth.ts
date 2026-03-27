import { cookies } from "next/headers";

const SESSION_COOKIE = "appointment_engine_session";

function getAuthSecret() {
  return process.env.AUTH_SECRET || "local-dev-secret";
}

async function sign(value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(email: string) {
  const normalized = email.trim().toLowerCase();
  return `${normalized}.${await sign(normalized)}`;
}

export async function verifySessionToken(token?: string) {
  if (!token) {
    return false;
  }

  const index = token.lastIndexOf(".");

  if (index <= 0) {
    return false;
  }

  const email = token.slice(0, index);
  const signature = token.slice(index + 1);
  return (await sign(email)) === signature;
}

export async function isAuthenticated() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
