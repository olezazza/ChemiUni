import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebStore } from "@/web/lib/store";
import { DemoNote, PageHeading } from "@/web/layout/AppShell";
import { ProgramCard } from "@/web/components/ProgramCard";
import { buildList, CONFIDENCE_LABEL } from "../../../expo/lib/engine";
import { generateAbroadPortfolio, portfolioPrograms, portfolioStats } from "../../../expo/lib/abroad-engine";

export function ListPage() {
  const s = useWebStore(),
    abroad = s.mode === "abroad",
    stats = portfolioStats(s.abroad);
  const list = abroad
    ? portfolioPrograms(s.abroad)
    : s.profile.listCreated
      ? buildList(s.profile).map((x) => x.program)
      : [];
  const generate = () => {
    if (list.length && !confirm("შეიქმნას ახალი სია? არსებული არჩევანი შეიცვლება.")) return;
    if (abroad)
      s.updateAbroad((p) => ({
        ...p,
        portfolio: generateAbroadPortfolio(p),
        approvedPortfolio: generateAbroadPortfolio(p),
      }));
    else
      s.update((p) => {
        const next = { ...p, listCreated: true };
        delete next.approvedList;
        return next;
      });
  };
  return (
    <>
      <PageHeading
        eyebrow={abroad ? "შენი განაცხადების გეგმა" : "შენი პრიორიტეტები"}
        title={abroad ? "ჩემი პორტფოლიო" : "ჩემი სია"}
      >
        <Button asChild disabled={!list.length}>
          <Link to="/counselor">
            <Sparkles />
            AI კონსულტანტი
          </Link>
        </Button>
      </PageHeading>
      <DemoNote />
      {abroad && (
        <section className="portfolio-summary">
          <div>
            <strong>
              {stats.count} / {stats.target}
            </strong>
            <span>განაცხადები</span>
          </div>
          <div>
            <strong>
              ${stats.fees} / ${stats.budget}
            </strong>
            <span>გაგზავნის ბიუჯეტი</span>
          </div>
          {(["reach", "target", "safe"] as const).map((c) => (
            <div key={c}>
              <strong className={`text-${c}`}>{stats.byConfidence[c]}</strong>
              <span>{CONFIDENCE_LABEL[c]}</span>
            </div>
          ))}
          {stats.unestimated > 0 && <p>{stats.unestimated} შეფასების გარეშე</p>}
        </section>
      )}
      <div className="flex gap-3 flex-wrap my-6">
        <Button variant="outline" onClick={generate}>
          <ListChecks />
          {list.length ? "სიის ხელახლა შექმნა" : "სიის შექმნა"}
        </Button>
        <Button asChild variant="ghost">
          <Link to="/profile">
            ქულები და პრიორიტეტები
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="program-grid">
        {list.map((p, i) => (
          <ProgramCard key={p.id} program={p} listed rank={i + 1} />
        ))}
      </div>
      {!list.length && (
        <div className="empty-state">
          <h2>შენი არჩევანი აქ გამოჩნდება</h2>
          <Button asChild>
            <Link to="/setup">შეავსე შენი პროფილი</Link>
          </Button>
        </div>
      )}
    </>
  );
}
