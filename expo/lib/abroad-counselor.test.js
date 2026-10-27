import { describe, expect, test } from "bun:test";
import { ABROAD_PROGRAMS } from "./abroad-data";
import { portfolioPrograms } from "./abroad-engine";
import {
  abroadCounselorContext,
  decideAbroadProposals,
  parseAbroadCounselorReply,
  validateAbroadProposal,
} from "./abroad-counselor";
import { EMPTY_ABROAD } from "./abroad-types";

const base = () => ({
  ...EMPTY_ABROAD,
  setupDone: true,
  portfolio: ["tum-cs", "oxford-cs", "elte-cs"],
  exams: {
    ...EMPTY_ABROAD.exams,
    ielts: { status: "received", score: 7 },
    gpa: { status: "received", score: 3.6 },
  },
});

const fixture = () => {
  const p = base();
  const ids = portfolioPrograms(p).map((x) => x.id);
  const outside = ABROAD_PROGRAMS.filter((x) => !ids.includes(x.id));
  const proposals = [
    { id: "replace", action: "replace", targetId: ids[1], programId: outside[0].id, reason: "Budget", status: "pending" },
    { id: "add", action: "add", targetId: null, programId: outside[1].id, reason: "Field", status: "pending" },
    { id: "remove", action: "remove", targetId: ids[2], programId: null, reason: "Location", status: "pending" },
  ];
  return { ...p, counselor: { messages: [{ id: "m", role: "assistant", parts: [{ type: "text", text: "Advice" }], proposals }] } };
};

const proposals = (p) => p.counselor.messages[0].proposals;

describe("Abroad counselor approval safety", () => {
  test("accept one and reject another preserves independent portfolio decisions", () => {
    const p = fixture();
    const accepted = decideAbroadProposals(p, ["replace"], true);
    const rejected = decideAbroadProposals(accepted, ["add"], false);
    expect(rejected.approvedPortfolio).toEqual(accepted.approvedPortfolio);
    expect(proposals(rejected).map((x) => x.status)).toEqual(["accepted", "rejected", "pending"]);
  });
  test("bulk approval protects against conflicting replacement targets", () => {
    const p = fixture();
    const first = proposals(p)[0];
    p.counselor.messages[0].proposals.push({ ...first, id: "conflict", programId: "uw-cs" });
    const next = decideAbroadProposals(p, ["replace", "conflict"], true);
    expect(proposals(next)[0].status).toBe("accepted");
    expect(proposals(next)[3].status).toBe("stale");
    expect(next.approvedPortfolio).not.toContain("uw-cs");
  });
  test("one approval never decides the others", () => {
    const p = fixture();
    const original = portfolioPrograms(p).map((x) => x.id);
    const n = decideAbroadProposals(p, ["replace"], true);
    expect(n.approvedPortfolio[1]).toBe(proposals(p)[0].programId);
    expect(n.approvedPortfolio.length).toBe(original.length);
    expect(proposals(n).map((x) => x.status)).toEqual(["accepted", "pending", "pending"]);
  });
  test("standalone removal requires confirmation; confirmed removal never refills", () => {
    const p = fixture();
    expect(decideAbroadProposals(p, ["remove"], true).approvedPortfolio).toBeUndefined();
    const n = decideAbroadProposals(p, ["remove"], true, true);
    expect(portfolioPrograms(n).length).toBe(2);
    expect(portfolioPrograms(n).some((x) => x.id === proposals(p)[2].targetId)).toBe(false);
  });
  test("accept all validates and applies every valid proposal", () => {
    const p = fixture();
    const n = decideAbroadProposals(p, ["replace", "add", "remove"], true, true);
    expect(proposals(n).every((x) => x.status === "accepted")).toBe(true);
    expect(n.approvedPortfolio).toContain(proposals(p)[1].programId);
    expect(n.approvedPortfolio).not.toContain(proposals(p)[0].targetId);
  });
  test("decided proposals cannot be applied again", () => {
    const n = decideAbroadProposals(fixture(), ["add"], true);
    expect(decideAbroadProposals(n, ["add"], true).approvedPortfolio).toEqual(n.approvedPortfolio);
  });
  test("unknown and duplicate program IDs are rejected", () => {
    const p = fixture();
    expect(validateAbroadProposal(p, { ...proposals(p)[1], programId: "fake" })).not.toBeNull();
    expect(validateAbroadProposal(p, { ...proposals(p)[1], programId: "tum-cs" })).not.toBeNull();
  });
  test("stale targets never remove another item", () => {
    const p = fixture();
    p.removed = [proposals(p)[0].targetId];
    const ids = portfolioPrograms(p).map((x) => x.id);
    const n = decideAbroadProposals(p, ["replace"], true);
    expect(proposals(n)[0].status).toBe("stale");
    expect(portfolioPrograms(n).map((x) => x.id)).toEqual(ids);
  });
  test("JSON restart preserves portfolio, exams and decisions", () => {
    const p = fixture();
    const n = decideAbroadProposals(p, ["replace", "add"], true);
    const restored = JSON.parse(JSON.stringify(n));
    expect(portfolioPrograms(restored).map((x) => x.id)).toEqual(n.approvedPortfolio);
    expect(restored.exams).toEqual(p.exams);
    expect(proposals(restored)[0].status).toBe("accepted");
  });
  test("invalid model reply does not change saved data", () => {
    const p = fixture();
    const before = JSON.stringify(p);
    expect(() => parseAbroadCounselorReply({ message: "Hi", proposals: [{ action: "destroy" }] }, p, "x")).toThrow();
    expect(JSON.stringify(p)).toBe(before);
  });
  test("unknown model IDs are visibly stale", () => {
    const p = fixture();
    const r = parseAbroadCounselorReply({ message: "Hi", proposals: [{ action: "add", targetId: null, programId: "fake", reason: "Reason" }] }, p, "x");
    expect(r.proposals[0].status).toBe("stale");
  });
  test("context carries exams, budget and portfolio without Georgia data", () => {
    const p = fixture();
    const context = abroadCounselorContext(p);
    expect(context.portfolio).toEqual(["tum-cs", "oxford-cs", "elte-cs"]);
    expect(context.exams.ielts.score).toBe(7);
    expect(context.feeBudgetUsd).toBe(500);
    expect(JSON.stringify(context)).not.toContain("georgian");
  });
});
