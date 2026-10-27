import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, LockKeyhole, Send, Sparkles, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeading, DemoNote } from "@/web/layout/AppShell";
import { useWebStore } from "@/web/lib/store";
import {
  hasWebCounselorAccess,
  unlockWebCounselor,
  askWebCounselor,
  deleteWebGuest,
  PinRequired,
} from "@/web/lib/counselor-api";
import { decideProposals } from "../../../expo/lib/counselor";
import { decideAbroadProposals } from "../../../expo/lib/abroad-counselor";
import { programById } from "../../../expo/lib/data";
import { abroadProgramById } from "../../../expo/lib/abroad-data";
import { buildList } from "../../../expo/lib/engine";
import { portfolioPrograms } from "../../../expo/lib/abroad-engine";
import type { CounselorMessage } from "../../../expo/lib/counselor-types";
export function CounselorPage() {
  const s = useWebStore(),
    abroad = s.mode === "abroad";
  const [unlocked, setUnlocked] = useState(hasWebCounselorAccess),
    [pin, setPin] = useState(""),
    [text, setText] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(false);
  const inFlight = useRef(false),
    abort = useRef<AbortController | null>(null),
    end = useRef<HTMLDivElement>(null);
  const active = abroad ? s.abroad : s.profile,
    messages = active.counselor?.messages ?? [];
  const count = abroad
    ? portfolioPrograms(s.abroad).length
    : s.profile.listCreated
      ? buildList(s.profile).length
      : 0;
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);
  const saveMessages = (fn: (m: CounselorMessage[]) => CounselorMessage[]) => {
    if (abroad)
      s.updateAbroad((p) => ({ ...p, counselor: { messages: fn(p.counselor?.messages ?? []) } }));
    else s.update((p) => ({ ...p, counselor: { messages: fn(p.counselor?.messages ?? []) } }));
  };
  const unlock = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      await unlockWebCounselor(pin);
      setPin("");
      setUnlocked(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "კავშირი ვერ დამყარდა.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const ask = async (again = false) => {
    if (inFlight.current || (!again && !text.trim())) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setRetry(false);
    const user: CounselorMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: text.trim() }],
      proposals: [],
    };
    const next = again ? messages : [...messages, user];
    if (!again) {
      saveMessages((m) => [...m, user]);
      setText("");
    }
    const controller = new AbortController();
    abort.current = controller;
    try {
      const reply = await askWebCounselor(
        active,
        next,
        crypto.randomUUID(),
        abroad,
        controller.signal,
      );
      saveMessages((m) => [...m, reply]);
    } catch (e) {
      if (e instanceof PinRequired) {
        setUnlocked(false);
        setError("წვდომის ვადა ამოიწურა. შეიყვანე PIN ხელახლა.");
      } else if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "პასუხი ვერ მივიღეთ.");
        setRetry(true);
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const decide = (ids: string[], accept: boolean) => {
    const proposals = messages.flatMap((m) => m.proposals).filter((p) => ids.includes(p.id));
    const remove = accept && proposals.some((p) => p.action === "remove");
    if (remove && !confirm("ადასტურებ შეთავაზებული პროგრამების ამოღებას?")) return;
    if (abroad) s.updateAbroad((p) => decideAbroadProposals(p, ids, accept, remove));
    else s.update((p) => decideProposals(p, ids, accept, remove));
  };
  const name = (id: string | null) =>
    id ? ((abroad ? abroadProgramById(id)?.name : programById(id)?.name) ?? id) : "";
  const accountControls = (
    <div className="mt-6 flex flex-wrap gap-3">
      <Button
        variant="ghost"
        disabled={busy}
        onClick={() => {
          if (confirm("წაიშალოს ამ რეჟიმის საუბარი? შენი სია უცვლელი დარჩება."))
            saveMessages(() => []);
        }}
      >
        საუბრის გასუფთავება
      </Button>
      <Button
        variant="ghost"
        disabled={busy}
        onClick={async () => {
          if (!confirm("წაიშალოს AI სტუმრის ანგარიში? ქულები და სიები უცვლელი დარჩება.")) return;
          try {
            await deleteWebGuest();
            setUnlocked(false);
          } catch {
            setError("ანგარიშის წაშლა ვერ მოხერხდა. ხელახლა სცადე.");
          }
        }}
      >
        AI ანგარიშის წაშლა
      </Button>
    </div>
  );
  return (
    <>
      <PageHeading eyebrow="CHEMIUNI ADVISOR" title="AI კონსულტანტი">
        <Sparkles className="size-7 text-primary" />
      </PageHeading>
      <DemoNote />
      {!count ? (
        <div className="empty-state">
          <p>კონსულტაციისთვის ჯერ შექმენი შენი სია.</p>
          <Button asChild>
            <Link to="/my-list">ჩემი სია</Link>
          </Button>
        </div>
      ) : !unlocked ? (
        <section className="pin-screen">
          <LockKeyhole className="size-10 text-primary" />
          <h2>დემო წვდომა</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              unlock();
            }}
          >
            <label className="form-field">
              <span>დემო PIN</span>
              <Input
                autoComplete="off"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={busy}
              />
            </label>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The AI Counselor is restricted during our demo because AI requests use limited
              resources. Enter the demo PIN provided to our testers to access the counselor.
            </p>
            <Button type="submit" className="mt-6 w-full" disabled={busy || !pin.trim()}>
              {busy ? "მოწმდება…" : "კონსულტანტის გახსნა"}
            </Button>
          </form>
          {error && (
            <p role="alert" className="text-destructive mt-4">
              {error}
            </p>
          )}
        </section>
      ) : (
        <div className="chat-layout">
          <section className="conversation">
            <div className="conversation-header">
              <Sparkles />
              <span>შენი უნივერსიტეტის მრჩეველი</span>
              <span className="tag ml-auto">დემო</span>
            </div>
            <div className="chat-messages" aria-live="polite">
              {!messages.length && (
                <div className="chat-welcome">
                  <h2>შენი გეგმიდან დავიწყოთ.</h2>
                  <p>რას ისურვებდი შენს სიაში შეცვლას?</p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {["შეაფასე ჩემი სია", "მირჩიე უფრო ხელმისაწვდომი ვარიანტები"].map((t) => (
                      <Button key={t} variant="outline" onClick={() => setText(t)}>
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <article key={m.id} className={`chat-message message-${m.role}`} data-no-translate>
                  <span className="message-author">{m.role === "user" ? "შენ" : "ChemiUni"}</span>
                  <div className="markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {m.parts.map((x) => x.text).join("\n")}
                    </ReactMarkdown>
                  </div>
                  {m.proposals.length > 0 && (
                    <div className="proposal-list">
                      {m.proposals.map((p) => (
                        <div key={p.id} className={`proposal proposal-${p.status}`}>
                          <div className="flex gap-3 justify-between">
                            <strong>
                              {p.action === "replace"
                                ? "ჩანაცვლება"
                                : p.action === "add"
                                  ? "დამატება"
                                  : "ამოღება"}
                            </strong>
                            <span className="text-xs">
                              {
                                {
                                  pending: "განხილვის მოლოდინში",
                                  accepted: "მიღებულია",
                                  rejected: "უარყოფილია",
                                  stale: "აღარ მოქმედებს",
                                }[p.status]
                              }
                            </span>
                          </div>
                          {p.targetId && <p className="mt-3">{name(p.targetId)}</p>}
                          {p.action === "replace" && <p className="text-primary my-2">↓</p>}
                          {p.programId && <p className="font-semibold">{name(p.programId)}</p>}
                          <p className="mt-3 text-sm text-muted-foreground">{p.reason}</p>
                          {p.notice && <p className="text-destructive text-xs mt-2">{p.notice}</p>}
                          {p.status === "pending" && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Button disabled={busy} onClick={() => decide([p.id], true)}>
                                <Check />
                                მიღება
                              </Button>
                              <Button
                                disabled={busy}
                                variant="outline"
                                onClick={() => decide([p.id], false)}
                              >
                                <X />
                                უარყოფა
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                      {m.proposals.filter((p) => p.status === "pending").length > 1 && (
                        <Button
                          disabled={busy}
                          variant="secondary"
                          onClick={() =>
                            decide(
                              m.proposals.filter((p) => p.status === "pending").map((p) => p.id),
                              true,
                            )
                          }
                        >
                          <Check />
                          ყველას მიღება
                        </Button>
                      )}
                    </div>
                  )}
                </article>
              ))}
              {busy && (
                <div className="space-y-2 p-4" aria-label="კონსულტანტი პასუხობს">
                  <div className="h-4 bg-muted animate-pulse w-3/4" />
                  <div className="h-4 bg-muted animate-pulse w-1/2" />
                </div>
              )}
              <div ref={end} />
            </div>
            {error && (
              <div role="alert" className="chat-error">
                <p>{error}</p>
                {retry && (
                  <Button variant="outline" onClick={() => ask(true)} disabled={busy}>
                    <RotateCcw />
                    ხელახლა სცადე
                  </Button>
                )}
              </div>
            )}
            <form
              className="composer"
              onSubmit={(e) => {
                e.preventDefault();
                ask();
              }}
            >
              <textarea
                aria-label="შეტყობინება"
                placeholder="რას განვიხილავთ?"
                maxLength={2000}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={busy}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="გაგზავნა"
                disabled={busy || !text.trim()}
              >
                <Send />
              </Button>
            </form>
          </section>
          <aside className="chat-aside">
            <h2>შენი არჩევანი</h2>
            <p className="text-sm text-muted-foreground mt-3">{count} პროგრამა</p>
            <Button variant="outline" asChild className="mt-4">
              <Link to="/my-list">სიის ნახვა</Link>
            </Button>
            <p className="demo-note mt-6">შეთავაზებები სიას მხოლოდ შენი თანხმობის შემდეგ ცვლის.</p>
          </aside>
        </div>
      )}
      {unlocked && accountControls}
    </>
  );
}
