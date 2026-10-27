// Illustrative estimate engine for Abroad Mode. NOT a real admission prediction:
// a deterministic demo score on a 0–100 scale, used only to demonstrate the UI.
import {
  ABROAD_PROGRAMS,
  abroadProgramById,
  abroadUniversityById,
  countryById,
  type AbroadProgram,
} from "./abroad-data";
import { DEMO_USD_PER_EUR, STUDY_BUDGET_OPTIONS, EXAM_META, type AbroadProfile, type ExamKind } from "./abroad-types";
import { confidenceOf, type Confidence } from "./engine";

export { confidenceOf };
export type { Confidence };

export function examValue(p: AbroadProfile, kind: ExamKind): number | null {
  const e = p.exams[kind];
  return e.status === "none" || e.score == null ? null : e.score;
}

const norm = (kind: ExamKind, v: number) => Math.min(100, (v / EXAM_META[kind].max) * 100);

/** Best available English-test score on a 0–100 demo scale. */
export function englishStrength(p: AbroadProfile): number | null {
  const vals = (["ielts", "toefl", "duolingo"] as const)
    .map((k) => {
      const v = examValue(p, k);
      return v == null ? null : norm(k, v);
    })
    .filter((v): v is number => v != null);
  return vals.length ? Math.max(...vals) : null;
}

/** Best available SAT/ACT score on a 0–100 demo scale. */
export function academicStrength(p: AbroadProfile): number | null {
  const vals = (["sat", "act"] as const)
    .map((k) => {
      const v = examValue(p, k);
      return v == null ? null : norm(k, v);
    })
    .filter((v): v is number => v != null);
  return vals.length ? Math.max(...vals) : null;
}

/** Weighted student strength: GPA 40%, English 30%, SAT/ACT 30%; missing weights redistribute. */
export function strength(p: AbroadProfile): number | null {
  const gpa = examValue(p, "gpa");
  const parts: [number, number][] = [];
  if (gpa != null) parts.push([norm("gpa", gpa), 40]);
  const en = englishStrength(p);
  if (en != null) parts.push([en, 30]);
  const ac = academicStrength(p);
  if (ac != null) parts.push([ac, 30]);
  if (!parts.length) return null;
  const w = parts.reduce((a, [, x]) => a + x, 0);
  return parts.reduce((a, [v, x]) => a + v * x, 0) / w;
}

export type UnmetReq = "english" | "sat" | "gpa";

/** Requirements the student does not currently meet (or has not taken). */
export function unmetRequirements(p: AbroadProfile, prog: AbroadProgram): UnmetReq[] {
  const unmet: UnmetReq[] = [];
  const en = prog.reqs.english;
  if (en) {
    const ok =
      (en.ielts != null && (examValue(p, "ielts") ?? -1) >= en.ielts) ||
      (en.toefl != null && (examValue(p, "toefl") ?? -1) >= en.toefl) ||
      (en.duolingo != null && (examValue(p, "duolingo") ?? -1) >= en.duolingo);
    if (!ok) unmet.push("english");
  }
  if (prog.reqs.sat != null || prog.reqs.act != null) {
    const ok =
      (prog.reqs.sat != null && (examValue(p, "sat") ?? -1) >= prog.reqs.sat) ||
      (prog.reqs.act != null && (examValue(p, "act") ?? -1) >= prog.reqs.act);
    if (!ok) unmet.push("sat");
  }
  if (prog.reqs.gpa != null && (examValue(p, "gpa") ?? -1) < prog.reqs.gpa) unmet.push("gpa");
  return unmet;
}

export type AbroadEstimate = { pct: number; confidence: Confidence; unmet: UnmetReq[] } | null;

export function estimateAbroad(p: AbroadProfile, prog: AbroadProgram): AbroadEstimate {
  const s = strength(p);
  if (s == null) return null;
  const selectivity = 100 - prog.acceptanceRate;
  const unmet = unmetRequirements(p, prog);
  let pct = 100 / (1 + Math.exp(-(s - selectivity) / 6));
  if (unmet.length) pct = Math.min(pct, 15);
  pct = Math.max(5, Math.min(95, Math.round(pct)));
  return { pct, confidence: confidenceOf(pct), unmet };
}

