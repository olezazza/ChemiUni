import { expect, test } from "bun:test";
import { modeDestination } from "./mode-entry";

test("first-time Georgia choice opens Georgia questions even with an Abroad profile", () => {
  expect(modeDestination("georgia", { onboarded: false }, { setupDone: true })).toBe("/onboarding");
});
test("first-time Abroad choice opens Abroad questions even with a Georgia profile", () => {
  expect(modeDestination("abroad", { onboarded: true }, { setupDone: false })).toBe("/abroad-setup");
});
test("returning Georgia choice opens Georgia immediately", () => {
  expect(modeDestination("georgia", { onboarded: true }, { setupDone: false })).toBe("/(tabs)");
});
test("returning Abroad choice opens Abroad immediately", () => {
  expect(modeDestination("abroad", { onboarded: false }, { setupDone: true })).toBe("/(tabs)/abroad-home");
});