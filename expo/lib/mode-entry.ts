import type { AbroadProfile } from "./abroad-types";
import type { Profile } from "./types";

/** Completion belongs to the selected profile, never to the last-used mode. */
export function modeDestination(mode: "georgia" | "abroad", profile: Pick<Profile, "onboarded">, abroad: Pick<AbroadProfile, "setupDone">) {
  if (mode === "abroad") return abroad.setupDone ? "/(tabs)/abroad-home" : "/abroad-setup";
  return profile.onboarded ? "/(tabs)" : "/onboarding";
}