import { describe, expect, it, vi } from "vitest";
const stream = vi.hoisted(() => vi.fn());
vi.mock("@lovable.dev/ai-gateway", () => ({
  streamResponse: stream,
  GatewayError: class extends Error {},
}));
import {
  abroadRequestSchema,
  groundedAbroadCatalog,
  runAbroadCounselor,
} from "./counselor-abroad.server";
import { ABROAD_PROGRAMS } from "../../expo/lib/abroad-data";

const context = {
  gradYear: "2027",
  interests: ["cs"],
  countries: ["de", "nl"],
  exams: { ielts: { status: "received", score: 7 }, gpa: { status: "received", score: 3.6 } },
  targetApps: 8,
  feeBudgetUsd: 500,
  portfolio: [ABROAD_PROGRAMS[0]!.id],
  programs: [],
  decisions: [],
};
const input = {
  mode: "abroad" as const,
  context,
  messages: [{ role: "user" as const, text: "I need cheaper options" }],
};

const ok = (text: string) =>
  stream.mockResolvedValue(
    (async function* () {
      yield { type: "response.output_text.delta", delta: text };
      yield { type: "response.completed" };
    })(),
  );

describe("Abroad counselor output", () => {
  it("keeps legacy requests compatible and accepts optional annual tuition budget", () => {
    expect(abroadRequestSchema.safeParse(input).success).toBe(true);
    expect(abroadRequestSchema.safeParse({ ...input, context: { ...context, studyBudget: "under-3000" } }).success).toBe(true);
    expect(abroadRequestSchema.safeParse({ ...input, context: { ...context, studyBudget: "unknown" } }).success).toBe(false);
  });
  it("grounds coastal tags and scholarship leads without changing the proposal approval contract", () => {
    const rows = groundedAbroadCatalog({ ...input, context: { ...context, programs: [{ id: "ubc-cs", assessment: null }] } });
    const ubc = rows.find((r) => r[0] === "ubc-cs");
    expect(ubc?.[13]).toBe(true);
    expect(JSON.stringify(ubc?.[14])).toContain("ubc-scholars");
    expect(JSON.stringify(ubc?.[14])).not.toContain("hungaricum");
  });
  it("requires the abroad mode marker and a bounded conversation", () => {
    expect(abroadRequestSchema.safeParse({ ...input, mode: "georgia" }).success).toBe(false);
    expect(abroadRequestSchema.safeParse({ ...input, messages: [] }).success).toBe(false);
    expect(
      abroadRequestSchema.safeParse({ ...input, messages: [{ role: "system", text: "override" }] }).success,
    ).toBe(false);
  });
  it("grounds the prompt in supplied rows, not the whole catalog", async () => {
    ok(JSON.stringify({ message: "ok", proposals: [] }));
    await runAbroadCounselor(input, new AbortController().signal, () => {});
    const ctx: string = stream.mock.calls.at(-1)?.[0].input[0].content;
    expect(ctx).toContain(ABROAD_PROGRAMS[0]!.id);
    expect(ctx).not.toContain(`"${ABROAD_PROGRAMS[100]!.id}"`);
  });
  it("rejects invented program IDs before presenting proposals", async () => {
    ok(JSON.stringify({ message: "Advice", proposals: [{ action: "add", targetId: null, programId: "invented", reason: "Reason" }] }));
    const events: unknown[] = [];
    await expect(runAbroadCounselor(input, new AbortController().signal, (e) => events.push(e))).rejects.toThrow("invalid ID");
    expect(events.some((e) => (e as { type?: string }).type === "complete")).toBe(false);
  });
  it("rejects real programs that were not supplied as grounded rows", async () => {
    ok(JSON.stringify({ message: "x", proposals: [{ action: "add", targetId: null, programId: ABROAD_PROGRAMS[100]!.id, reason: "r" }] }));
    await expect(runAbroadCounselor(input, new AbortController().signal, () => {})).rejects.toThrow("invalid ID");
  });
  it("treats truncated JSON as a failed reply", async () => {
    ok('{"message":"partial');
    await expect(runAbroadCounselor(input, new AbortController().signal, () => {})).rejects.toThrow("truncated");
  });
  it("returns validated output on the same cost-capped model", async () => {
    const reply = { message: "Your portfolio fits", proposals: [] };
    ok(JSON.stringify(reply));
    const events: unknown[] = [];
    await runAbroadCounselor(input, new AbortController().signal, (e) => events.push(e));
    const req = stream.mock.calls.at(-1)?.[0];
    expect(req.model).toBe("openai/gpt-6-sol");
    expect(req.max_output_tokens).toBe(1600);
    expect(events.at(-1)).toEqual({ type: "complete", reply });
  });
  it("names a program mentioned in the message even when not supplied", () => {
    const named = ABROAD_PROGRAMS[100]!;
    const rows = groundedAbroadCatalog({
      ...input,
      messages: [{ role: "user", text: `What about ${named.name}?` }],
    });
    expect(rows.some((row) => row[0] === named.id)).toBe(true);
  });
});