const ENGLISH_LABEL = (prog: AbroadProgram) => {
  const en = prog.reqs.english;
  if (!en) return "";
  const parts = [
    en.ielts != null ? `IELTS ${en.ielts}` : null,
    en.toefl != null ? `TOEFL ${en.toefl}` : null,
    en.duolingo != null ? `Duolingo ${en.duolingo}` : null,
  ].filter(Boolean);
  return parts.join(" / ");
};

/** Actionable, deterministic tips: what to improve for this program. */
export function tipsFor(p: AbroadProfile, prog: AbroadProgram): string[] {
  const tips: string[] = [];
  const est = estimateAbroad(p, prog);
  if (!est) return ["შეიყვანე გამოცდების შედეგები პროფილში, რომ შეფასება და რჩევები გამოჩნდეს."];
  for (const u of est.unmet) {
    if (u === "english") tips.push(`ინგლისურის მინიმუმი: ${ENGLISH_LABEL(prog)} — გააუმჯობესე ენის ქულა.`);
    if (u === "sat")
      tips.push(
        `საჭიროა SAT ${prog.reqs.sat ?? "—"}${prog.reqs.act != null ? ` ან ACT ${prog.reqs.act}` : ""} — დაამატე ან გაზარდე ქულა.`,
      );
    if (u === "gpa") tips.push(`მინიმალური GPA ${prog.reqs.gpa} — გააუმჯობესე სასკოლო ქულები.`);
  }
  if (!est.unmet.length && est.pct < 70) {
    const en = englishStrength(p);
    if (en != null && en < 90) tips.push("ინგლისურის უფრო მაღალი ქულა შანსს შეუმჩნევლად გაზრდის.");
    const ac = academicStrength(p);
    if (prog.reqs.sat == null && ac == null) tips.push("SAT/ACT არ არის სავალდებულო, მაგრამ ძლიერი ქულა განაცხადს გააძლიერებს.");
    if (est.pct < 40) tips.push("დაამატე უფრო უსაფრთხო ვარიანტები მსგავსი სფეროდან.");
  }
  const improvements = improvementsFor(p, prog).map((x) =>
    `${EXAM_META[x.exam].label}: ${x.from ?? "ჯერ არ არის"} → ${x.to}; დემო შეფასება ${est.pct}% → ${x.pct}% (+${x.delta} პროცენტული პუნქტი).`,
  );
  return [...improvements, ...tips].slice(0, 3);
}

/** Single-score counterfactuals calculated with the unchanged demo engine. */
export function improvementsFor(p: AbroadProfile, prog: AbroadProgram) {
  const baseline = estimateAbroad(p, prog);
  if (!baseline) return [];
  const targets: Partial<Record<ExamKind, number>> = {
    ielts: prog.reqs.english?.ielts,
    toefl: prog.reqs.english?.toefl,
    duolingo: prog.reqs.english?.duolingo,
    sat: prog.reqs.sat,
    act: prog.reqs.act,
    gpa: prog.reqs.gpa,
  };
  const steps: Record<ExamKind, number> = { ielts: 0.5, toefl: 5, duolingo: 5, sat: 100, act: 2, gpa: 0.2 };
  return (Object.keys(targets) as ExamKind[]).flatMap((exam) => {
    const from = examValue(p, exam);
    const requirement = targets[exam];
    if (requirement == null || (from == null && exam !== "ielts" && exam !== "gpa" && exam !== "sat")) return [];
    const to = Math.min(EXAM_META[exam].max, Math.round(Math.max(requirement, (from ?? 0) + steps[exam]) * 10) / 10);
    if (from != null && to <= from) return [];
    const next = estimateAbroad({ ...p, exams: { ...p.exams, [exam]: { status: "expected", score: to } } }, prog);
    if (!next || next.pct <= baseline.pct) return [];
    return [{ exam, from, to, pct: next.pct, delta: next.pct - baseline.pct }];
  }).sort((a, b) => b.delta - a.delta).slice(0, 3);
}

