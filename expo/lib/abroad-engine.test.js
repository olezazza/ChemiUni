import { describe, expect, test } from "bun:test";
import { ABROAD_PROGRAMS, abroadProgramById } from "./abroad-data";
import {
  englishStrength,
  estimateAbroad,
  portfolioPrograms,
  portfolioStats,
  strength,
  tipsFor,
  unmetRequirements,
  upcomingDeadlines,
  generateAbroadPortfolio,
  matchesStudyBudget,
  improvementsFor,
} from "./abroad-engine";
import { EMPTY_ABROAD } from "./abroad-types";

const student = (exams = {}) => ({
  ...EMPTY_ABROAD,
  setupDone: true,
  exams: { ...EMPTY_ABROAD.exams, ...exams },
});

describe("Generated Abroad portfolios", () => {
  test("tuition-free means zero tuition, never presumed scholarship discounts", () => {
    const p = { ...strong, studyBudget: "free" };
    expect(matchesStudyBudget(p, { tuitionUsd: 0 })).toBe(true);
    expect(matchesStudyBudget(p, { tuitionUsd: 1 })).toBe(false);
    expect(generateAbroadPortfolio(p)).toEqual([]);
  });
  test("under EUR 3000 excludes its exact boundary with the explicit demo conversion", () => {
    expect(matchesStudyBudget({ ...strong, studyBudget: "under-3000" }, { tuitionUsd: 3299 })).toBe(true);
    expect(matchesStudyBudget({ ...strong, studyBudget: "under-3000" }, { tuitionUsd: 3300 })).toBe(false);
  });
  test("EUR 3000–10000 uses an inclusive upper cap and allows cheaper options", () => {
    const p = { ...strong, studyBudget: "3000-10000" };
    expect(matchesStudyBudget(p, { tuitionUsd: 11000 })).toBe(true);
    expect(matchesStudyBudget(p, { tuitionUsd: 11001 })).toBe(false);
    expect(matchesStudyBudget(p, { tuitionUsd: 500 })).toBe(true);
  });
  test("EUR 10000–25000 has the correct inclusive ceiling", () => {
    const p = { ...strong, studyBudget: "10000-25000" };
    expect(matchesStudyBudget(p, { tuitionUsd: 27500 })).toBe(true);
    expect(matchesStudyBudget(p, { tuitionUsd: 27501 })).toBe(false);
  });
  test("flexible and legacy saves impose no new tuition cap", () => {
    expect(matchesStudyBudget({ ...strong, studyBudget: "flexible" }, { tuitionUsd: 65000 })).toBe(true);
    expect(matchesStudyBudget({ ...strong, studyBudget: undefined }, { tuitionUsd: 65000 })).toBe(true);
  });
  test("generation respects target count, fee budget, interests, countries and removals", () => {
    const p = { ...strong, studyBudget: "under-3000", countries: ["de"], interests: ["cs"], targetApps: 4, feeBudgetUsd: 300, removed: ["tum-cs"] };
    const ids = generateAbroadPortfolio(p);
    expect(ids.length).toBe(3);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("tum-cs");
    expect(ids).toEqual(generateAbroadPortfolio(p));
    expect(ids.map(abroadProgramById).every((x) => x.field === "cs" && x.tuitionUsd < 3300)).toBe(true);
    expect(portfolioStats({ ...p, portfolio: ids }).fees).toBeLessThanOrEqual(300);
  });
  test("balances all available estimate bands without falsifying classifications", () => {
    const p = { ...strong, exams: { ...strong.exams, gpa: { status: "received", score: 3.4 } }, targetApps: 6, feeBudgetUsd: 1200 };
    const ids = generateAbroadPortfolio(p);
    const mix = portfolioStats({ ...p, portfolio: ids }).byConfidence;
    expect(ids.length).toBe(6);
    expect(mix).toEqual({ safe: 2, target: 2, reach: 2 });
  });
  test("generation without exam results does not fabricate chance estimates", () => {
    const ids = generateAbroadPortfolio(EMPTY_ABROAD);
    expect(ids.length).toBeGreaterThan(0);
    expect(portfolioStats({ ...EMPTY_ABROAD, portfolio: ids }).unestimated).toBe(ids.length);
  });
  test("improvement deltas exactly match a single-score counterfactual", () => {
    const p = student({ ielts: { status: "received", score: 6 }, gpa: { status: "received", score: 3.8 } });
    const prog = abroadProgramById("tum-cs");
    const baseline = estimateAbroad(p, prog).pct;
    const improvement = improvementsFor(p, prog).find((x) => x.exam === "ielts");
    expect(improvement.from).toBe(6);
    expect(improvement.to).toBe(6.5);
    const next = estimateAbroad({ ...p, exams: { ...p.exams, ielts: { status: "expected", score: 6.5 } } }, prog).pct;
    expect(improvement.delta).toBe(next - baseline);
    expect(improvement.delta).toBeGreaterThan(0);
  });
});

