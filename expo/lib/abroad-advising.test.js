import { expect, test } from "bun:test";
import { abroadCounselorContext } from "./abroad-counselor";
import { isCoastalProgram, fundingLeads } from "./abroad-advising";
import { abroadProgramById } from "./abroad-data";
import { EMPTY_ABROAD } from "./abroad-types";
import { scholarshipDetails } from "./scholarship-details";
import { SCHOLARSHIPS } from "./abroad-data";

test("coastal request brings grounded coastal programs into the bounded candidates", () => {
  const context = abroadCounselorContext(EMPTY_ABROAD, "prefer coastal/beach cities");
  expect(context.programs.length).toBeLessThanOrEqual(18);
  expect(context.programs.some((p) => isCoastalProgram(abroadProgramById(p.id)))).toBe(true);
  expect(isCoastalProgram(abroadProgramById("tum-cs"))).toBe(false);
});
test("funding leads are actual country or global demo rows, not guaranteed program awards", () => {
  expect(fundingLeads(abroadProgramById("elte-cs")).some((s) => s.id === "hungaricum")).toBe(true);
  expect(fundingLeads(abroadProgramById("elte-cs")).some((s) => s.id === "daad")).toBe(false);
});
test("every scholarship has a complete coverage and document checklist with unknown insurance explicit", () => {
  for (const s of SCHOLARSHIPS) {
    const detail = scholarshipDetails(s);
    expect(detail.coverage.length).toBe(4);
    expect(detail.documents.length).toBeGreaterThanOrEqual(4);
    expect(detail.coverage[3].value).toContain("არ არის მითითებული");
  }
  expect(scholarshipDetails(SCHOLARSHIPS.find((s) => s.id === "chemiuni-travel")).url).toBeNull();
});