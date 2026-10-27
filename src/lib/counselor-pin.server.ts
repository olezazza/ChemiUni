// Demo PIN gate for the AI counselor. The PIN and the signing secret are
// server-only secrets; a correct PIN yields a short-lived HMAC-signed token
// that the counselor endpoint validates on every request.
import { createHmac, createHash, timingSafeEqual } from "node:crypto";

/** Token lifetime: 30 minutes — enough for a demo session, short enough to limit sharing. */
export const TOKEN_TTL_MS = 30 * 60 * 1000;

function pinMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Returns a signed token when the PIN is correct; null when wrong or unconfigured (fail closed). */
export function issueCounselorToken(pin: string): { token: string; expiresAt: number } | null {
  const expected = process.env["DEMO_COUNSELOR_PIN"];
  const secret = process.env["COUNSELOR_TOKEN_SECRET"];
  if (!expected || !secret) {
    console.warn("[counselor-pin] secrets missing; failing closed");
    return null;
  }
  if (typeof pin !== "string" || pin.length < 1 || pin.length > 64 || !pinMatches(pin, expected)) {
    return null;
  }
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = JSON.stringify({ scope: "counselor", exp: expiresAt });
  const body = Buffer.from(payload, "utf8").toString("base64url");
  return { token: `${body}.${sign(body, secret)}`, expiresAt };
}

/** Validates a counselor token: correct signature, scope and unexpired. Fail closed when unconfigured. */
export function verifyCounselorToken(token: string | null): boolean {
  const secret = process.env["COUNSELOR_TOKEN_SECRET"];
  if (!secret || !token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const body = token.slice(0, dot);
  const expectedSig = sign(body, secret);
  const got = Buffer.from(token.slice(dot + 1));
  const want = Buffer.from(expectedSig);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      scope?: string;
      exp?: number;
    };
    return payload.scope === "counselor" && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
