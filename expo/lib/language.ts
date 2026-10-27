// Phone app language switch (Georgian is the default, English is optional).
// To fix or add a translation, edit english-text.json: "Georgian": "English".
// Every <Text> from "@/lib/translated-text" translates itself automatically.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import english from "./english-text.json";

export type Lang = "ka" | "en";
const KEY = "chemiuni.lang.v1";
const DICT = english as Record<string, string>;
const GEORGIAN = /[\u10A0-\u10FF]/;
const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Whole-phrase matcher (no lookbehind, works on Hermes): never replaces half a word.
const PHRASES = new RegExp(
  "(^|[^\\u10A0-\\u10FF])(" +
    Object.keys(DICT).sort((a, b) => b.length - a.length).map(escape).join("|") +
    ")(?![\\u10A0-\\u10FF])",
  "g",
);

export function toEnglish(text: string): string {
  if (!GEORGIAN.test(text)) return text;
  const exact = DICT[text.trim().replace(/\s+/g, " ")];
  if (exact) return text.replace(text.trim(), exact);
  return text.replace(PHRASES, (_m, before: string, ka: string) => before + (DICT[ka] ?? ka));
}

let lang: Lang = "ka";
const listeners = new Set<() => void>();
AsyncStorage.getItem(KEY)
  .then((v) => {
    if (v === "en") setLang("en");
  })
  .catch(() => {});

export function setLang(next: Lang) {
  lang = next;
  listeners.forEach((l) => l());
  AsyncStorage.setItem(KEY, next).catch(() => {});
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => lang,
    () => lang,
  );
}

/** Translate a value only when English is on. */
export function tr(value: string, current: Lang): string {
  return current === "en" ? toEnglish(value) : value;
}
