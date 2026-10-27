import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AbroadDemoNote, AbroadProgramCard } from "@/components/abroad-kit";
import { SectionTitle } from "@/components/kit";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { formatDeadline, type AbroadProgram } from "@/lib/abroad-data";
import { estimateAbroad, portfolioStats, topMatches, upcomingDeadlines } from "@/lib/abroad-engine";
import { EXAM_META, EXAM_ORDER } from "@/lib/abroad-types";
import { useAppMode, useStore } from "@/lib/store";
import { useThemeColors } from "@/lib/theme";

export default function AbroadHome() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { profile, abroad } = useStore();
  const name = profile.account.name.trim();
  const stats = portfolioStats(abroad);
  const deadlines = useMemo(() => upcomingDeadlines(abroad), [abroad]);
  const featured = useMemo(() => topMatches(abroad), [abroad]);
  const examsTaken = EXAM_ORDER.filter((k) => abroad.exams[k].status !== "none").length;
  if (useAppMode() !== "abroad") return <Redirect href="/(tabs)" />;

  const header = (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="font-display text-xl font-bold text-accent">
          ChemiUni<Text className="text-xl text-violet"> 🌍</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="პროფილი"
          onPress={() => router.push("/profile")}
          className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-secondary"
        >
          <Feather name="user" size={19} color={c.accent} />
        </Pressable>
      </View>
      <Text className="mt-6 text-sm text-muted-foreground">{name ? `გამარჯობა, ${name}` : "გამარჯობა"}</Text>
      <Text className="mt-2 text-3xl font-bold leading-10 text-foreground">მსოფლიო შენი{"\n"}საზღვრების მიღმა.</Text>

      {abroad.setupDone ? (
        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-secondary p-3">
            <Text className="text-2xl font-bold text-accent">
              {stats.count}
              <Text className="text-base text-muted-foreground"> / {stats.target}</Text>
            </Text>
            <Text className="mt-1 text-xs leading-5 text-muted-foreground">განაცხადი პორტფოლიოში</Text>
          </View>
          <View className="flex-1 rounded-xl bg-secondary p-3">
            <Text className="text-2xl font-bold text-violet">
              ${stats.fees}
              <Text className="text-base text-muted-foreground"> / ${stats.budget}</Text>
            </Text>
            <Text className="mt-1 text-xs leading-5 text-muted-foreground">განაცხადის საფასური</Text>
          </View>
          <View className="flex-1 rounded-xl bg-secondary p-3">
            <Text className="text-2xl font-bold text-target">{examsTaken} / 6</Text>
            <Text className="mt-1 text-xs leading-5 text-muted-foreground">გამოცდა შევსებულია</Text>
          </View>
        </View>
      ) : (
        <View className="mt-5 flex-row items-center gap-3">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-target-soft">
            <Feather name="arrow-up-right" size={18} color={c.target} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">პირველი ნაბიჯი — შენი პროფილი</Text>
            <Text className="mt-1 text-xs leading-5 text-muted-foreground">
              გამოცდები, ინტერესები და ბიუჯეტი — რომ შეფასებები გამოჩნდეს
            </Text>
          </View>
        </View>
      )}
      {!abroad.setupDone && (
        <Button className="mt-4 min-h-[52px]" onPress={() => router.push("/abroad-setup")}>
          პროფილის შევსება
        </Button>
      )}

      <View className="mt-5 flex-row gap-3">
        {([
          ["search", "აღმოაჩინე", "/abroad-explore"],
          ["award", "სტიპენდიები", "/abroad-scholarships"],
          ["briefcase", "პორტფოლიო", "/abroad-portfolio"],
        ] as const).map(([icon, label, path]) => (
          <Pressable
            key={path}
            accessibilityRole="button"
            onPress={() => router.push(path)}
            className="min-h-[64px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary px-2"
          >
            <Feather name={icon} size={19} color={c.accent} />
            <Text className="text-center text-xs font-semibold text-foreground">{label}</Text>
          </Pressable>
        ))}
      </View>

      {deadlines.length > 0 && (
        <>
          <SectionTitle>უახლოესი ვადები</SectionTitle>
          <View className="gap-2">
            {deadlines.map(({ program, university, country }) => (
              <Pressable
                key={program.id}
                onPress={() => router.push(`/abroad-program/${program.id}`)}
                accessibilityRole="button"
                className="min-h-[44px] flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 active:bg-secondary"
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-target-soft">
                  <Feather name="clock" size={16} color={c.target} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{program.name}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {country.flag} {university.short}
                  </Text>
                </View>
                <Text className="text-xs font-semibold text-target">{formatDeadline(program.deadline)}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <SectionTitle>შესაბამისი პროგრამები</SectionTitle>
      <Text className="mb-4 text-sm text-muted-foreground">სანიმუშო შეფასებით — დემო მონაცემები</Text>
    </View>
  );

  return (
    <FlatList<AbroadProgram>
      className="flex-1 bg-background"
      data={featured}
      keyExtractor={(x) => x.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => <AbroadProgramCard program={item} est={estimateAbroad(abroad, item)} />}
      ListFooterComponent={<AbroadDemoNote className="mt-5" />}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
    />
  );
}
