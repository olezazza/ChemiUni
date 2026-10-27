import { describe, it, expect } from "vitest";
import { restoreAbroad, restoreGeorgia, WEB_KEYS } from "@/web/lib/store";
import { parseWebResponse } from "@/web/lib/counselor-api";
import { EMPTY_PROFILE } from "../../../expo/lib/types";
import { EMPTY_ABROAD } from "../../../expo/lib/abroad-types";
import { buildList } from "../../../expo/lib/engine";
import { generateAbroadPortfolio, portfolioPrograms } from "../../../expo/lib/abroad-engine";
import { decideProposals, parseCounselorReply } from "../../../expo/lib/counselor";
describe("website parity and safety", () => {
  it("keeps mode storage independent and restores legacy profiles", () => {
    expect(WEB_KEYS.georgia).toBe("chemiuni.profile.v1");
    expect(WEB_KEYS.abroad).toBe("chemiuni.abroad.v1");
    expect(restoreGeorgia('{"account":{"name":"ნინო"}}').scores).toEqual(EMPTY_PROFILE.scores);
    expect(restoreAbroad('{"gradYear":"2027"}').exams).toEqual(EMPTY_ABROAD.exams);
  });
  it("uses native deterministic Georgia ranking", () => {
    const p = {
      ...EMPTY_PROFILE,
      listCreated: true,
      scores: {
        ...EMPTY_PROFILE.scores,
        georgian: 80,
        foreign: 85,
        elective: "math" as const,
        electiveScore: 75,
      },
    };
    expect(buildList(restoreGeorgia(JSON.stringify(p))).map((x) => x.program.id)).toEqual(
      buildList(p).map((x) => x.program.id),
    );
    expect(buildList(p).length).toBeGreaterThan(0);
  });
  it("keeps approved removals from refilling", () => {
    const p = {
      ...EMPTY_PROFILE,
      listCreated: true,
      scores: {
        ...EMPTY_PROFILE.scores,
        georgian: 80,
        foreign: 85,
        elective: "math" as const,
        electiveScore: 75,
      },
    };
    const targetId = buildList(p)[0]?.program.id;
    if (!targetId) throw new Error("Expected program");
    const message = parseCounselorReply(
      {
        message: "Review",
        proposals: [{ action: "remove", targetId, programId: null, reason: "Review" }],
      },
      p,
      "reply",
    );
    const next = decideProposals(
      { ...p, counselor: { messages: [message] } },
      ["reply.0"],
      true,
      true,
    );
    expect(buildList(next).length).toBe(buildList(p).length - 1);
    expect(buildList(next).some((x) => x.program.id === targetId)).toBe(false);
  });
  it("generates the same abroad snapshot and restores it", () => {
    const p = { ...EMPTY_ABROAD, targetApps: 8, feeBudgetUsd: 300 };
    const ids = generateAbroadPortfolio(p);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.length).toBeLessThanOrEqual(8);
    expect(
      portfolioPrograms(restoreAbroad(JSON.stringify({ ...p, portfolio: ids }))).map((x) => x.id),
    ).toEqual(ids);
  });
  it("rejects truncated and malformed replies without list changes", () => {
    expect(() => parseWebResponse('{"type":"start"}\n', EMPTY_PROFILE, "a", false)).toThrow();
    expect(() =>
      parseWebResponse('{"type":"complete","reply":', EMPTY_PROFILE, "a", false),
    ).toThrow();
    expect(EMPTY_PROFILE.approvedList).toBeUndefined();
  });
});
