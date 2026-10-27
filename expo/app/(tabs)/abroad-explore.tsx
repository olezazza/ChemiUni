import { Redirect } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AbroadProgramCard } from "@/components/abroad-kit";
import { Chip, DemoNote } from "@/components/kit";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { FIELDS, type FieldId } from "@/lib/data";
import { ABROAD_COUNTRIES, ABROAD_PROGRAMS, abroadUniversityById, type AbroadCountryId } from "@/lib/abroad-data";
import { estimateAbroad } from "@/lib/abroad-engine";
import { useAppMode, useStore } from "@/lib/store";

type Tuition = "all" | "free" | "low" | "mid" | "high";
type Sort = "relevance" | "chance";

export default function AbroadExplore() {
  const insets = useSafeAreaInsets();
  const { abroad } = useStore();
  const [q, setQ] = useState("");
  const [field, setField] = useState<FieldId | null>(null);
  const [country, setCountry] = useState<AbroadCountryId | null>(null);
  const [tuition, setTuition] = useState<Tuition>("all");
  const [englishOnly, setEnglishOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("relevance");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const r = ABROAD_PROGRAMS.filter((p) => {
      const u = abroadUniversityById(p.universityId);
      if (needle && !`${p.name} ${u.name} ${u.short} ${u.city}`.toLowerCase().includes(needle)) return false;
      if (field && p.field !== field) return false;
      if (country && u.countryId !== country) return false;
      if (englishOnly && !p.english) return false;
      if (tuition === "free" && p.tuitionUsd > 1000) return false;
      if (tuition === "low" && (p.tuitionUsd <= 1000 || p.tuitionUsd > 8000)) return false;
      if (tuition === "mid" && (p.tuitionUsd <= 8000 || p.tuitionUsd > 20000)) return false;
      if (tuition === "high" && p.tuitionUsd <= 20000) return false;
      return true;
    }).map((p) => ({ p, est: estimateAbroad(abroad, p) }));
    if (sort === "chance") r.sort((a, b) => (b.est?.pct ?? -1) - (a.est?.pct ?? -1));
    else
      r.sort(
        (a, b) =>
          Number(b.p.field !== null && abroad.interests.includes(b.p.field)) -
          Number(a.p.field !== null && abroad.interests.includes(a.p.field)),
      );
    return r;
  }, [q, field, country, tuition, englishOnly, sort, abroad]);

  const clear = () => {
    setQ("");
    setField(null);
    setCountry(null);
    setTuition("all");
    setEnglishOnly(false);
  };
  if (useAppMode() !== "abroad") return <Redirect href="/(tabs)" />;

  const Row = ({ children }: { children: React.ReactNode }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingRight: 16 }} className="mt-2">
      {children}
    </ScrollView>
  );

  const header = (
    <View>
      <Text className="text-3xl font-bold text-foreground">აღმოაჩინე მსოფლიო</Text>
      <Input className="mt-4 border border-border bg-card" placeholder="მოძებნე უნივერსიტეტი ან პროგრამა" value={q} onChangeText={setQ} returnKeyType="search" />
      <Row>
        {ABROAD_COUNTRIES.map((co) => (
          <Chip key={co.id} label={`${co.flag} ${co.name}`} selected={country === co.id} onPress={() => setCountry(country === co.id ? null : co.id)} />
        ))}
      </Row>
      <Row>
        {FIELDS.map((f) => (
          <Chip key={f.id} label={f.name} selected={field === f.id} onPress={() => setField(field === f.id ? null : f.id)} />
        ))}
      </Row>
      <Row>
        {([["free", "≈ უფასო"], ["low", "≤ $8 000"], ["mid", "≤ $20 000"], ["high", "> $20 000"]] as const).map(([k, l]) => (
          <Chip key={k} label={l} selected={tuition === k} onPress={() => setTuition(tuition === k ? "all" : k)} />
        ))}
        <Chip label="100% ინგლისურად" selected={englishOnly} onPress={() => setEnglishOnly(!englishOnly)} />
      </Row>
      <View className="mt-4 gap-3">
        <Text className="text-sm text-muted-foreground">{results.length} პროგრამა · სანიმუშო მონაცემები</Text>
        <View className="flex-row gap-1">
          <Chip label="შესაბამისობა" selected={sort === "relevance"} onPress={() => setSort("relevance")} />
          <Chip label="შანსი" selected={sort === "chance"} onPress={() => setSort("chance")} />
        </View>
      </View>
      {sort === "chance" && !abroad.setupDone && (
        <DemoNote className="mt-3" text="შანსით დასალაგებლად შეავსე გამოცდების ქულები პროფილში." />
      )}
      <View className="h-3" />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <FlatList
        className="flex-1 bg-background"
        data={results}
        keyExtractor={(i) => i.p.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
        renderItem={({ item }) => <AbroadProgramCard program={item.p} est={item.est} />}
        ListEmptyComponent={
          <View className="items-center p-6">
            <Text className="text-center text-base text-foreground">ამ ფილტრებით პროგრამა ვერ მოიძებნა.</Text>
            <Button variant="tinted" className="mt-4" onPress={clear}>ფილტრების გასუფთავება</Button>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}
