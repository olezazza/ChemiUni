import { supabase } from "@/integrations/supabase/client";
import { counselorContext, parseCounselorReply } from "../../../expo/lib/counselor";
import { abroadCounselorContext, parseAbroadCounselorReply } from "../../../expo/lib/abroad-counselor";
import type { Profile } from "../../../expo/lib/types";
import type { AbroadProfile } from "../../../expo/lib/abroad-types";
import type { CounselorMessage } from "../../../expo/lib/counselor-types";
let access: { token: string; expiresAt: number } | null = null;
let sessionRequest: Promise<string> | null = null;
export class PinRequired extends Error {}
export function hasWebCounselorAccess() {
  return !!access && access.expiresAt > Date.now() + 5000;
}
async function guestToken() {
  if (!sessionRequest)
    sessionRequest = (async () => {
      const existing = await supabase.auth.getSession();
      if (existing.error) throw new Error("კავშირი ვერ დამყარდა. ხელახლა სცადე.");
      if (existing.data.session) return existing.data.session.access_token;
      const result = await supabase.auth.signInAnonymously();
      if (result.error || !result.data.session)
        throw new Error("კონსულტანტთან დაკავშირება ვერ მოხერხდა. ხელახლა სცადე.");
      return result.data.session.access_token;
    })();
  try {
    return await sessionRequest;
  } finally {
    sessionRequest = null;
  }
}
async function send(
  path: "/api/public/counselor-pin" | "/api/public/counselor",
  body: unknown,
  signal?: AbortSignal,
) {
  const token = await guestToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "API-Version": "1",
    "App-Version": "1.0.0",
    "App-Platform": "web",
  };
  if (path === "/api/public/counselor") {
    if (!hasWebCounselorAccess() || !access) throw new PinRequired();
    headers["X-Counselor-Token"] = access.token;
  }
  return fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    ...(signal ? { signal } : {}),
  });
}
export async function unlockWebCounselor(pin: string) {
  const response = await send("/api/public/counselor-pin", { pin });
  if (!response.ok)
    throw new Error(
      response.status === 403 ? "PIN არასწორია." : "კონსულტანტი მიუწვდომელია. ხელახლა სცადე.",
    );
  const data = (await response.json()) as { token?: string; expiresAt?: number };
  if (!data.token || typeof data.expiresAt !== "number") throw new Error("კავშირი ვერ დამყარდა.");
  access = { token: data.token, expiresAt: data.expiresAt };
}
export async function deleteWebGuest() {
  const token = await guestToken();
  const response = await fetch("/api/public/delete-account", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "App-Platform": "web", "API-Version": "1" },
  });
  if (!response.ok) throw new Error("ანგარიშის წაშლა ვერ მოხერხდა. ხელახლა სცადე.");
  access = null;
  await supabase.auth.signOut({ scope: "local" });
}
export function parseWebResponse(
  text: string,
  profile: Profile | AbroadProfile,
  id: string,
  abroad: boolean,
): CounselorMessage {
  let result: CounselorMessage | null = null;
  for (const line of text.split("\n").filter((x) => x.trim())) {
    const event = JSON.parse(line) as { type?: string; reply?: unknown };
    if (event.type === "error") throw new Error("პასუხი ვერ მივიღეთ. სია უცვლელია.");
    if (event.type === "complete")
      result = abroad
        ? parseAbroadCounselorReply(event.reply, profile as AbroadProfile, id)
        : parseCounselorReply(event.reply, profile as Profile, id);
  }
  if (!result) throw new Error("პასუხი არასრულია. სია უცვლელია.");
  return result;
}
export async function askWebCounselor(
  profile: Profile | AbroadProfile,
  messages: CounselorMessage[],
  id: string,
  abroad: boolean,
  signal: AbortSignal,
) {
  const latest =
    [...messages]
      .reverse()
      .find((m) => m.role === "user")
      ?.parts.map((x) => x.text)
      .join("\n") ?? "";
  const response = await send(
    "/api/public/counselor",
    {
      ...(abroad ? { mode: "abroad" } : {}),
      context: abroad
        ? abroadCounselorContext(profile as AbroadProfile, latest)
        : counselorContext(profile as Profile),
      messages: messages
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.parts.map((x) => x.text).join("\n") })),
    },
    signal,
  );
  if (response.status === 403) {
    access = null;
    throw new PinRequired();
  }
  if (!response.ok) throw new Error("პასუხი ვერ მივიღეთ. შენი სია უცვლელია. ხელახლა სცადე.");
  return parseWebResponse(await response.text(), profile, id, abroad);
}
