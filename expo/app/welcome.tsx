import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AbroadThemeScope } from "@/components/mode-theme";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { LanguageToggle } from "@/components/language-toggle";
import { modeDestination } from "@/lib/mode-entry";
import { useStore } from "@/lib/store";
import { useThemeColors } from "@/lib/theme";

export default function Index() {
  const { profile, abroad, setMode } = useStore();
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const choose = (mode: "georgia" | "abroad") => {
    setMode(mode);
    router.replace(modeDestination(mode, profile, abroad));
  };
  return (
    <AbroadThemeScope>
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingLeft: insets.left + 24, paddingRight: insets.right + 24 }}>
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-display text-3xl font-bold text-foreground">ChemiUni</Text>
          <LanguageToggle />
        </View>
        <Text className="mt-3 text-lg leading-7 text-muted-foreground">რომელი გზით იწყებ?</Text>
        <View className="mt-8 flex-1 justify-center border-b border-border py-8">
          <View className="flex-row items-center gap-3"><Text className="text-3xl">🇬🇪</Text><Feather name="book-open" size={28} color={c.accent} /></View>
          <Text className="mt-5 text-2xl font-bold leading-9 text-foreground">საქართველოში სწავლა</Text>
          <Text className="mt-2 text-sm leading-6 text-muted-foreground">ერთიანი ეროვნული გამოცდები · NAEC</Text>
          <Button accessibilityRole="button" accessibilityLabel="საქართველოში სწავლა" className="mt-6 min-h-[52px]" onPress={() => choose("georgia")}>საქართველოში სწავლა</Button>
        </View>
        <View className="flex-1 justify-center py-8">
          <View className="flex-row items-center gap-3"><Text className="text-3xl">🌍</Text><Feather name="compass" size={28} color={c.violet} /></View>
          <Text className="mt-5 text-2xl font-bold leading-9 text-foreground">უცხოეთში სწავლა</Text>
          <Text className="mt-2 text-sm leading-6 text-muted-foreground">საერთაშორისო პროგრამები · Global Applications</Text>
          <Button accessibilityRole="button" accessibilityLabel="უცხოეთში სწავლა" variant="tinted" className="mt-6 min-h-[52px]" onPress={() => choose("abroad")}>უცხოეთში სწავლა</Button>
        </View>
      </ScrollView>
    </AbroadThemeScope>
  );
}
