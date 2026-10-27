import { Redirect } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AbroadDemoNote, ScholarshipCard } from "@/components/abroad-kit";
import { Chip } from "@/components/kit";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { ABROAD_COUNTRIES, AWARD_TYPE_LABEL, SCHOLARSHIPS, type AwardType } from "@/lib/abroad-data";
import { useAppMode } from "@/lib/store";

export default function AbroadScholarships() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [award, setAward] = useState<AwardType | null>(null);
  const [georgiansOnly, setGeorgiansOnly] = useState(false);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SCHOLARSHIPS.filter((s) => {
      if (needle && !`${s.name} ${s.eligibility}`.toLowerCase().includes(needle)) return false;
      if (country && s.countryId !== country && s.countryId !== "global") return false;
      if (award && s.awardType !== award) return false;
      if (georgiansOnly && !s.forGeorgians) return false;
      return true;
    })
      .slice()
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [q, country, award, georgiansOnly]);

  const clear = () => {
    setQ("");
    setCountry(null);
    setAward(null);
    setGeorgiansOnly(false);
  };
  if (useAppMode() !== "abroad") return <Redirect href="/(tabs)" />;

  const Row = ({ children }: { children: React.ReactNode }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingRight: 16 }} className="mt-2">
      {children}
    </ScrollView>
  );

  const header = (
    <View>
      <Text className="text-3xl font-bold text-foreground">სტიპენდიები</Text>
      <Text className="mt-2 text-sm leading-6 text-muted-foreground">
        საერთაშორისო სტიპენდიებისა და გრანტების საჩვენებელი კატალოგი ქართველი სტუდენტებისთვის.
      </Text>
      <Input className="mt-4 border border-border bg-card" placeholder="მოძებნე სტიპენდია" value={q} onChangeText={setQ} returnKeyType="search" />
      <Row>
        {ABROAD_COUNTRIES.map((co) => (
          <Chip key={co.id} label={`${co.flag} ${co.name}`} selected={country === co.id} onPress={() => setCountry(country === co.id ? null : co.id)} />
        ))}
      </Row>
      <Row>
        {(Object.keys(AWARD_TYPE_LABEL) as AwardType[]).map((k) => (
          <Chip key={k} label={AWARD_TYPE_LABEL[k]} selected={award === k} onPress={() => setAward(award === k ? null : k)} />
        ))}
        <Chip label="🇬🇪 ქართველებისთვის" selected={georgiansOnly} onPress={() => setGeorgiansOnly(!georgiansOnly)} />
      </Row>
      <Text className="mt-4 text-sm text-muted-foreground">{results.length} შეთავაზება · ვადის მიხედვით</Text>
      <View className="h-3" />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <FlatList
        className="flex-1 bg-background"
        data={results}
        keyExtractor={(s) => s.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
        renderItem={({ item }) => <ScholarshipCard scholarship={item} />}
        ListFooterComponent={<AbroadDemoNote className="mt-2" />}
        ListEmptyComponent={
          <View className="items-center p-6">
            <Text className="text-center text-base text-foreground">ამ ფილტრებით სტიპენდია ვერ მოიძებნა.</Text>
            <Button variant="tinted" className="mt-4" onPress={clear}>ფილტრების გასუფთავება</Button>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}
