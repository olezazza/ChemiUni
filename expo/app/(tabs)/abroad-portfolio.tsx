import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AbroadDemoNote, AbroadProgramCard } from "@/components/abroad-kit";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import type { AbroadProgram } from "@/lib/abroad-data";
import { estimateAbroad, generateAbroadPortfolio, portfolioPrograms, portfolioStats, type Confidence } from "@/lib/abroad-engine";
import { useAppMode, useStore } from "@/lib/store";
import { useThemeColors } from "@/lib/theme";

const SEGMENTS: { key: Confidence; label: string }[] = [
  { key: "safe", label: "უსაფრთხო" },
  { key: "target", label: "მიზნობრივი" },
  { key: "reach", label: "ამბიციური" },
];

export default function AbroadPortfolio() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { abroad, updateAbroad } = useStore();
  const [generationNotice, setGenerationNotice] = useState("");
  const [replaceOpen, setReplaceOpen] = useState(false);
  const programs = useMemo(() => portfolioPrograms(abroad), [abroad]);
  const stats = portfolioStats(abroad);
  const overBudget = stats.fees > stats.budget;
  if (useAppMode() !== "abroad") return <Redirect href="/(tabs)" />;
  const generate = () => {
    const ids = generateAbroadPortfolio(abroad);
    updateAbroad((p) => ({ ...p, portfolio: ids, approvedPortfolio: ids }));
    setReplaceOpen(false);
    setGenerationNotice(ids.length ? "პორტფოლიო განახლდა შენი პროფილის მიხედვით. გამორიცხული პროგრამები არ დაბრუნდება." : "ამ ბიუჯეტითა და პრეფერენციებით პროგრამა ვერ მოიძებნა. შეცვალე პროფილი ან დაამატე პროგრამა ხელით.");
  };

  const removeItem = (id: string) =>
    updateAbroad((p) => ({
      ...p,
      ...(p.approvedPortfolio ? { approvedPortfolio: p.approvedPortfolio.filter((x) => x !== id) } : {}),
      removed: [...p.removed, id],
    }));

  if (!abroad.setupDone) {
    return (
      <View className="flex-1 bg-background px-6" style={{ paddingTop: insets.top + 24 }}>
        <Text className="text-3xl font-bold text-foreground">პორტფოლიო</Text>
        <View className="flex-1 items-center justify-center pb-16">
          <View className="h-20 w-20 items-center justify-center rounded-xl bg-accent/10">
            <Feather name="briefcase" size={36} color={c.accent} />
          </View>
          <Text className="mt-6 text-center text-2xl font-bold leading-9 text-foreground">შენი განაცხადების პორტფოლიო</Text>
          <Text className="mt-3 text-center text-base leading-6 text-muted-foreground">
            შეავსე პროფილი — ქულები, ინტერესები და სწავლის ბიუჯეტი — პორტფოლიო ავტომატურად შეიქმნება.
          </Text>
          <Button className="mt-8 min-h-[52px] w-full" onPress={() => router.push("/abroad-setup")}>
            პროფილის შევსება
          </Button>
          <Pressable onPress={() => router.push("/abroad-explore")} className="mt-2 min-h-[44px] justify-center">
            <Text className="font-semibold text-accent">ჯერ პროგრამების დათვალიერება</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const total = Math.max(1, stats.count);
  const header = (
    <View>
      <Text className="text-3xl font-bold text-foreground">პორტფოლიო</Text>

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 rounded-xl bg-secondary p-3">
          <Text className="text-2xl font-bold text-accent">
            {stats.count}
            <Text className="text-base text-muted-foreground"> / {stats.target}</Text>
          </Text>
          <Text className="mt-1 text-xs leading-5 text-muted-foreground">განაცხადი მიზნიდან</Text>
        </View>
        <View className="flex-1 rounded-xl bg-secondary p-3">
          <Text className="text-2xl font-bold" style={{ color: overBudget ? c.destructive : c.violet }}>
            ${stats.fees}
            <Text className="text-base text-muted-foreground"> / ${stats.budget}</Text>
          </Text>
          <Text className="mt-1 text-xs leading-5 text-muted-foreground">
            {overBudget ? "ბიუჯეტი გადაჭარბებულია" : "საფასურის ბიუჯეტი"}
          </Text>
        </View>
      </View>

      {stats.count > 0 && (
        <View className="mt-4">
          <View className="h-2.5 flex-row overflow-hidden rounded-full bg-muted">
            {SEGMENTS.map(({ key }) =>
              stats.byConfidence[key] > 0 ? (
                <View key={key} style={{ flex: stats.byConfidence[key] / total, backgroundColor: c[key] }} />
              ) : null,
            )}
          </View>
          <View className="mt-2 flex-row flex-wrap gap-x-4 gap-y-1">
            {SEGMENTS.map(({ key }) => (
              <View key={key} className="flex-row items-center gap-1.5">
                <View className="h-2 w-2 rounded-full" style={{ backgroundColor: c[key] }} />
                <Text className="text-xs text-muted-foreground">
                  {SEGMENTS.find((x) => x.key === key)?.label} · {stats.byConfidence[key]}
                </Text>
              </View>
            ))}
            {stats.unestimated > 0 && (
              <Text className="text-xs text-muted-foreground">შეუფასებელი · {stats.unestimated}</Text>
            )}
          </View>
        </View>
      )}

      <View className="mt-3 flex-row flex-wrap gap-2">
        <Pressable onPress={() => router.push("/abroad-setup")} className="min-h-[44px] flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 active:bg-secondary">
          <Feather name="edit-3" size={15} color={c.accent} />
          <Text className="text-sm font-medium text-foreground">პროფილი</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/abroad-explore")} className="min-h-[44px] flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 active:bg-secondary">
          <Feather name="plus" size={15} color={c.accent} />
          <Text className="text-sm font-medium text-foreground">დამატება</Text>
        </Pressable>
      </View>

      <AbroadDemoNote className="mt-4" />
      <Text className="mt-3 text-xs leading-5 text-muted-foreground">Reach / Target / Safety ბალანსი დამოკიდებულია ხელმისაწვდომ პროგრამებსა და ქულებზე. ნაკლები ვარიანტი ნიშნავს ბიუჯეტის ან პრეფერენციების შეზღუდვას; დაკარგული ქულებით შანსი არ გამოითვლება.</Text>
      <Button className="mt-3" onPress={() => stats.count ? setReplaceOpen(true) : generate()}>რეკომენდებული პორტფოლიოს შექმნა</Button>
      {replaceOpen && <View className="mt-3 border-l-2 border-target pl-3">
        <Text className="text-sm leading-6 text-foreground">არსებული პორტფოლიო ახალი რეკომენდაციებით ჩანაცვლდება. საუბარი შენარჩუნდება; ძველი შეთავაზებები კვლავ შემოწმდება მიღებისას.</Text>
        <Button variant="tinted" className="mt-2" onPress={generate}>ჩანაცვლება</Button>
        <Button variant="ghost" onPress={() => setReplaceOpen(false)}>გაუქმება</Button>
      </View>}
      {!!generationNotice && <Text accessibilityLiveRegion="polite" className="mt-3 text-sm leading-6 text-foreground">{generationNotice}</Text>}
      <Button variant="tinted" className="mt-3" onPress={() => router.push("/abroad-counselor")}>
        AI კონსულტანტი
      </Button>
      <Text className="mb-2 mt-6 text-xs font-semibold tracking-normal text-muted-foreground">
        დაგეგმილი განაცხადები · {programs.length}
      </Text>
    </View>
  );

  return (
    <FlatList<AbroadProgram>
      className="flex-1 bg-background"
      data={programs}
      keyExtractor={(x) => x.id}
      ListHeaderComponent={header}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
      renderItem={({ item }) => (
        <AbroadProgramCard
          program={item}
          est={estimateAbroad(abroad, item)}
          right={
            <Pressable
              onPress={() => removeItem(item.id)}
              hitSlop={6}
              className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full active:bg-secondary"
              accessibilityLabel="პორტფოლიოდან ამოღება"
            >
              <Feather name="x" size={18} color={c.mutedForeground} />
            </Pressable>
          }
        />
      )}
      ListEmptyComponent={
        <View className="items-center p-6">
          <Text className="text-center text-base text-foreground">
            შექმენი რეკომენდებული პორტფოლიო შენი ქულებისა და ბიუჯეტის მიხედვით ან დაამატე პროგრამები ხელით.
          </Text>
          <Button variant="tinted" className="mt-4" onPress={() => router.push("/abroad-explore")}>
            პროგრამების დათვალიერება
          </Button>
        </View>
      }
    />
  );
}
