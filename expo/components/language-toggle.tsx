// ქარ / ENG switch. Used on the welcome screen and in Profile.
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { setLang, useLang, type Lang } from "@/lib/language";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <View className={cn("flex-row self-start rounded-full border border-border bg-card p-1", className)}>
      {(["ka", "en"] as Lang[]).map((l) => (
        <Pressable
          key={l}
          accessibilityRole="button"
          accessibilityLabel={l === "ka" ? "ქართული" : "English"}
          accessibilityState={{ selected: lang === l }}
          onPress={() => setLang(l)}
          className={cn("min-h-[44px] min-w-[64px] items-center justify-center rounded-full px-4", lang === l ? "bg-primary" : "")}
        >
          <Text className={cn("text-sm font-bold", lang === l ? "text-primary-foreground" : "text-muted-foreground")}>
            {l === "ka" ? "ქარ" : "ENG"}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
