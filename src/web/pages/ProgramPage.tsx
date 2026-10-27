import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebStore } from "@/web/lib/store";
import { DemoNote, PageHeading, BackLink } from "@/web/layout/AppShell";
import { ProgramCard } from "@/web/components/ProgramCard";
import { SUBJECTS, programById, universityById, fieldName } from "../../../expo/lib/data";
import { improvements, formatTuition } from "../../../expo/lib/engine";
import { abroadProgramById, abroadUniversityById, formatDeadline } from "../../../expo/lib/abroad-data";
import { tipsFor, formatTuitionUsd } from "../../../expo/lib/abroad-engine";

export function ProgramPage({ id }: { id: string }) {
  const s = useWebStore(),
    p = s.mode === "abroad" ? abroadProgramById(id) : programById(id);
  if (!p)
    return (
      <>
        <BackLink />
        <h1>პროგრამა ვერ მოიძებნა</h1>
      </>
    );
  const abroad = "tuitionUsd" in p,
    uni = abroad ? abroadUniversityById(p.universityId) : universityById(p.universityId);
  return (
    <>
      <BackLink />
      <PageHeading eyebrow={fieldName(p.field)} title={p.name} />
      <p className="text-lg text-muted-foreground mb-5">
        {uni.name} · {uni.city}
      </p>
      <DemoNote />
      <div className="detail-layout">
        <section>
          <h2>პროგრამის შესახებ</h2>
          <p className="mt-4 leading-relaxed">{p.blurb}</p>
          <dl className="detail-list">
            <div>
              <dt>საფეხური</dt>
              <dd>{p.degree}</dd>
            </div>
            <div>
              <dt>წლიური საფასური</dt>
              <dd>{abroad ? formatTuitionUsd(p.tuitionUsd) : formatTuition(p.tuition)}</dd>
            </div>
            {abroad ? (
              <>
                <div>
                  <dt>ხანგრძლივობა</dt>
                  <dd>{p.years} წელი</dd>
                </div>
                <div>
                  <dt>სწავლების ენა</dt>
                  <dd>{p.english ? "100% English" : "ადგილობრივი ენა"}</dd>
                </div>
                <div>
                  <dt>განაცხადის საფასური</dt>
                  <dd>${p.appFeeUsd}</dd>
                </div>
                <div>
                  <dt>დემო ვადა</dt>
                  <dd>{formatDeadline(p.deadline)}</dd>
                </div>
                <div>
                  <dt>მიღების დემო მაჩვენებელი</dt>
                  <dd>{p.acceptanceRate}%</dd>
                </div>
              </>
            ) : (
              <>
                <div>
                  <dt>არჩევითი საგნები</dt>
                  <dd>{p.electives.map((x) => SUBJECTS[x]).join(" / ")}</dd>
                </div>
                <div>
                  <dt>სანიმუშო ზღვარი</dt>
                  <dd>{p.sampleCutoff}</dd>
                </div>
                <div>
                  <dt>ადგილები · დემო</dt>
                  <dd>{p.seats}</dd>
                </div>
                <div>
                  <dt>კოეფიციენტები · დემო</dt>
                  <dd>
                    {Object.entries(p.coefficients)
                      .map(([k, v]) => `${SUBJECTS[k as keyof typeof SUBJECTS]}: ${v}`)
                      .join(" · ")}
                  </dd>
                </div>
                <div>
                  <dt>დაფინანსება</dt>
                  <dd>
                    {p.stateGrant
                      ? "სახელმწიფო გრანტი · დემო"
                      : "სახელმწიფო გრანტი არაა მითითებული"}
                    {p.scholarship ? " · უნივერსიტეტის სტიპენდია (დემო)" : ""}
                  </dd>
                </div>
              </>
            )}
          </dl>
          <h2 className="mt-8">რა შეგიძლია გააუმჯობესო?</h2>
          <ul className="detail-tips">
            {abroad
              ? tipsFor(s.abroad, p).map((x) => <li key={x}>{x}</li>)
              : improvements(s.profile, p).map((x) => (
                  <li key={x.subject}>
                    {x.label}: +{x.delta} ქულა → დემო შეფასება {x.oldPct}% → {x.newPct}%
                  </li>
                ))}
          </ul>
          {abroad && (
            <>
              <h2>მოთხოვნები · დემო</h2>
              <dl className="detail-list">
                {Object.entries(p.reqs).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>
                      {typeof v === "object"
                        ? Object.entries(v)
                            .map(([key, val]) => `${key.toUpperCase()} ${val}`)
                            .join(" / ")
                        : v}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </section>
        <aside>
          <ProgramCard program={p} />
          {abroad && (
            <Button asChild variant="outline" className="mt-4">
              <Link to="/scholarships">
                სტიპენდიების ძიება
                <ArrowRight />
              </Link>
            </Button>
          )}
        </aside>
      </div>
    </>
  );
}
