import { vars } from "nativewind";
import type { ReactNode } from "react";
import { View } from "react-native";

import { useAppMode } from "@/lib/store";
import { abroadVars, useAppColorScheme } from "@/lib/theme";

/**
 * Scopes the Abroad Mode palette to its subtree via NativeWind CSS variables,
 * so semantic classes (bg-card, text-foreground, …) recolor on every platform.
 * In Georgia Mode it renders children unchanged.
 */
export function AbroadThemeScope({ children }: { children: ReactNode }) {
  const mode = useAppMode();
  const scheme = useAppColorScheme();
  if (mode !== "abroad") return <>{children}</>;
  return <View style={[{ flex: 1 }, vars(abroadVars(scheme))]}>{children}</View>;
}
