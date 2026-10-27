import { apiFetch, BackendUnavailableError, setTokenProvider } from "./lovable-api";
import { counselorContext, parseCounselorReply } from "./counselor";
import { abroadCounselorContext, parseAbroadCounselorReply } from "./abroad-counselor";
// Matches the server window; older turns are represented by saved decisions.
export const HISTORY_LIMIT = 10;
import type { Profile } from "./types";
import type { AbroadProfile } from "./abroad-types";
import type { CounselorMessage } from "./counselor-types";

export async function counselorClient() {
  // Lazy load: a phone with an older shell can still use every offline feature.
  const { supabase } = await import("../integrations/supabase/client");
  setTokenProvider(
    async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
  );
  return supabase;
}

// Each device gets a silent guest session so the backend can keep verifying a real signed JWT.
export type CounselorStage = "client" | "session" | "guest";

export class CounselorConnectError extends Error {
  constructor(
    readonly stage: CounselorStage,
    readonly cause: unknown,
  ) {
    super("counselor connection failed at " + stage);
    this.name = "CounselorConnectError";
  }
}

// Logs only the stage and error class/message/status — never tokens or keys.
function logStage(stage: CounselorStage, cause: unknown) {
  if (!__DEV__) return;
  const e = cause as { name?: string; message?: string; status?: number; code?: string };
  console.warn("[counselor]", stage, e?.name, e?.status ?? "", e?.code ?? "", e?.message);
}

async function stage<T>(name: CounselorStage, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (cause) {
    logStage(name, cause);
    throw new CounselorConnectError(name, cause);
  }
}

export async function ensureGuestSession() {
  const client = await stage("client", counselorClient);
  const existing = await stage("session", async () => {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  });
  if (existing) return existing;
  return stage("guest", async () => {
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    if (!data.session?.access_token) throw new Error("no session returned");
    return data.session;
  });
}

// Demo PIN gate: the signed counselor token lives only in memory for this app
// session — never in AsyncStorage or any persisted profile.
let counselorToken: { token: string; expiresAt: number } | null = null;

export class CounselorPinError extends Error {
  constructor() {
    super("pin");
    this.name = "CounselorPinError";
  }
}

export function hasCounselorToken() {
  return !!counselorToken && counselorToken.expiresAt > Date.now() + 5000;
}

export function clearCounselorToken() {
  counselorToken = null;
}

/** Exchanges the demo PIN for a short-lived token. Throws CounselorPinError on a wrong PIN. */
export async function unlockCounselor(pin: string) {
  const response = await apiFetch("/api/public/counselor-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  if (response.status === 403) throw new CounselorPinError();
  if (!response.ok) throw new Error("pin service unavailable");
  const data = (await response.json()) as { token?: string; expiresAt?: number };
  if (!data.token || typeof data.expiresAt !== "number") throw new Error("pin service unavailable");
  counselorToken = { token: data.token, expiresAt: data.expiresAt };
}

export async function requestCounselor(
  p: Profile,
  messages: CounselorMessage[],
  signal: AbortSignal,
  messageId: string,
) {
  try {
    await ensureGuestSession();
  } catch {
    throw new Error("კონსულტანტთან დაკავშირება ვერ მოხერხდა. ხელახლა სცადე.");
  }
  let response: Response;
  try {
    if (!hasCounselorToken()) throw new CounselorPinError();
    response = await apiFetch("/api/public/counselor", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "X-Counselor-Token": counselorToken!.token,
      },
      body: JSON.stringify({
        context: counselorContext(p),
        messages: messages.slice(-HISTORY_LIMIT).map((m) => ({
          role: m.role,
          text: m.parts.map((x) => x.text).join("\n"),
        })),
      }),
    });
  } catch (error) {
    if (error instanceof CounselorPinError) throw error;
    if (error instanceof BackendUnavailableError)
      throw new Error("კონსულტანტის სერვისი ამ წინასწარ ხედში მიუწვდომელია.");
    throw error;
  }
  if (response.status === 403) {
    clearCounselorToken();
    throw new CounselorPinError();
  }
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "კავშირი განახლდა. ხელახლა სცადე."
        : "კონსულტანტს ვერ დავუკავშირდით. შენი სია უცვლელია.",
    );
  const consume = (line: string): CounselorMessage | null => {
    const event: unknown = JSON.parse(line);
    if (!event || typeof event !== "object" || !("type" in event)) throw new Error("invalid event");
    if (event.type === "error")
      throw new Error(
        "message" in event && typeof event.message === "string"
          ? event.message
          : "პასუხი ვერ მივიღეთ.",
      );
    if (event.type === "complete" && "reply" in event)
      return parseCounselorReply(event.reply, p, messageId);
    return null;
  };
  // Native fetch implementations without readable streams still consume the same protocol.
  if (!response.body?.getReader) {
    let result: CounselorMessage | null = null;
    for (const line of (await response.text()).split("\n").filter(Boolean))
      result = consume(line) ?? result;
    if (!result) throw new Error("პასუხი არასრულია. სია უცვლელია.");
    return result;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: CounselorMessage | null = null;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines.filter(Boolean)) result = consume(line) ?? result;
      if (done) break;
    }
    if (buffer.trim()) result = consume(buffer) ?? result;
  } finally {
    reader.releaseLock();
  }
  if (!result) throw new Error("პასუხი არასრულია. სია უცვლელია.");
  return result;
}

