import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWebStore } from "@/web/lib/store";
import { DemoNote, PageHeading } from "@/web/layout/AppShell";
import { ProgramCard } from "@/web/components/ProgramCard";
import { Field } from "@/web/components/ProfileForm";
import { PROGRAMS, FIELDS, CITIES, universityById } from "../../../expo/lib/data";
import { estimate, CONFIDENCE_LABEL } from "../../../expo/lib/engine";
import { ABROAD_PROGRAMS, ABROAD_COUNTRIES, abroadUniversityById } from "../../../expo/lib/abroad-data";
import { estimateAbroad } from "../../../expo/lib/abroad-engine";

export function ExplorePage() {
  const s = useWebStore(),
    abroad = s.mode === "abroad";
  const [q, setQ] = useState(""),
    [place, setPlace] = useState(""),
    [field, setField] = useState(""),
    [max, setMax] = useState(""),
    [english, setEnglish] = useState(false),
    [chance, setChance] = useState(""),
    [rate, setRate] = useState(""),
    [city, setCity] = useState("");
  const rows = (abroad ? ABROAD_PROGRAMS : PROGRAMS).filter((p) => {
    const foreign = "tuitionUsd" in p,
      uni = foreign ? abroadUniversityById(p.universityId) : universityById(p.universityId);
    const est = foreign ? estimateAbroad(s.abroad, p) : estimate(s.profile, p);
    return (
      `${p.name} ${uni.name} ${uni.city}`.toLowerCase().includes(q.toLowerCase()) &&
      (!field || p.field === field) &&
      (!place || (foreign ? abroadUniversityById(p.universityId).countryId : uni.city) === place) &&
      (!city || uni.city.toLowerCase().includes(city.toLowerCase())) &&
      (!max || (foreign ? p.tuitionUsd : p.tuition) <= Number(max)) &&
      (!english || (foreign && p.english)) &&
      (!chance || est?.confidence === chance) &&
      (!rate || (foreign && p.acceptanceRate >= Number(rate)))
    );
  });
  return (
    <>
      <PageHeading
        eyebrow={abroad ? "გლობალური კატალოგი" : "საქართველოს კატალოგი"}
        title="აღმოაჩინე შენი პროგრამა"
      />
      <DemoNote />
      <div className="search-main">
        <Search />
        <Input
          aria-label="მოძებნე პროგრამა"
          placeholder="პროგრამა, უნივერსიტეტი ან ქალაქი"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="filter-grid">
        <Field label={abroad ? "ქვეყანა" : "ქალაქი"}>
          <select value={place} onChange={(e) => setPlace(e.target.value)}>
            <option value="">ყველა</option>
            {abroad
              ? ABROAD_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name}
                  </option>
                ))
              : CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="სფერო">
          <select value={field} onChange={(e) => setField(e.target.value)}>
            <option value="">ყველა სფერო</option>
            {FIELDS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={abroad ? "წლიური საფასური მაქს. · USD" : "წლიური საფასური მაქს. · ₾"}>
          <Input type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} />
        </Field>
        <Field label="დემო შეფასება">
          <select value={chance} onChange={(e) => setChance(e.target.value)}>
            <option value="">ყველა შეფასება</option>
            {Object.entries(CONFIDENCE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        {abroad && (
          <>
            <Field label="ქალაქი">
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="მიღების დემო მაჩვენებელი მინ. %">
              <Input
                type="number"
                min={0}
                max={100}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </Field>
            <label className="check-row">
              <input
                type="checkbox"
                checked={english}
                onChange={(e) => setEnglish(e.target.checked)}
              />
              100% ინგლისურენოვანი
            </label>
          </>
        )}
      </div>
      <p className="my-5 text-sm text-muted-foreground">{rows.length} პროგრამა</p>
      <div className="program-grid">
        {rows.map((p) => (
          <ProgramCard key={p.id} program={p} />
        ))}
      </div>
      {!rows.length && (
        <div className="empty-state">
          <p>ამ ფილტრებით პროგრამები ვერ მოიძებნა.</p>
          <Button
            variant="outline"
            onClick={() => {
              setQ("");
              setField("");
              setPlace("");
              setMax("");
              setChance("");
              setEnglish(false);
              setCity("");
              setRate("");
            }}
          >
            ფილტრების გასუფთავება
          </Button>
        </div>
      )}
    </>
  );
}
