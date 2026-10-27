import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoNote, PageHeading } from "@/web/layout/AppShell";
import { SCHOLARSHIPS, AWARD_TYPE_LABEL, formatDeadline } from "../../../expo/lib/abroad-data";
import { scholarshipDetails } from "../../../expo/lib/scholarship-details";

export function ScholarshipPage({ id }: { id: string }) {
  const x = SCHOLARSHIPS.find((s) => s.id === id);
  if (!x) return <h1>სტიპენდია ვერ მოიძებნა</h1>;
  const details = scholarshipDetails(x);
  return (
    <>
      <Button variant="ghost" asChild>
        <Link to="/scholarships">← სტიპენდიები</Link>
      </Button>
      <PageHeading eyebrow={AWARD_TYPE_LABEL[x.awardType]} title={x.name} />
      <DemoNote />
      <p className="text-muted-foreground">დემო ვადა: {formatDeadline(x.deadline)}</p>
      <div className="detail-layout">
        <section>
          <h2>რას ფარავს?</h2>
          <dl className="detail-list">
            {details.coverage.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8">ვის შეუძლია განაცხადის გაგზავნა?</h2>
          <ul className="detail-tips">
            {details.eligibility.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <h2>განაცხადის ნაბიჯები</h2>
          <ol className="detail-tips">
            {details.steps.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </section>
        <section>
          <h2>დოკუმენტების სია</h2>
          <ul className="detail-tips">
            {details.documents.map((c) => (
              <li key={c}>
                <label className="check-row">
                  <input type="checkbox" />
                  {c}
                </label>
              </li>
            ))}
          </ul>
          {details.url && (
            <Button asChild variant="outline">
              <a href={details.url} target="_blank" rel="noopener noreferrer">
                ოფიციალური ინფორმაცია
                <ArrowRight />
              </a>
            </Button>
          )}
          <p className="demo-note mt-5">
            ეს პირობები დემო მაგალითია. რეალური მოთხოვნები გადაამოწმე ოფიციალურ წყაროში.
          </p>
        </section>
      </div>
    </>
  );
}
