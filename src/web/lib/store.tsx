import { flushSync } from "react-dom";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { EMPTY_PROFILE, type Profile } from "../../../expo/lib/types";
import { EMPTY_ABROAD, EXAM_ORDER, type AbroadProfile } from "../../../expo/lib/abroad-types";
export type Mode = "georgia" | "abroad";
export const WEB_KEYS = {
  georgia: "chemiuni.profile.v1",
  abroad: "chemiuni.abroad.v1",
  mode: "chemiuni.mode.v1",
  appearance: "chemiuni.appearance.v1",
};
export function restoreGeorgia(raw: string | null): Profile {
  const s = raw ? (JSON.parse(raw) as Partial<Profile>) : {};
  return {
    ...EMPTY_PROFILE,
    ...s,
    account: { ...EMPTY_PROFILE.account, ...s.account },
    scores: { ...EMPTY_PROFILE.scores, ...s.scores },
    prefs: { ...EMPTY_PROFILE.prefs, ...s.prefs },
  };
}
export function restoreAbroad(raw: string | null): AbroadProfile {
  const s = raw ? (JSON.parse(raw) as Partial<AbroadProfile>) : {};
  const exams = { ...EMPTY_ABROAD.exams };
  for (const k of EXAM_ORDER) exams[k] = { ...EMPTY_ABROAD.exams[k], ...s.exams?.[k] };
  return { ...EMPTY_ABROAD, ...s, exams };
}
type Store = {
  ready: boolean;
  profile: Profile;
  abroad: AbroadProfile;
  mode: Mode;
  appearance: string;
  saveError: boolean;
  update: (fn: (p: Profile) => Profile) => void;
  updateAbroad: (fn: (p: AbroadProfile) => AbroadProfile) => void;
  setMode: (m: Mode) => void;
  setAppearance: (v: string) => void;
  reset: () => void;
};
const Context = createContext<Store | null>(null);
export function WebStore({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false),
    [profile, setProfile] = useState(EMPTY_PROFILE),
    [abroad, setAbroad] = useState(EMPTY_ABROAD),
    [mode, modeState] = useState<Mode>("georgia"),
    [appearance, appearanceState] = useState("system"),
    [saveError, setSaveError] = useState(false);
  const current = useRef(profile),
    currentAbroad = useRef(abroad);
  useEffect(() => {
    try {
      current.current = restoreGeorgia(localStorage.getItem(WEB_KEYS.georgia));
      setProfile(current.current);
    } catch {
      setSaveError(true);
    }
    try {
      currentAbroad.current = restoreAbroad(localStorage.getItem(WEB_KEYS.abroad));
      setAbroad(currentAbroad.current);
    } catch {
      setSaveError(true);
    }
    try {
      modeState(localStorage.getItem(WEB_KEYS.mode) === "abroad" ? "abroad" : "georgia");
      appearanceState(localStorage.getItem(WEB_KEYS.appearance) ?? "system");
    } catch {
      setSaveError(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.classList.toggle(
        "dark",
        appearance === "dark" || (appearance === "system" && media.matches),
      );
      document.documentElement.dataset["mode"] = mode;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [appearance, mode]);
  const write = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  };
  return (
    <Context.Provider
      value={{
        ready,
        profile,
        abroad,
        mode,
        appearance,
        saveError,
        update: (fn) => {
          const next = fn(current.current);
          current.current = next;
          setProfile(next);
          write(WEB_KEYS.georgia, JSON.stringify(next));
        },
        updateAbroad: (fn) => {
          const next = fn(currentAbroad.current);
          currentAbroad.current = next;
          setAbroad(next);
          write(WEB_KEYS.abroad, JSON.stringify(next));
        },
        setMode: (m) => {
          // Cross-fade the whole page when switching modes (if the browser supports it).
          const apply = () => flushSync(() => modeState(m));
          const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
          if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches)
            doc.startViewTransition(apply);
          else apply();
          write(WEB_KEYS.mode, m);
        },
        setAppearance: (v) => {
          appearanceState(v);
          write(WEB_KEYS.appearance, v);
        },
        reset: () => {
          try {
            for (const k of [WEB_KEYS.georgia, WEB_KEYS.abroad, WEB_KEYS.mode])
              localStorage.removeItem(k);
            current.current = structuredClone(EMPTY_PROFILE);
            currentAbroad.current = structuredClone(EMPTY_ABROAD);
            setProfile(current.current);
            setAbroad(currentAbroad.current);
            modeState("georgia");
          } catch {
            setSaveError(true);
          }
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWebStore() {
  const s = useContext(Context);
  if (!s) throw new Error("Missing web store");
  return s;
}
