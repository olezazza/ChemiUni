import { SCHOLARSHIPS, abroadUniversityById, type AbroadProgram } from "./abroad-data";

// Coastal urban areas, not a promise of campus beach distance.
const COASTAL_UNIVERSITIES = new Set(["ubc", "nus", "utokyo", "berkeley"]);
export function isCoastalProgram(p: AbroadProgram) { return COASTAL_UNIVERSITIES.has(p.universityId); }
export function fundingLeads(p: AbroadProgram) {
  const country = abroadUniversityById(p.universityId).countryId;
  return SCHOLARSHIPS.filter((s) => s.forGeorgians && (s.countryId === country || s.countryId === "global"));
}
export function advisingIntent(text: string) {
  return {
    coastal: /coast|beach|ocean|სანაპირო|ზღვის|პლაჟ/i.test(text),
    cheaper: /cheap|budget|afford|free|იაფ|ბიუჯეტ|უფასო/i.test(text),
    scholarship: /scholar|funding|aid|სტიპენდი|დაფინანს/i.test(text),
  };
}