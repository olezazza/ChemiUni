import { DarkTheme, DefaultTheme, type Theme } from "expo-router";
import { useColorScheme } from "nativewind";

import { useAppMode } from "./store";

// Mirrored as RGB channels in global.css.
const light = {"background": "#f7f8fc", "foreground": "#20283e", "card": "#ffffff", "cardForeground": "#20283e", "primary": "#315cda", "primaryForeground": "#ffffff", "accent": "#315cda", "accentForeground": "#ffffff", "secondary": "#eaf0fb", "secondaryForeground": "#20283e", "muted": "#edf0f6", "mutedForeground": "#58647b", "destructive": "#b43349", "destructiveForeground": "#ffffff", "border": "#dce2ed", "input": "#eef2f9", "safe": "#16735e", "target": "#936010", "reach": "#7554ad", "violet": "#7554ad", "violetSoft": "#eee8fa", "safeSoft": "#e1f4ec", "targetSoft": "#fff0d4", "reachSoft": "#eee8fa"} as const;
const dark = {"background": "#121927", "foreground": "#eef2fc", "card": "#1c2638", "cardForeground": "#eef2fc", "primary": "#416de2", "primaryForeground": "#ffffff", "accent": "#9ebcff", "accentForeground": "#121927", "secondary": "#29364c", "secondaryForeground": "#eef2fc", "muted": "#263247", "mutedForeground": "#afbdd2", "destructive": "#ff9ba9", "destructiveForeground": "#121927", "border": "#35435a", "input": "#263247", "safe": "#8cdbc0", "target": "#f1c475", "reach": "#c7acff", "violet": "#c7acff", "violetSoft": "#352e4c", "safeSoft": "#203c39", "targetSoft": "#423829", "reachSoft": "#352e4c"} as const;

// Abroad Mode: warm sunny light palette and midnight neon dark palette.
// Same token names, so every existing component recolors automatically.
const abroadLight = {"background": "#faf3e7", "foreground": "#33291f", "card": "#fffdf8", "cardForeground": "#33291f", "primary": "#c94a22", "primaryForeground": "#ffffff", "accent": "#c94a22", "accentForeground": "#ffffff", "secondary": "#f5e8d3", "secondaryForeground": "#33291f", "muted": "#f0e6d8", "mutedForeground": "#7a6a55", "destructive": "#b02e2e", "destructiveForeground": "#ffffff", "border": "#e8dcc6", "input": "#f6efe2", "safe": "#0e7a68", "target": "#a06d08", "reach": "#c2443a", "violet": "#0e8f8a", "violetSoft": "#d9f0ec", "safeSoft": "#dcf0e9", "targetSoft": "#f9ecc8", "reachSoft": "#fbe3dc"} as const;
const abroadDark = {"background": "#101027", "foreground": "#f4f2ff", "card": "#282044", "cardForeground": "#f4f2ff", "primary": "#ff796f", "primaryForeground": "#211020", "accent": "#ff8b80", "accentForeground": "#211020", "secondary": "#332858", "secondaryForeground": "#f4f2ff", "muted": "#2c284a", "mutedForeground": "#c2bbdf", "destructive": "#ff9ca4", "destructiveForeground": "#101027", "border": "#51446f", "input": "#25213e", "safe": "#45eed6", "target": "#ffd15e", "reach": "#ffa0cd", "violet": "#70edff", "violetSoft": "#193b4d", "safeSoft": "#173c3c", "targetSoft": "#45351e", "reachSoft": "#482643"} as const;

export const palette = { light, dark } as const;
export const abroadPalette = { light: abroadLight, dark: abroadDark } as const;
export type ColorScheme = keyof typeof palette;
export type ThemeColors = { [K in keyof typeof light]: string };
export function useAppColorScheme(): ColorScheme {
  return useColorScheme().colorScheme === "dark" ? "dark" : "light";
}
export function useThemeColors(): ThemeColors {
  const scheme = useAppColorScheme();
  const mode = useAppMode();
  return mode === "abroad" ? abroadPalette[scheme] : palette[scheme];
}

const hexChannels = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

const VAR_KEYS: Record<string, keyof ThemeColors> = {
  "--background": "background",
  "--foreground": "foreground",
  "--card": "card",
  "--card-foreground": "cardForeground",
  "--primary": "primary",
  "--primary-foreground": "primaryForeground",
  "--accent": "accent",
  "--accent-foreground": "accentForeground",
  "--secondary": "secondary",
  "--secondary-foreground": "secondaryForeground",
  "--muted": "muted",
  "--muted-foreground": "mutedForeground",
  "--destructive": "destructive",
  "--destructive-foreground": "destructiveForeground",
  "--border": "border",
  "--input": "input",
  "--safe": "safe",
  "--target": "target",
  "--reach": "reach",
  "--violet": "violet",
  "--violet-soft": "violetSoft",
  "--safe-soft": "safeSoft",
  "--target-soft": "targetSoft",
  "--reach-soft": "reachSoft",
};

/** CSS variable overrides for NativeWind's vars() scope in Abroad Mode. */
export function abroadVars(scheme: ColorScheme): Record<string, string> {
  const colors = abroadPalette[scheme];
  const out: Record<string, string> = {};
  for (const [cssVar, key] of Object.entries(VAR_KEYS)) out[cssVar] = hexChannels(colors[key]);
  return out;
}

function navigationTheme(scheme: ColorScheme, base: Theme, colors: ThemeColors = palette[scheme]): Theme {
  return { ...base, dark: scheme === "dark", colors: { primary: colors.accent, background: colors.background, card: colors.card, text: colors.foreground, border: colors.border, notification: colors.destructive } };
}
export const navigationThemes = { light: navigationTheme("light", DefaultTheme), dark: navigationTheme("dark", DarkTheme) };
export const abroadNavigationThemes = {
  light: navigationTheme("light", DefaultTheme, abroadPalette.light),
  dark: navigationTheme("dark", DarkTheme, abroadPalette.dark),
};