/** Abroad Mode counselor: same endpoint, PIN gate and protocol; grounded in the abroad catalog. */
export async function requestAbroadCounselor(
  p: AbroadProfile,
  messages: CounselorMessage[],
  signal: AbortSignal,
  messageId: string,
) {
  try {
    await ensureGuestSession();
  } catch {
    throw new Error("კონსულტანტთან დაკავშირება ვერ მოხერხდა. ხელახლა სცადე.");
  }
  let response: Response;
  try {
    if (!hasCounselorToken()) throw new CounselorPinError();
    response = await apiFetch("/api/public/counselor", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "X-Counselor-Token": counselorToken!.token,
      },
      body: JSON.stringify({
        mode: "abroad",
        context: abroadCounselorContext(p, [...messages].reverse().find((m) => m.role === "user")?.parts.map((x) => x.text).join("\n") ?? ""),
        messages: messages.slice(-HISTORY_LIMIT).map((m) => ({
          role: m.role,
          text: m.parts.map((x) => x.text).join("\n"),
        })),
      }),
    });
  } catch (error) {
    if (error instanceof CounselorPinError) throw error;
    if (error instanceof BackendUnavailableError)
      throw new Error("კონსულტანტის სერვისი ამ წინასწარ ხედში მიუწვდომელია.");
    throw error;
  }
  if (response.status === 403) {
    clearCounselorToken();
    throw new CounselorPinError();
  }
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "კავშირი განახლდა. ხელახლა სცადე."
        : "კონსულტანტს ვერ დავუკავშირდით. შენი პორტფოლიო უცვლელია.",
    );
  const consume = (line: string): CounselorMessage | null => {
    const event: unknown = JSON.parse(line);
    if (!event || typeof event !== "object" || !("type" in event)) throw new Error("invalid event");
    if (event.type === "error")
      throw new Error(
        "message" in event && typeof event.message === "string"
          ? event.message
          : "პასუხი ვერ მივიღეთ.",
      );
    if (event.type === "complete" && "reply" in event)
      return parseAbroadCounselorReply(event.reply, p, messageId);
    return null;
  };
  if (!response.body?.getReader) {
    let result: CounselorMessage | null = null;
    for (const line of (await response.text()).split("\n").filter(Boolean))
      result = consume(line) ?? result;
    if (!result) throw new Error("პასუხი არასრულია. პორტფოლიო უცვლელია.");
    return result;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: CounselorMessage | null = null;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines.filter(Boolean)) result = consume(line) ?? result;
      if (done) break;
    }
    if (buffer.trim()) result = consume(buffer) ?? result;
  } finally {
    reader.releaseLock();
  }
  if (!result) throw new Error("პასუხი არასრულია. პორტფოლიო უცვლელია.");
  return result;
}
