import crypto from "node:crypto";
import fs from "node:fs";

/**
 * Google service-account auth with zero extra dependencies. Mints an RS256 JWT
 * from the service-account key and exchanges it for an access token (cached
 * in-memory until ~1 min before expiry).
 *
 * Key source, in order:
 *   1. GOOGLE_SA_KEY_B64  — base64 of the JSON key (handy for prod env)
 *   2. GOOGLE_SA_KEY_FILE — path to the JSON key file
 *   3. /root/blini-home-ga-sa-key.json — default fallback
 */

interface SAKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

let cachedKey: SAKey | null | undefined;
let cachedToken: { value: string; exp: number } | null = null;

function loadKey(): SAKey | null {
  if (cachedKey !== undefined) return cachedKey;
  try {
    const b64 = process.env.GOOGLE_SA_KEY_B64;
    if (b64) {
      cachedKey = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
      return cachedKey!;
    }
    const path = process.env.GOOGLE_SA_KEY_FILE || "/root/blini-home-ga-sa-key.json";
    cachedKey = JSON.parse(fs.readFileSync(path, "utf8"));
    return cachedKey!;
  } catch {
    cachedKey = null;
    return null;
  }
}

/** True when a usable service-account key is available. */
export function isGoogleConfigured(): boolean {
  return loadKey() !== null;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/** Get a cached Google access token (GSC + GA4 scopes), or null if unconfigured. */
export async function getGoogleToken(): Promise<string | null> {
  const key = loadKey();
  if (!key) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 60) return cachedToken.value;

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: GOOGLE_SCOPES.join(" "),
      aud: key.token_uri,
      exp: now + 3600,
      iat: now,
    })
  );
  const sig = b64url(
    crypto.sign("RSA-SHA256", Buffer.from(`${header}.${claim}`), key.private_key)
  );
  const jwt = `${header}.${claim}.${sig}`;

  try {
    const res = await fetch(key.token_uri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    const json = await res.json();
    if (!json.access_token) return null;
    cachedToken = { value: json.access_token, exp: now + (json.expires_in || 3600) };
    return cachedToken.value;
  } catch {
    return null;
  }
}
