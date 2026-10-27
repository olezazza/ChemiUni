import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bookmark, Check, MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebStore } from "@/web/lib/store";
import { fieldName, universityById, type Program } from "../../../expo/lib/data";
import {
  estimate,
  buildList,
  formatTuition,
  CONFIDENCE_LABEL,
  isEligible,
} from "../../../expo/lib/engine";
import { abroadUniversityById, countryById, type AbroadProgram } from "../../../expo/lib/abroad-data";
import {
  estimateAbroad,
  formatTuitionUsd,
  portfolioPrograms,
  tipsFor,
} from "../../../expo/lib/abroad-engine";
export function ProgramCard({
  program,
  listed = false,
  rank,
}: {
  program: Program | AbroadProgram;
  listed?: boolean;
  rank?: number;
}) {
  const s = useWebStore();
  const abroad = "tuitionUsd" in program;
  const uni = abroad
    ? abroadUniversityById(program.universityId)
    : universityById(program.universityId);
  const est = abroad ? estimateAbroad(s.abroad, program) : estimate(s.profile, program);
  const ids = abroad
    ? portfolioPrograms(s.abroad).map((x) => x.id)
    : buildList(s.profile).map((x) => x.program.id);
  const added = ids.includes(program.id);
  const toggle = () => {
    if (abroad)
      s.updateAbroad((p) => ({
        ...p,
        approvedPortfolio: added ? ids.filter((id) => id !== program.id) : [...ids, program.id],
        removed: added
          ? [...new Set([...p.removed, program.id])]
          : p.removed.filter((id) => id !== program.id),
      }));
    else
      s.update((p) => ({
        ...p,
        listCreated: true,
        approvedList: added ? ids.filter((id) => id !== program.id) : [...ids, program.id],
        pinned: added
          ? p.pinned.filter((id) => id !== program.id)
          : [...new Set([...p.pinned, program.id])],
        removed: added
          ? [...new Set([...p.removed, program.id])]
          : p.removed.filter((id) => id !== program.id),
      }));
  };
  return (
    <article className="program-card bg-card text-card-foreground border border-border">
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow">
          {rank ? String(rank).padStart(2, "0") + " / " : ""}
          {fieldName(program.field)}
        </span>
        {est && <span className={`chance chance-${est.confidence}`}>{est.pct}%</span>}
      </div>
      <Link to="/program/$id" params={{ id: program.id }} className="program-title">
        {program.name}
        <ArrowUpRight className="size-4 shrink-0" />
      </Link>
      <p className="mt-2 text-sm text-muted-foreground">{uni.name}</p>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="size-3" />
        {uni.city}
        {abroad
          ? ` · ${countryById(abroadUniversityById(program.universityId).countryId).name}`
          : ""}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="tag">
          {abroad ? formatTuitionUsd(program.tuitionUsd) : formatTuition(program.tuition)}
        </span>
        {abroad && (
          <span className="tag">{program.english ? "100% English" : "ადგილობრივი ენა"}</span>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {est
          ? `${CONFIDENCE_LABEL[est.confidence]} · დემო`
          : "შეფასებისთვის მონაცემები არასაკმარისია"}
      </p>
      {abroad && (
        <p className="mt-2 text-xs text-muted-foreground">{tipsFor(s.abroad, program)[0]}</p>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-5">
        <Button variant="ghost" asChild>
          <Link to="/program/$id" params={{ id: program.id }}>
            დეტალები
            <ArrowUpRight />
          </Link>
        </Button>
        <Button
          variant={added ? "secondary" : "outline"}
          onClick={toggle}
          disabled={!abroad && !isEligible(s.profile, program)}
          aria-label={added ? `ამოიღე ${program.name}` : `დაამატე ${program.name}`}
        >
          {added ? listed ? <Trash2 /> : <Check /> : <Plus />}
          {added ? (listed ? "ამოღება" : "სიაშია") : "დამატება"}
        </Button>
      </div>
      {!abroad && listed && (
        <Button
          variant="ghost"
          className="mt-2"
          onClick={() =>
            s.update((p) => ({
              ...p,
              pinned: p.pinned.includes(program.id)
                ? p.pinned.filter((x) => x !== program.id)
                : [...p.pinned, program.id],
            }))
          }
        >
          <Bookmark />
          {s.profile.pinned.includes(program.id) ? "მონიშნულია" : "მონიშვნა"}
        </Button>
      )}
    </article>
  );
}
