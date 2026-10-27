import { describe, expect, test } from "bun:test";
import {
  ABROAD_COUNTRIES,
  ABROAD_PROGRAMS,
  ABROAD_UNIVERSITIES,
  SCHOLARSHIPS,
  abroadProgramById,
  abroadUniversityById,
  countryById,
} from "./abroad-data";
import { FIELDS } from "./data";

describe("Abroad demo dataset", () => {
  test("contains 45–50 institutions", () => {
    expect(ABROAD_UNIVERSITIES.length).toBeGreaterThanOrEqual(45);
    expect(ABROAD_UNIVERSITIES.length).toBeLessThanOrEqual(50);
  });
  test("contains 120–150 complete programs", () => {
    expect(ABROAD_PROGRAMS.length).toBeGreaterThanOrEqual(120);
    expect(ABROAD_PROGRAMS.length).toBeLessThanOrEqual(150);
    for (const p of ABROAD_PROGRAMS) {
      for (const key of ["id", "universityId", "name", "degree", "blurb", "deadline"])
        expect(p[key].trim().length).toBeGreaterThan(0);
      expect(FIELDS.some((f) => f.id === p.field)).toBe(true);
      expect(typeof p.english).toBe("boolean");
      expect(p.tuitionUsd).toBeGreaterThanOrEqual(0);
      expect(p.acceptanceRate).toBeGreaterThan(0);
      expect(p.acceptanceRate).toBeLessThanOrEqual(95);
      expect(p.appFeeUsd).toBeGreaterThanOrEqual(0);
      expect(/^\d{4}-\d{2}-\d{2}$/.test(p.deadline)).toBe(true);
    }
  });
  test("has unique stable IDs and valid references", () => {
    expect(new Set(ABROAD_UNIVERSITIES.map((u) => u.id)).size).toBe(ABROAD_UNIVERSITIES.length);
    expect(new Set(ABROAD_PROGRAMS.map((p) => p.id)).size).toBe(ABROAD_PROGRAMS.length);
    expect(new Set(ABROAD_PROGRAMS.map((p) => `${p.universityId}:${p.name}`)).size).toBe(ABROAD_PROGRAMS.length);
    for (const u of ABROAD_UNIVERSITIES) {
      expect(ABROAD_COUNTRIES.some((c) => c.id === u.countryId)).toBe(true);
      expect(ABROAD_PROGRAMS.some((p) => p.universityId === u.id)).toBe(true);
    }
    for (const p of ABROAD_PROGRAMS) expect(abroadUniversityById(p.universityId).id).toBe(p.universityId);
  });
  test("exam requirements stay within each test's scale", () => {
    for (const p of ABROAD_PROGRAMS) {
      const en = p.reqs.english;
      if (en) {
        if (en.ielts != null) expect(en.ielts).toBeLessThanOrEqual(9);
        if (en.toefl != null) expect(en.toefl).toBeLessThanOrEqual(120);
        if (en.duolingo != null) expect(en.duolingo).toBeLessThanOrEqual(160);
      }
      if (p.reqs.sat != null) expect(p.reqs.sat).toBeLessThanOrEqual(1600);
      if (p.reqs.act != null) expect(p.reqs.act).toBeLessThanOrEqual(36);
      if (p.reqs.gpa != null) expect(p.reqs.gpa).toBeLessThanOrEqual(4);
    }
  });
  test("every country has programs and lookups work", () => {
    for (const c of ABROAD_COUNTRIES) {
      expect(ABROAD_PROGRAMS.some((p) => abroadUniversityById(p.universityId).countryId === c.id)).toBe(true);
    }
    expect(countryById("de").name).toBe("გერმანია");
    expect(abroadProgramById("tum-cs")?.universityId).toBe("tum");
    expect(abroadProgramById("nonexistent")).toBeUndefined();
  });
  test("scholarships are complete and mostly open to Georgian students", () => {
    expect(SCHOLARSHIPS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(SCHOLARSHIPS.map((s) => s.id)).size).toBe(SCHOLARSHIPS.length);
    for (const s of SCHOLARSHIPS) {
      expect(s.name.trim().length).toBeGreaterThan(0);
      expect(s.eligibility.trim().length).toBeGreaterThan(0);
      expect(["full-ride", "tuition", "stipend"]).toContain(s.awardType);
      expect(/^\d{4}-\d{2}-\d{2}$/.test(s.deadline)).toBe(true);
      if (s.countryId !== "global") expect(ABROAD_COUNTRIES.some((c) => c.id === s.countryId)).toBe(true);
    }
    expect(SCHOLARSHIPS.filter((s) => s.forGeorgians).length).toBeGreaterThanOrEqual(18);
  });
  test("most programs are 100% English-taught and tagged consistently", () => {
    const english = ABROAD_PROGRAMS.filter((p) => p.english);
    expect(english.length).toBeGreaterThan(ABROAD_PROGRAMS.length * 0.8);
    // English-taught programs must state an English-test requirement.
    for (const p of english) expect(p.reqs.english).toBeDefined();
  });
});