export function matchesStudyBudget(p: AbroadProfile, prog: AbroadProgram) {
  const option = STUDY_BUDGET_OPTIONS.find((x) => x.id === p.studyBudget);
  if (!option || option.maxEur === null) return true;
  const ceilingUsd = Math.round(option.maxEur * DEMO_USD_PER_EUR * 100) / 100;
  if (option.id === "under-3000") return prog.tuitionUsd < ceilingUsd;
  return prog.tuitionUsd <= ceilingUsd;
}

/** A saved snapshot, generated only by explicit actions; never refills approved removals. */
export function generateAbroadPortfolio(p: AbroadProfile): string[] {
  const candidates = ABROAD_PROGRAMS.filter((x) =>
    x.english && !p.removed.includes(x.id) && matchesCountries(p, x) && matchesInterests(p, x) && matchesStudyBudget(p, x),
  ).map((program) => ({ program, estimate: estimateAbroad(p, program) }))
    .sort((a, b) => a.program.appFeeUsd - b.program.appFeeUsd ||
      (b.estimate?.pct ?? 0) - (a.estimate?.pct ?? 0) || a.program.id.localeCompare(b.program.id));
  const result: string[] = [];
  let fees = 0;
  const groups: (Confidence | null)[] = ["reach", "target", "safe", null];
  while (result.length < p.targetApps) {
    let added = false;
    for (const group of groups) {
      if (result.length >= p.targetApps) break;
      const item = candidates.find((x) => !result.includes(x.program.id) &&
        (x.estimate?.confidence ?? null) === group && fees + x.program.appFeeUsd <= p.feeBudgetUsd);
      if (!item) continue;
      result.push(item.program.id);
      fees += item.program.appFeeUsd;
      added = true;
    }
    if (!added) break;
  }
  return result;
}

export function matchesCountries(p: AbroadProfile, prog: AbroadProgram) {
  if (!p.countries.length) return true;
  return p.countries.includes(abroadUniversityById(prog.universityId).countryId);
}

export function matchesInterests(p: AbroadProfile, prog: AbroadProgram) {
  if (!p.interests.length) return true;
  return p.interests.includes(prog.field);
}

/** Programs the user tracks as planned applications. */
export function portfolioPrograms(p: AbroadProfile): AbroadProgram[] {
  const ids = p.approvedPortfolio ?? p.portfolio;
  return [...new Set(ids)]
    .filter((id) => !p.removed.includes(id))
    .map((id) => abroadProgramById(id))
    .filter((x): x is AbroadProgram => !!x);
}

export type PortfolioStats = {
  count: number;
  target: number;
  fees: number;
  budget: number;
  byConfidence: Record<Confidence, number>;
  unestimated: number;
};

export function portfolioStats(p: AbroadProfile): PortfolioStats {
  const programs = portfolioPrograms(p);
  const byConfidence: Record<Confidence, number> = { safe: 0, target: 0, reach: 0 };
  let unestimated = 0;
  for (const prog of programs) {
    const est = estimateAbroad(p, prog);
    if (est) byConfidence[est.confidence]++;
    else unestimated++;
  }
  return {
    count: programs.length,
    target: p.targetApps,
    fees: programs.reduce((a, x) => a + x.appFeeUsd, 0),
    budget: p.feeBudgetUsd,
    byConfidence,
    unestimated,
  };
}

/** Next application deadlines across the portfolio, soonest first. */
export function upcomingDeadlines(p: AbroadProfile, limit = 3) {
  return portfolioPrograms(p)
    .slice()
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, limit)
    .map((prog) => ({
      program: prog,
      university: abroadUniversityById(prog.universityId),
      country: countryById(abroadUniversityById(prog.universityId).countryId),
    }));
}

/** Top suggested programs by demo chance, respecting interests and countries. */
export function topMatches(p: AbroadProfile, limit = 3): AbroadProgram[] {
  return ABROAD_PROGRAMS.filter(
    (prog) => !portfolioPrograms(p).some((x) => x.id === prog.id) && matchesCountries(p, prog) && matchesInterests(p, prog) && matchesStudyBudget(p, prog),
  )
    .map((prog) => ({ prog, pct: estimateAbroad(p, prog)?.pct ?? 30 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit)
    .map((x) => x.prog);
}

export const formatTuitionUsd = (t: number) => (t === 0 ? "სწავლა უფასოა (დემო)" : `$${t.toLocaleString("en-US")} / წელი`);
