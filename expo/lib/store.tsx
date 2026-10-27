import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { EMPTY_PROFILE, type Profile } from "./types";
import { EMPTY_ABROAD, type AbroadProfile } from "./abroad-types";

const KEY = "chemiuni.profile.v1";
// Abroad Mode lives in its own keys: switching modes never touches Georgia data.
const MODE_KEY = "chemiuni.mode.v1";
const ABROAD_KEY = "chemiuni.abroad.v1";

export type AppMode = "georgia" | "abroad";

type Ctx = {
  ready: boolean;
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
  reset: () => Promise<void>;
  saveError: boolean;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  abroad: AbroadProfile;
  updateAbroad: (fn: (p: AbroadProfile) => AbroadProfile) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [mode, setModeState] = useState<AppMode>("georgia");
  const [abroad, setAbroad] = useState<AbroadProfile>(EMPTY_ABROAD);
  const [saveError, setSaveError] = useState(false);
  const current = useRef(profile);
  const currentAbroad = useRef(abroad);
  const writes = useRef<Promise<unknown>>(Promise.resolve());
  const abroadWrites = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEY),
      AsyncStorage.getItem(MODE_KEY),
      AsyncStorage.getItem(ABROAD_KEY),
    ])
      .then(([raw, rawMode, rawAbroad]) => {
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Profile>;
          const restored = {
            ...EMPTY_PROFILE,
            ...saved,
            scores: { ...EMPTY_PROFILE.scores, ...saved.scores },
            prefs: { ...EMPTY_PROFILE.prefs, ...saved.prefs },
            account: { ...EMPTY_PROFILE.account, ...saved.account },
          };
          current.current = restored;
          setProfile(restored);
        }
        if (rawMode === "abroad" || rawMode === "georgia") setModeState(rawMode);
        if (rawAbroad) {
          const saved = JSON.parse(rawAbroad) as Partial<AbroadProfile>;
          const restored = {
            ...EMPTY_ABROAD,
            ...saved,
            exams: { ...EMPTY_ABROAD.exams, ...saved.exams },
          };
          currentAbroad.current = restored;
          setAbroad(restored);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((fn: (p: Profile) => Profile) => {
    const next = fn(current.current);
    current.current = next;
    setProfile(next);
    // Serialize writes so an earlier message cannot overwrite a later approval.
    writes.current = writes.current
      .catch(() => {})
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(next)))
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, []);

  const updateAbroad = useCallback((fn: (p: AbroadProfile) => AbroadProfile) => {
    const next = fn(currentAbroad.current);
    currentAbroad.current = next;
    setAbroad(next);
    abroadWrites.current = abroadWrites.current
      .catch(() => {})
      .then(() => AsyncStorage.setItem(ABROAD_KEY, JSON.stringify(next)))
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, []);

  // Switching modes only flips the mode key — neither profile is read or written.
  const setMode = useCallback((m: AppMode) => {
    setModeState(m);
    AsyncStorage.setItem(MODE_KEY, m).catch(() => setSaveError(true));
  }, []);

  const reset = useCallback(async () => {
    await writes.current.catch(() => {});
    await abroadWrites.current.catch(() => {});
    await AsyncStorage.multiRemove([KEY, MODE_KEY, ABROAD_KEY]);
    current.current = EMPTY_PROFILE;
    currentAbroad.current = EMPTY_ABROAD;
    setSaveError(false);
    setProfile(EMPTY_PROFILE);
    setAbroad(EMPTY_ABROAD);
    setModeState("georgia");
  }, []);

  const value = useMemo(
    () => ({ ready, profile, update, reset, saveError, mode, setMode, abroad, updateAbroad }),
    [ready, profile, update, reset, saveError, mode, setMode, abroad, updateAbroad],
  );
  // Children mount only after saved data loads, so no screen can overwrite it with defaults.
  return <StoreContext.Provider value={value}>{ready ? children : null}</StoreContext.Provider>;
}

export function useStore() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

/** Safe outside the provider (e.g. root layout): defaults to Georgia mode. */
export function useAppMode(): AppMode {
  return useContext(StoreContext)?.mode ?? "georgia";
}
