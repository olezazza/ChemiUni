import type { FieldId } from "./data";
import type { CounselorState } from "./counselor-types";

export type ExamKind = "ielts" | "toefl" | "duolingo" | "sat" | "act" | "gpa";
export type AbroadExamStatus = "received" | "expected" | "none";
export type ExamEntry = { status: AbroadExamStatus; score: number | null };

export const EXAM_ORDER: ExamKind[] = ["ielts", "toefl", "duolingo", "sat", "act", "gpa"];

export const EXAM_META: Record<ExamKind, { label: string; max: number; placeholder: string }> = {
  ielts: { label: "IELTS", max: 9, placeholder: "0–9" },
  toefl: { label: "TOEFL iBT", max: 120, placeholder: "0–120" },
  duolingo: { label: "Duolingo", max: 160, placeholder: "0–160" },
  sat: { label: "SAT", max: 1600, placeholder: "400–1600" },
  act: { label: "ACT", max: 36, placeholder: "1–36" },
  gpa: { label: "GPA", max: 4, placeholder: "0–4.0" },
};

export const ABROAD_EXAM_STATUS_LABEL: Record<AbroadExamStatus, string> = {
  received: "მიღებული მაქვს",
  expected: "მოსალოდნელი",
  none: "ჯერ არ მაქვს",
};

export const STUDY_BUDGET_OPTIONS = [
  { id: "free", label: "მხოლოდ უფასო", maxEur: 0 },
  { id: "under-3000", label: "€3,000-მდე", maxEur: 3000 },
  { id: "3000-10000", label: "€3,000–€10,000", maxEur: 10000 },
  { id: "10000-25000", label: "€10,000–€25,000", maxEur: 25000 },
  { id: "flexible", label: "მოქნილი", maxEur: null },
] as const;
export type StudyBudget = (typeof STUDY_BUDGET_OPTIONS)[number]["id"];
// Illustrative conversion for the USD demo catalog, not a live exchange rate.
export const DEMO_USD_PER_EUR = 1.1;

export type AbroadProfile = {
  setupDone: boolean;
  gradYear: string;
  interests: FieldId[];
  countries: string[];
  exams: Record<ExamKind, ExamEntry>;
  targetApps: number;
  feeBudgetUsd: number;
  studyBudget?: StudyBudget;
  portfolio: string[];
  approvedPortfolio?: string[];
  removed: string[];
  counselor?: CounselorState;
};

const noExam = (): ExamEntry => ({ status: "none", score: null });

export const EMPTY_ABROAD: AbroadProfile = {
  setupDone: false,
  gradYear: "",
  interests: [],
  countries: [],
  exams: { ielts: noExam(), toefl: noExam(), duolingo: noExam(), sat: noExam(), act: noExam(), gpa: noExam() },
  targetApps: 8,
  feeBudgetUsd: 500,
  studyBudget: "flexible",
  portfolio: [],
  removed: [],
};

export const FEE_BUDGET_OPTIONS = [300, 500, 800, 1200];