const strong = student({
  ielts: { status: "received", score: 7.5 },
  sat: { status: "received", score: 1450 },
  gpa: { status: "received", score: 3.8 },
});

describe("Abroad estimate engine", () => {
  test("no exams means no estimate", () => {
    expect(strength(EMPTY_ABROAD)).toBeNull();
    expect(estimateAbroad(EMPTY_ABROAD, ABROAD_PROGRAMS[0])).toBeNull();
    expect(tipsFor(EMPTY_ABROAD, ABROAD_PROGRAMS[0])[0]).toContain("გამოცდების შედეგები");
  });
  test("estimates are deterministic and bounded", () => {
    for (const p of ABROAD_PROGRAMS.slice(0, 20)) {
      const a = estimateAbroad(strong, p);
      const b = estimateAbroad(strong, p);
      expect(a).toEqual(b);
      expect(a.pct).toBeGreaterThanOrEqual(5);
      expect(a.pct).toBeLessThanOrEqual(95);
    }
  });
  test("unmet English minimum caps the chance and produces a tip", () => {
    const weak = student({ ielts: { status: "received", score: 5.5 }, gpa: { status: "received", score: 3.9 } });
    const prog = abroadProgramById("oxford-cs");
    const est = estimateAbroad(weak, prog);
    expect(est.unmet).toContain("english");
    expect(est.pct).toBeLessThanOrEqual(15);
    expect(tipsFor(weak, prog).some((t) => t.includes("ინგლისურის მინიმუმი"))).toBe(true);
  });
  test("any one English test satisfies the requirement", () => {
    const toeflOnly = student({ toefl: { status: "received", score: 105 }, gpa: { status: "received", score: 3.9 } });
    expect(unmetRequirements(toeflOnly, abroadProgramById("tum-cs"))).not.toContain("english");
  });
  test("expected scores count; untaken exams do not", () => {
    const expected = student({ ielts: { status: "expected", score: 7 } });
    expect(englishStrength(expected)).not.toBeNull();
    expect(englishStrength(student({ ielts: { status: "none", score: null } }))).toBeNull();
  });
  test("stronger profiles estimate higher chances on the same program", () => {
    const prog = abroadProgramById("uva-psych");
    const weak = student({ ielts: { status: "received", score: 6.5 }, gpa: { status: "received", score: 3.1 } });
    expect(estimateAbroad(strong, prog).pct).toBeGreaterThan(estimateAbroad(weak, prog).pct);
  });
  test("portfolio stats track count, fees and confidence distribution", () => {
    const p = { ...strong, portfolio: ["tum-cs", "oxford-cs", "elte-cs"], targetApps: 8, feeBudgetUsd: 500 };
    const stats = portfolioStats(p);
    expect(stats.count).toBe(3);
    expect(stats.target).toBe(8);
    expect(stats.fees).toBe(75 + 90 + 100);
    expect(stats.budget).toBe(500);
    expect(stats.byConfidence.safe + stats.byConfidence.target + stats.byConfidence.reach).toBe(3);
  });
  test("approvedPortfolio snapshot wins and removals never refill", () => {
    const p = {
      ...strong,
      portfolio: ["tum-cs", "oxford-cs"],
      approvedPortfolio: ["tum-cs", "elte-cs", "uw-cs"],
      removed: ["uw-cs"],
    };
    expect(portfolioPrograms(p).map((x) => x.id)).toEqual(["tum-cs", "elte-cs"]);
  });
  test("upcoming deadlines are sorted soonest first", () => {
    const p = { ...strong, portfolio: ["elte-cs", "berkeley-cs", "tum-cs"] };
    const deadlines = upcomingDeadlines(p);
    expect(deadlines[0].program.id).toBe("berkeley-cs");
    expect(deadlines.map((d) => d.program.deadline)).toEqual([...deadlines.map((d) => d.program.deadline)].sort());
  });
});
