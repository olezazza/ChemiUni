import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DemoNote, PageHeading } from "@/web/layout/AppShell";
import { Field } from "@/web/components/ProfileForm";
import { ABROAD_COUNTRIES, SCHOLARSHIPS, AWARD_TYPE_LABEL, countryById, formatDeadline } from "../../../expo/lib/abroad-data";

export function ScholarshipsPage() {
  const [q, setQ] = useState(""),
    [country, setCountry] = useState(""),
    [award, setAward] = useState(""),
    [date, setDate] = useState(""),
    [georgian, setGeorgian] = useState(false);
  const rows = SCHOLARSHIPS.filter(
    (x) =>
      `${x.name} ${x.eligibility}`.toLowerCase().includes(q.toLowerCase()) &&
      (!country || x.countryId === country || x.countryId === "global") &&
      (!award || x.awardType === award) &&
      (!date || x.deadline <= date) &&
      (!georgian || x.forGeorgians),
  );
  return (
    <>
      <PageHeading eyebrow="დაფინანსების შესაძლებლობები" title="სტიპენდიები" />
      <DemoNote />
      <div className="search-main">
        <Search />
        <Input
          aria-label="მოძებნე სტიპენდია"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="სტიპენდია ან უფლებამოსილების პირობა"
        />
      </div>
      <div className="filter-grid">
        <Field label="ქვეყანა">
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">ყველა</option>
            {ABROAD_COUNTRIES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ჯილდოს ტიპი">
          <select value={award} onChange={(e) => setAward(e.target.value)}>
            <option value="">ყველა ტიპი</option>
            {Object.entries(AWARD_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="დემო ვადა მაქს.">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <label className="check-row">
          <input
            type="checkbox"
            checked={georgian}
            onChange={(e) => setGeorgian(e.target.checked)}
          />
          საქართველოს მოქალაქეებისთვის · დემო
        </label>
      </div>
      <p className="my-5 text-sm text-muted-foreground">{rows.length} სტიპენდია</p>
      <div className="program-grid">
        {rows.map((x) => (
          <article key={x.id} className="program-card border border-border bg-card">
            <span className="eyebrow">
              {x.countryId === "global" ? "მსოფლიო" : countryById(x.countryId).name}
            </span>
            <Link to="/scholarship/$id" params={{ id: x.id }} className="program-title">
              {x.name}
              <ArrowRight className="size-4 shrink-0" />
            </Link>
            <span className="tag">{AWARD_TYPE_LABEL[x.awardType]}</span>
            <p className="text-sm text-muted-foreground">{x.eligibility}</p>
            <strong>
              {x.amountUsd
                ? `$${x.amountUsd.toLocaleString()} / წელი · დემო`
                : "ცვლადი დაფინანსება · დემო"}
            </strong>
            <p className="text-sm text-muted-foreground">{formatDeadline(x.deadline)} · დემო</p>
            <Button asChild variant="outline">
              <Link to="/scholarship/$id" params={{ id: x.id }}>
                პირობები და დოკუმენტები
                <ArrowRight />
              </Link>
            </Button>
          </article>
        ))}
      </div>
      {!rows.length && <p className="empty-state">შეცვალე ფილტრები მეტი შედეგისთვის.</p>}
    </>
  );
}
