import { ABROAD_PROGRAMS, abroadProgramById } from "./abroad-data";
import { estimateAbroad, matchesCountries, matchesStudyBudget, portfolioPrograms } from "./abroad-engine";
import { advisingIntent, fundingLeads, isCoastalProgram } from "./abroad-advising";
import type { AbroadProfile } from "./abroad-types";
import type { Proposal, CounselorMessage } from "./counselor-types";

export function validateAbroadProposal(p: AbroadProfile, proposal: Proposal): string | null {
  if (!portfolioPrograms(p).length && proposal.action !== "add") return "პორტფოლიო ჯერ ცარიელია.";
  if (proposal.status !== "pending") return "ეს შეთავაზება უკვე განხილულია.";
  const ids = portfolioPrograms(p).map((x) => x.id);
  if (!["add", "remove", "replace"].includes(proposal.action)) return "უცნობი მოქმედება.";
  if (proposal.action !== "add" && (!proposal.targetId || !ids.includes(proposal.targetId)))
    return "პროგრამა პორტფოლიოში აღარ არის.";
  if (proposal.action === "add" && proposal.targetId !== null) return "არასწორი დამატება.";
  if (proposal.action === "remove" && proposal.programId !== null) return "არასწორი ამოღება.";
  if (proposal.action !== "remove") {
    const program = abroadProgramById(proposal.programId ?? "");
    if (!program) return "პროგრამა ვერ მოიძებნა.";
    if (ids.includes(program.id)) return "ეს პროგრამა უკვე პორტფოლიოშია.";
  }
  return null;
}

/** One pure transaction: portfolio changes and decisions are saved together by StoreProvider. */
export function decideAbroadProposals(
  p: AbroadProfile,
  proposalIds: string[],
  accept: boolean,
  confirmRemoval = false,
): AbroadProfile {
  let next = p;
  const messages = p.counselor?.messages ?? [];
  const results = new Map<string, Proposal>();
  for (const message of messages)
    for (const proposal of message.proposals) {
      if (!proposalIds.includes(proposal.id) || proposal.status !== "pending" || results.has(proposal.id))
        continue;
      if (!accept) {
        results.set(proposal.id, { ...proposal, status: "rejected" });
        continue;
      }
      if (proposal.action === "remove" && !confirmRemoval) continue;
      const notice = validateAbroadProposal(next, proposal);
      if (notice) {
        results.set(proposal.id, { ...proposal, status: "stale", notice });
        continue;
      }
      let ids = portfolioPrograms(next).map((x) => x.id);
      if (proposal.action === "add" && proposal.programId) ids = [...ids, proposal.programId];
      if (proposal.action === "remove") ids = ids.filter((id) => id !== proposal.targetId);
      if (proposal.action === "replace" && proposal.programId) {
        const replacement = proposal.programId;
        ids = ids.map((id) => (id === proposal.targetId ? replacement : id));
      }
      next = {
        ...next,
        approvedPortfolio: ids,
        removed: [
          ...new Set([
            ...next.removed.filter((id) => id !== proposal.programId),
            ...(proposal.targetId ? [proposal.targetId] : []),
          ]),
        ],
      };
      results.set(proposal.id, { ...proposal, status: "accepted" });
    }
  return {
    ...next,
    counselor: {
      messages: messages.map((m) => ({
        ...m,
        proposals: m.proposals.map((x) => results.get(x.id) ?? x),
      })),
    },
  };
}

/** Candidates beyond the current portfolio that are sent as grounded options per request. */
export const ABROAD_CANDIDATE_LIMIT = 18;

export function abroadCounselorContext(p: AbroadProfile, text = "") {
  const intent = advisingIntent(text);
  const portfolio = portfolioPrograms(p).map((x) => x.id);
  const decisions = (p.counselor?.messages ?? [])
    .flatMap((m) =>
      m.proposals.map((x) => ({
        action: x.action,
        targetId: x.targetId,
        programId: x.programId,
        status: x.status,
      })),
    )
    .slice(-20);
  const compact = (program: (typeof ABROAD_PROGRAMS)[number]) => {
    const est = estimateAbroad(p, program);
    return { id: program.id, assessment: est ? { pct: est.pct, unmet: est.unmet } : null };
  };
  const candidates = ABROAD_PROGRAMS.filter(
    (program) => !portfolio.includes(program.id) && matchesCountries(p, program),
  )
    .map((program) => ({
      program,
      rank:
        (p.interests.includes(program.field) ? 200 : 0) +
        (matchesStudyBudget(p, program) ? 100 : 0) +
        (intent.coastal && isCoastalProgram(program) ? 1000 : 0) +
        (intent.scholarship ? fundingLeads(program).length * 30 : 0) +
        (intent.cheaper ? 200 / (1 + program.tuitionUsd / 1000) : 0) +
        (program.english ? 50 : 0) +
        (estimateAbroad(p, program)?.pct ?? 0),
    }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, ABROAD_CANDIDATE_LIMIT)
    .map((x) => x.program);
  const listed = portfolio.map((id) => abroadProgramById(id)).filter((x) => !!x);
  return {
    gradYear: p.gradYear,
    interests: p.interests,
    countries: p.countries,
    exams: p.exams,
    targetApps: p.targetApps,
    feeBudgetUsd: p.feeBudgetUsd,
    studyBudget: p.studyBudget ?? "flexible",
    portfolio,
    programs: [...listed, ...candidates].map(compact),
    decisions,
  };
}

export function parseAbroadCounselorReply(raw: unknown, p: AbroadProfile, messageId: string): CounselorMessage {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("message" in raw) ||
    typeof raw.message !== "string" ||
    !raw.message.trim() ||
    raw.message.length > 4000 ||
    !("proposals" in raw) ||
    !Array.isArray(raw.proposals) ||
    raw.proposals.length > 6
  )
    throw new Error("invalid reply");
  const seen = new Set<string>();
  const proposals: Proposal[] = raw.proposals.map((value: unknown, index: number) => {
    if (
      !value ||
      typeof value !== "object" ||
      !("action" in value) ||
      !("targetId" in value) ||
      !("programId" in value) ||
      !("reason" in value)
    )
      throw new Error("invalid proposal");
    if (value.action !== "add" && value.action !== "remove" && value.action !== "replace")
      throw new Error("invalid action");
    if (
      (value.targetId !== null && typeof value.targetId !== "string") ||
      (value.programId !== null && typeof value.programId !== "string") ||
      typeof value.reason !== "string" ||
      !value.reason.trim() ||
      value.reason.length > 1000
    )
      throw new Error("invalid fields");
    const proposal: Proposal = {
      id: `${messageId}.${index}`,
      action: value.action,
      targetId: value.targetId,
      programId: value.programId,
      reason: value.reason,
      status: "pending",
    };
    const key = `${proposal.action}:${proposal.targetId}:${proposal.programId}`;
    if (seen.has(key)) throw new Error("duplicate proposal");
    seen.add(key);
    const notice = validateAbroadProposal(p, proposal);
    return notice ? { ...proposal, status: "stale", notice } : proposal;
  });
  return {
    id: messageId,
    role: "assistant",
    parts: [{ type: "text", text: raw.message }],
    proposals,
  };
}
