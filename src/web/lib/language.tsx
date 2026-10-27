// Website language switch (Georgian is the default, English is optional).
//
// How it works: every Georgian text on the page is looked up in
// english-text.json and swapped for its English version while English is on.
// To fix or add a translation, edit english-text.json: "Georgian": "English".
// Wrap anything that must never be translated (e.g. AI chat replies) in an
// element with the attribute data-no-translate.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import english from "./english-text.json";

export type Lang = "ka" | "en";
const KEY = "chemiuni.web.lang.v1";
const DICT = english as Record<string, string>;
const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Whole-phrase matcher: never replaces half a Georgian word.
const PHRASES = new RegExp(
  "(?<![\\u10A0-\\u10FF])(" +
    Object.keys(DICT)
      .sort((a, b) => b.length - a.length)
      .map(escape)
      .join("|") +
    ")(?![\\u10A0-\\u10FF])",
  "g",
);
const GEORGIAN = /[\u10A0-\u10FF]/;
const ATTRS = ["placeholder", "aria-label", "title"] as const;

/** Translate one Georgian string to English (exact match first, then phrase by phrase). */
export function toEnglish(text: string): string {
  if (!GEORGIAN.test(text)) return text;
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (DICT[trimmed]) return text.replace(text.trim(), DICT[trimmed]);
  return text.replace(PHRASES, (ka) => DICT[ka] ?? ka);
}

// Remember the original Georgian of every text we change, so we can switch back.
const originals = new WeakMap<Node, string>();
const written = new WeakMap<Node, string>();
const originalAttrs = new WeakMap<Element, Map<string, string>>();

function skip(el: Element | null) {
  return !el || !!el.closest("[data-no-translate],script,style,textarea");
}

function translateText(node: Text, lang: Lang) {
  if (skip(node.parentElement)) return;
  const now = node.nodeValue ?? "";
  // React changed the text since our last write: treat it as the new original.
  if (written.get(node) !== now) originals.set(node, now);
  const original = originals.get(node) ?? now;
  const next = lang === "en" ? toEnglish(original) : original;
  if (next !== now) node.nodeValue = next;
  written.set(node, next);
}

function translateAttrs(el: Element, lang: Lang) {
  if (skip(el)) return;
  let saved = originalAttrs.get(el);
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (v == null) continue;
    if (!saved) originalAttrs.set(el, (saved = new Map()));
    if (!saved.has(a) || (v !== toEnglish(saved.get(a)!) && v !== saved.get(a))) saved.set(a, v);
    const next = lang === "en" ? toEnglish(saved.get(a)!) : saved.get(a)!;
    if (next !== v) el.setAttribute(a, next);
  }
}

function translateTree(root: Node, lang: Lang) {
  if (root.nodeType === Node.TEXT_NODE) return translateText(root as Text, lang);
  if (!(root instanceof Element)) return;
  translateAttrs(root, lang);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) translateText(n as Text, lang);
    else translateAttrs(n as Element, lang);
  }
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ka",
  setLang: () => {},
});
export const useLanguage = () => useContext(Ctx);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ka");
  useEffect(() => {
    if (localStorage.getItem(KEY) === "en") setLangState("en");
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(KEY, l);
  };
  useEffect(() => {
    document.documentElement.lang = lang;
    translateTree(document.body, lang);
    if (lang === "ka") return;
    const observer = new MutationObserver((changes) => {
      observer.disconnect();
      for (const c of changes) {
        if (c.type === "childList") c.addedNodes.forEach((n) => translateTree(n, lang));
        else if (c.type === "characterData") translateText(c.target as Text, lang);
        else if (c.target instanceof Element) translateAttrs(c.target, lang);
      }
      observe();
    });
    const observe = () =>
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...ATTRS],
      });
    observe();
    return () => observer.disconnect();
  }, [lang]);
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

/** The KA / EN switch shown in the top bar. */
export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="lang-toggle" role="group" aria-label="Language" data-no-translate>
      {(["ka", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={lang === l ? "is-active" : ""}
        >
          {l === "ka" ? "ქარ" : "ENG"}
        </button>
      ))}
    </div>
  );
}
