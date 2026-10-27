import { useState, useId, cloneElement, isValidElement } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Save, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWebStore } from "@/web/lib/store";
import { PageHeading, DemoNote } from "@/web/layout/AppShell";
import { CITIES, ELECTIVES, FIELDS, SUBJECTS } from "../../../expo/lib/data";
import {
  AMBITION_LABEL,
  BUDGET_LABEL,
  EXAM_STATUS_LABEL,
  SCORE_TYPE_LABEL,
  type Profile,
} from "../../../expo/lib/types";
import { ABROAD_COUNTRIES } from "../../../expo/lib/abroad-data";
import {
  ABROAD_EXAM_STATUS_LABEL,
  EXAM_ORDER,
  EXAM_META,
  STUDY_BUDGET_OPTIONS,
  type AbroadProfile,
} from "../../../expo/lib/abroad-types";
import { generateAbroadPortfolio } from "../../../expo/lib/abroad-engine";
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children}
    </div>
  );
}
export function ProfileForm({ setup = false }: { setup?: boolean }) {
  const s = useWebStore(),
    navigate = useNavigate();
  const [g, setG] = useState<Profile>(() => structuredClone(s.profile)),
    [a, setA] = useState<AbroadProfile>(() => structuredClone(s.abroad)),
    [saved, setSaved] = useState(false);
  const abroad = s.mode === "abroad";
  const save = () => {
    if (abroad)
      s.updateAbroad(() => {
        const next = { ...a, setupDone: true };
        return setup ? { ...next, portfolio: generateAbroadPortfolio(next) } : next;
      });
    else
      s.update(() => ({
        ...g,
        onboarded: true,
        listCreated:
          g.scores.georgian !== null &&
          g.scores.foreign !== null &&
          g.scores.electiveScore !== null &&
          g.scores.elective !== null,
      }));
    setSaved(true);
    if (setup) navigate({ to: "/home" });
  };
  return (
    <>
      <PageHeading
        eyebrow={abroad ? "GLOBAL APPLICATIONS" : "საქართველო · ეროვნული გამოცდები"}
        title={setup ? "დავიწყოთ შენი გზით" : "შენი პროფილი"}
      >
        <Settings className="size-7 text-primary" />
      </PageHeading>
      <DemoNote />
      {!setup && (
        <section className="settings-band">
          <div>
            <h2>შენი სასწავლო გზა</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                variant={!abroad ? "default" : "secondary"}
                onClick={() => {
                  s.setMode("georgia");
                  navigate({ to: s.profile.onboarded ? "/profile" : "/setup" });
                }}
              >
                🇬🇪 საქართველო
              </Button>
              <Button
                variant={abroad ? "default" : "secondary"}
                onClick={() => {
                  s.setMode("abroad");
                  navigate({ to: s.abroad.setupDone ? "/profile" : "/setup" });
                }}
              >
                🌍 უცხოეთი
              </Button>
            </div>
          </div>
          <Field label="გარეგნობა">
            <select value={s.appearance} onChange={(e) => s.setAppearance(e.target.value)}>
              <option value="system">სისტემის მიხედვით</option>
              <option value="light">ნათელი</option>
              <option value="dark">მუქი</option>
            </select>
          </Field>
        </section>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="profile-form"
        key={s.mode}
      >
        {!abroad ? (
          <>
            <section>
              <h2>
                შენ შესახებ <span className="text-muted-foreground text-sm">· არასავალდებულო</span>
              </h2>
              <div className="form-grid">
                {(["name", "school", "gradYear", "email"] as const).map((k, i) => (
                  <Field key={k} label={["სახელი", "სკოლა", "დამთავრების წელი", "ელფოსტა"][i] ?? k}>
                    <Input
                      type={k === "email" ? "email" : "text"}
                      value={g.account[k]}
                      onChange={(e) =>
                        setG({ ...g, account: { ...g.account, [k]: e.target.value } })
                      }
                    />
                  </Field>
                ))}
              </div>
            </section>
            <section>
              <h2>გამოცდები და ინტერესები</h2>
              <div className="form-grid">
                <Field label="სასურველი სფერო">
                  <select
                    value={g.field ?? ""}
                    onChange={(e) =>
                      setG({ ...g, field: (e.target.value as Profile["field"]) || null })
                    }
                  >
                    <option value="">ყველა სფერო</option>
                    {FIELDS.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="გამოცდების სტატუსი">
                  <select
                    value={g.examStatus ?? "preparing"}
                    onChange={(e) =>
                      setG({ ...g, examStatus: e.target.value as Profile["examStatus"] })
                    }
                  >
                    {Object.entries(EXAM_STATUS_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ქულების ტიპი">
                  <select
                    value={g.scores.type}
                    onChange={(e) =>
                      setG({
                        ...g,
                        scores: { ...g.scores, type: e.target.value as Profile["scores"]["type"] },
                      })
                    }
                  >
                    {Object.entries(SCORE_TYPE_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="უცხოური ენა">
                  <select
                    value={g.scores.foreignLang}
                    onChange={(e) =>
                      setG({ ...g, scores: { ...g.scores, foreignLang: e.target.value } })
                    }
                  >
                    {["ინგლისური", "გერმანული", "ფრანგული", "რუსული"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                {(["georgian", "foreign"] as const).map((k) => (
                  <Field key={k} label={SUBJECTS[k] + " · 0–100"}>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={g.scores[k] ?? ""}
                      onChange={(e) =>
                        setG({
                          ...g,
                          scores: {
                            ...g.scores,
                            [k]: e.target.value === "" ? null : Number(e.target.value),
                          },
                        })
                      }
                    />
                  </Field>
                ))}
                <Field label="არჩევითი საგანი">
                  <select
                    value={g.scores.elective ?? ""}
                    onChange={(e) =>
                      setG({
                        ...g,
                        scores: {
                          ...g.scores,
                          elective: (e.target.value as Profile["scores"]["elective"]) || null,
                        },
                      })
                    }
                  >
                    <option value="">აირჩიე საგანი</option>
                    {ELECTIVES.map((x) => (
                      <option key={x} value={x}>
                        {SUBJECTS[x]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="არჩევითი საგნის ქულა · 0–100">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={g.scores.electiveScore ?? ""}
                    onChange={(e) =>
                      setG({
                        ...g,
                        scores: {
                          ...g.scores,
                          electiveScore: e.target.value === "" ? null : Number(e.target.value),
                          updatedAt: new Date().toISOString(),
                        },
                      })
                    }
                  />
                </Field>
              </div>
            </section>
            <section>
              <h2>შენი პრიორიტეტები</h2>
              <div className="form-grid">
                <Field label="სწავლის ბიუჯეტი">
                  <select
                    value={g.prefs.budget}
                    onChange={(e) =>
                      setG({
                        ...g,
                        prefs: { ...g.prefs, budget: e.target.value as Profile["prefs"]["budget"] },
                      })
                    }
                  >
                    {Object.entries(BUDGET_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="არჩევანის მიდგომა">
                  <select
                    value={g.prefs.ambition}
                    onChange={(e) =>
                      setG({
                        ...g,
                        prefs: {
                          ...g.prefs,
                          ambition: e.target.value as Profile["prefs"]["ambition"],
                        },
                      })
                    }
                  >
                    {Object.entries(AMBITION_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={g.prefs.anyCity}
                  onChange={(e) => setG({ ...g, prefs: { ...g.prefs, anyCity: e.target.checked } })}
                />
                ნებისმიერი ქალაქი
              </label>
              <div className="choice-grid">
                {CITIES.map((c) => (
                  <label key={c} className="check-row">
                    <input
                      type="checkbox"
                      checked={g.prefs.cities.includes(c)}
                      onChange={(e) =>
                        setG({
                          ...g,
                          prefs: {
                            ...g.prefs,
                            anyCity: false,
                            cities: e.target.checked
                              ? [...g.prefs.cities, c]
                              : g.prefs.cities.filter((x) => x !== c),
                          },
                        })
                      }
                    />
                    {c}
                  </label>
                ))}
              </div>
              <Field label="გამორიცხული ქალაქები">
                <select
                  multiple
                  value={g.prefs.excludedCities}
                  onChange={(e) =>
                    setG({
                      ...g,
                      prefs: {
                        ...g.prefs,
                        excludedCities: [...e.target.selectedOptions].map(
                          (x) => x.value as (typeof CITIES)[number],
                        ),
                      },
                    })
                  }
                >
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={g.prefs.scholarshipFocus}
                  onChange={(e) =>
                    setG({ ...g, prefs: { ...g.prefs, scholarshipFocus: e.target.checked } })
                  }
                />
                სტიპენდიები პრიორიტეტულია
              </label>
              <Field label="დამატებითი სურვილები">
                <textarea
                  value={g.prefs.notes}
                  onChange={(e) => setG({ ...g, prefs: { ...g.prefs, notes: e.target.value } })}
                />
              </Field>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2>სად გინდა სწავლა?</h2>
              <div className="form-grid">
                <Field label="სკოლის დამთავრების წელი">
                  <Input
                    type="number"
                    min={2020}
                    max={2040}
                    value={a.gradYear}
                    onChange={(e) => setA({ ...a, gradYear: e.target.value })}
                  />
                </Field>
                <Field label="წლიური სწავლის ბიუჯეტი">
                  <select
                    value={a.studyBudget ?? "flexible"}
                    onChange={(e) =>
                      setA({ ...a, studyBudget: e.target.value as AbroadProfile["studyBudget"] })
                    }
                  >
                    {STUDY_BUDGET_OPTIONS.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <h3>სასურველი ქვეყნები</h3>
              <div className="choice-grid">
                {ABROAD_COUNTRIES.map((c) => (
                  <label className="check-row" key={c.id}>
                    <input
                      type="checkbox"
                      checked={a.countries.includes(c.id)}
                      onChange={(e) =>
                        setA({
                          ...a,
                          countries: e.target.checked
                            ? [...a.countries, c.id]
                            : a.countries.filter((x) => x !== c.id),
                        })
                      }
                    />
                    {c.flag} {c.name}
                  </label>
                ))}
              </div>
              <h3>აკადემიური ინტერესები</h3>
              <div className="choice-grid">
                {FIELDS.map((f) => (
                  <label className="check-row" key={f.id}>
                    <input
                      type="checkbox"
                      checked={a.interests.includes(f.id)}
                      onChange={(e) =>
                        setA({
                          ...a,
                          interests: e.target.checked
                            ? [...a.interests, f.id]
                            : a.interests.filter((x) => x !== f.id),
                        })
                      }
                    />
                    {f.name}
                  </label>
                ))}
              </div>
            </section>
            <section>
              <h2>შენი ქულები</h2>
              <div className="exam-grid">
                {EXAM_ORDER.map((k) => (
                  <div key={k} className="exam-row">
                    <strong>{EXAM_META[k].label}</strong>
                    <Field label={EXAM_META[k].label + " სტატუსი"}>
                      <select
                        value={a.exams[k].status}
                        onChange={(e) =>
                          setA({
                            ...a,
                            exams: {
                              ...a.exams,
                              [k]: {
                                ...a.exams[k],
                                status: e.target
                                  .value as AbroadProfile["exams"][typeof k]["status"],
                              },
                            },
                          })
                        }
                      >
                        {Object.entries(ABROAD_EXAM_STATUS_LABEL).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={EXAM_META[k].label + " ქულა"}>
                      <Input
                        type="number"
                        min={0}
                        max={EXAM_META[k].max}
                        step="any"
                        disabled={a.exams[k].status === "none"}
                        value={a.exams[k].score ?? ""}
                        placeholder={EXAM_META[k].placeholder}
                        onChange={(e) =>
                          setA({
                            ...a,
                            exams: {
                              ...a.exams,
                              [k]: {
                                ...a.exams[k],
                                score: e.target.value === "" ? null : Number(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2>განაცხადების გეგმა</h2>
              <div className="form-grid">
                <Field label="განაცხადების სასურველი რაოდენობა">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={a.targetApps}
                    onChange={(e) => setA({ ...a, targetApps: Number(e.target.value) })}
                  />
                </Field>
                <Field label="განაცხადების გაგზავნის ბიუჯეტი · USD">
                  <Input
                    type="number"
                    min={0}
                    max={10000}
                    value={a.feeBudgetUsd}
                    onChange={(e) => setA({ ...a, feeBudgetUsd: Number(e.target.value) })}
                  />
                </Field>
              </div>
            </section>
          </>
        )}
        <div className="flex flex-wrap items-center gap-4 py-6">
          <Button type="submit" size="lg">
            {setup ? <ArrowRight /> : <Save />}
            {setup ? "გაგრძელება" : "ცვლილებების შენახვა"}
          </Button>
          {saved && (
            <p role="status" className="text-safe">
              შენახულია
            </p>
          )}
        </div>
      </form>
      {!setup && (
        <section className="border-t border-border py-8 flex flex-wrap gap-4">
          <Button variant="outline" asChild>
            <Link to="/">საწყისი არჩევანი</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/privacy">კონფიდენციალურობა</Link>
          </Button>
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              if (window.confirm("წაიშალოს ამ ბრაუზერში შენახული ორივე პროფილი?")) {
                s.reset();
                navigate({ to: "/" });
              }
            }}
          >
            <Trash2 />
            მონაცემების წაშლა
          </Button>
        </section>
      )}
    </>
  );
}
