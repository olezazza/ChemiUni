import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebStore } from "@/web/lib/store";
import { DemoNote, PageHeading } from "@/web/layout/AppShell";
import { ProgramCard } from "@/web/components/ProgramCard";
import { PROGRAMS, UNIVERSITIES } from "../../../expo/lib/data";
import { buildList } from "../../../expo/lib/engine";
import { ABROAD_UNIVERSITIES, formatDeadline } from "../../../expo/lib/abroad-data";
import { portfolioPrograms, portfolioStats, upcomingDeadlines, topMatches } from "../../../expo/lib/abroad-engine";

export function HomePage() {
  const s = useWebStore(),
    abroad = s.mode === "abroad";
  const list = abroad ? portfolioPrograms(s.abroad) : buildList(s.profile).map((x) => x.program);
  const stats = portfolioStats(s.abroad);
  const suggestions = abroad ? topMatches(s.abroad) : list.slice(0, 3);
  return (
    <>
      <PageHeading
        eyebrow={abroad ? "შენი გლობალური გზა" : "შენი სასწავლო გზა"}
        title={
          s.profile.account.name && !abroad
            ? `გამარჯობა, ${s.profile.account.name}`
            : "შენი შემდეგი ნაბიჯი"
        }
      >
        <Button asChild>
          <Link to="/profile">
            პროფილი
            <ArrowRight />
          </Link>
        </Button>
      </PageHeading>
      <DemoNote />
      <section className="dashboard-intro">
        <div>
          <h2>{abroad ? "მსოფლიო შესაძლებლობებით იწყება." : "შენი არჩევანი, შენი მომავალი."}</h2>
          <p className="text-muted-foreground mt-4">
            {abroad
              ? "უნივერსიტეტები, სტიპენდიები და შენი განაცხადების გეგმა."
              : "პროგრამები და პერსონალური სია შენი ქულების მიხედვით."}
          </p>
          <Button asChild className="mt-6">
            <Link to={abroad ? "/my-list" : s.profile.listCreated ? "/my-list" : "/setup"}>
              <ListChecks />
              {abroad ? "ჩემი პორტფოლიო" : "ჩემი სია"}
            </Link>
          </Button>
        </div>
        <div className="stats-grid">
          <div>
            <strong>{list.length}</strong>
            <span>{abroad ? "დაგეგმილი განაცხადი" : "პროგრამა შენს სიაში"}</span>
          </div>
          <div>
            <strong>{abroad ? ABROAD_UNIVERSITIES.length : UNIVERSITIES.length}</strong>
            <span>უნივერსიტეტი · დემო</span>
          </div>
          <div>
            <strong>{abroad ? `$${stats.fees}` : PROGRAMS.length}</strong>
            <span>{abroad ? `გაგზავნის ხარჯი / $${stats.budget}` : "პროგრამა კატალოგში"}</span>
          </div>
        </div>
      </section>
      {abroad && (
        <section className="section-block">
          <h2 className="flex gap-2 items-center">
            <CalendarDays />
            მოახლოებული ვადები · დემო
          </h2>
          <div className="deadline-list">
            {upcomingDeadlines(s.abroad).map((x) => (
              <Link key={x.program.id} to="/program/$id" params={{ id: x.program.id }}>
                <span>
                  {x.program.name}
                  <small>{x.university.name}</small>
                </span>
                <strong>{formatDeadline(x.program.deadline)}</strong>
                <ArrowRight />
              </Link>
            ))}
          </div>
          {!list.length && (
            <Button asChild variant="outline">
              <Link to="/setup">შექმენი განაცხადების გეგმა</Link>
            </Button>
          )}
        </section>
      )}
      <section className="section-block">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 className="min-w-0">{abroad ? "შენთვის შერჩეული" : "შენი არჩევანიდან"}</h2>
          <Button asChild variant="ghost">
            <Link to="/explore">
              ყველა პროგრამა
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="program-grid">
          {suggestions.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
        {!suggestions.length && (
          <Button asChild>
            <Link to="/setup">შეიყვანე ქულები</Link>
          </Button>
        )}
      </section>
    </>
  );
}
