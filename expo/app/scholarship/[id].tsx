import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AbroadThemeScope } from "@/components/mode-theme";
import { AbroadDemoNote } from "@/components/abroad-kit";
import { ScreenHeader, SectionTitle } from "@/components/kit";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { SCHOLARSHIPS, formatDeadline, formatUsd } from "@/lib/abroad-data";
import { scholarshipDetails } from "@/lib/scholarship-details";

export default function ScholarshipDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [linkError, setLinkError] = useState(false);
  const scholarship = SCHOLARSHIPS.find((s) => s.id === id);
  const detail = scholarship ? scholarshipDetails(scholarship) : null;
  const openGuide = async () => {
    if (!detail?.url) return;
    setLinkError(false);
    try { await Linking.openURL(detail.url); } catch { setLinkError(true); }
  };
  return <AbroadThemeScope><View className="flex-1 bg-background">
    <View style={{ paddingTop: insets.top }}><ScreenHeader title="სტიპენდიის დეტალები" /></View>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}>
      {!scholarship || !detail ? <Text className="mt-6 text-foreground">სტიპენდია ვერ მოიძებნა.</Text> : <>
        <Text className="mt-3 text-2xl font-bold leading-9 text-foreground">{scholarship.name}</Text>
        <Text className="mt-3 text-base font-semibold text-target">{scholarship.amountUsd == null ? "ცვლადი ოდენობა (დემო)" : `${formatUsd(scholarship.amountUsd)} / წელი (დემო)`}</Text>
        <Text className="mt-2 text-sm leading-6 text-foreground">საჩვენებელი ვადა: {formatDeadline(scholarship.deadline)}</Text>
        <AbroadDemoNote className="mt-4" />
        <SectionTitle>რას ფარავს</SectionTitle>
        {detail.coverage.map((x) => <View key={x.label} className="border-b border-border py-3"><Text className="font-semibold text-foreground">{x.label}</Text><Text className="mt-1 text-sm leading-6 text-muted-foreground">{x.value}</Text></View>)}
        <SectionTitle>საქართველოს მოქალაქეებისთვის</SectionTitle>
        {detail.eligibility.map((x) => <Text key={x} className="mb-3 text-sm leading-6 text-foreground">{x}</Text>)}
        <SectionTitle>საბუთების საჩვენებელი სია</SectionTitle>
        {detail.documents.map((x) => <Text key={x} className="mb-2 text-sm leading-6 text-foreground">• {x}</Text>)}
        <SectionTitle>განაცხადის მომზადება</SectionTitle>
        {detail.steps.map((x, i) => <Text key={x} className="mb-3 text-sm leading-6 text-foreground">{i + 1}. {x}</Text>)}
        <Text className="mt-3 text-xs leading-5 text-muted-foreground">ეს არის დემო საკონტროლო სია, არა ოფიციალური მოთხოვნები. რეალური ვადა და დაფარვა შეიძლება განსხვავდებოდეს.</Text>
        {detail.url ? <Button className="mt-5" onPress={() => void openGuide()}>ოფიციალური საინფორმაციო საიტი ↗</Button> : <Text className="mt-5 text-sm leading-6 text-muted-foreground">განაცხადის დადასტურებული ბმული არ გვაქვს. მოძებნე პროვაიდერის ოფიციალურ საიტზე; გამოგონილი გრანტი რეალურ განაცხადებს არ იღებს.</Text>}
        {linkError && <Text className="mt-3 text-sm text-destructive">ბმული ვერ გაიხსნა. ხელახლა სცადე.</Text>}
      </>}
    </ScrollView>
  </View></AbroadThemeScope>;
}