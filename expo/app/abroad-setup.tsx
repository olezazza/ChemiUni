import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AbroadThemeScope } from "@/components/mode-theme";
import { Chip, DemoNote, ScreenHeader, SectionTitle } from "@/components/kit";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { FIELDS, type FieldId } from "@/lib/data";
import { ABROAD_COUNTRIES } from "@/lib/abroad-data";
import {
  ABROAD_EXAM_STATUS_LABEL,
  EXAM_META,
  EXAM_ORDER,
  FEE_BUDGET_OPTIONS,
  STUDY_BUDGET_OPTIONS,
  type StudyBudget,
  type AbroadExamStatus,
  type ExamKind,
} from "@/lib/abroad-types";
import { savedFormDestination } from "@/lib/form-navigation";
import { generateAbroadPortfolio } from "@/lib/abroad-engine";
import { useStore } from "@/lib/store";

const TARGET_OPTIONS = [4, 6, 8, 10, 12];

export default function AbroadSetup() {
  const insets = useSafeAreaInsets();
  const { abroad, updateAbroad } = useStore();

  const [gradYear, setGradYear] = useState(abroad.gradYear);
  const [interests, setInterests] = useState<FieldId[]>(abroad.interests);
  const [countries, setCountries] = useState<string[]>(abroad.countries);
  const [statuses, setStatuses] = useState<Record<ExamKind, AbroadExamStatus>>(() =>
    Object.fromEntries(EXAM_ORDER.map((k) => [k, abroad.exams[k].status])) as Record<ExamKind, AbroadExamStatus>,
  );
  const [scores, setScores] = useState<Record<ExamKind, string>>(() =>
    Object.fromEntries(EXAM_ORDER.map((k) => [k, abroad.exams[k].score?.toString() ?? ""])) as Record<ExamKind, string>,
  );
  const [targetApps, setTargetApps] = useState(abroad.targetApps);
  const [feeBudget, setFeeBudget] = useState(abroad.feeBudgetUsd);
  const [studyBudget, setStudyBudget] = useState<StudyBudget>(abroad.studyBudget ?? "flexible");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const save = () => {
    const e: Record<string, string> = {};
    if (gradYear && (!/^\d{4}$/.test(gradYear) || +gradYear < 2026 || +gradYear > 2035))
      e.gradYear = "წელი უნდა იყოს 2026–2035";
    for (const k of EXAM_ORDER) {
      if (statuses[k] === "none") continue;
      const raw = scores[k].trim();
      if (!raw) {
        e[k] = "შეიყვანე ქულა ან მონიშნე „ჯერ არ მაქვს“";
        continue;
      }
      const v = parseFloat(raw.replace(",", "."));
      if (Number.isNaN(v) || v < 0 || v > EXAM_META[k].max) e[k] = `ქულა უნდა იყოს ${EXAM_META[k].placeholder}`;
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    const exams = Object.fromEntries(
      EXAM_ORDER.map((k) => [
        k,
        statuses[k] === "none"
          ? { status: "none" as const, score: null }
          : { status: statuses[k], score: parseFloat(scores[k].replace(",", ".")) },
      ]),
    ) as typeof abroad.exams;
    updateAbroad((p) => {
      const next = { ...p, setupDone: true, gradYear, interests, countries, exams, targetApps, feeBudgetUsd: feeBudget, studyBudget };
      return !p.setupDone && p.portfolio.length === 0 && p.approvedPortfolio === undefined
        ? { ...next, portfolio: generateAbroadPortfolio(next) } : next;
    });
    if (!abroad.setupDone) { router.replace("/(tabs)/abroad-portfolio"); return; }
    const destination = savedFormDestination(router.canGoBack());
    if (destination === "back") router.back();
    else router.replace(destination);
  };

  return (
    <AbroadThemeScope>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} className="bg-background">
        <View style={{ paddingTop: insets.top + 8 }} className="bg-background">
          <ScreenHeader title={abroad.setupDone ? "Abroad-პროფილის რედაქტირება" : "Abroad-პროფილი"} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}>
          <DemoNote text="ეს პროფილი მხოლოდ Abroad-რეჟიმს ეხება და საქართველოს ქულებს არ ცვლის. ყველა შეფასება საჩვენებელია." />

          <SectionTitle>დამთავრების წელი</SectionTitle>
          <Input
            keyboardType="number-pad"
            maxLength={4}
            placeholder="მაგ. 2027"
            value={gradYear}
            onChangeText={(t) => setGradYear(t.replace(/\D/g, ""))}
            className={errors.gradYear ? "border-destructive bg-card" : "border-border bg-card"}
            accessibilityLabel="დამთავრების წელი"
          />
          {errors.gradYear && <Text className="mt-1 text-xs text-destructive">{errors.gradYear}</Text>}

          <SectionTitle>აკადემიური ინტერესები</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {FIELDS.map((f) => (
              <Chip key={f.id} label={f.name} selected={interests.includes(f.id)} onPress={() => setInterests(toggle(interests, f.id))} />
            ))}
          </View>

          <SectionTitle>სასურველი ქვეყნები</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {ABROAD_COUNTRIES.map((co) => (
              <Chip key={co.id} label={`${co.flag} ${co.name}`} selected={countries.includes(co.id)} onPress={() => setCountries(toggle(countries, co.id))} />
            ))}
          </View>
          <Text className="mt-2 text-xs leading-5 text-muted-foreground">არჩევის გარეშე ყველა ქვეყანი გამოჩნდება.</Text>

          <SectionTitle>სწავლის წლიური ბიუჯეტი</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {STUDY_BUDGET_OPTIONS.map((x) => <Chip key={x.id} label={x.label} selected={studyBudget === x.id} onPress={() => setStudyBudget(x.id)} />)}
          </View>
          <Text className="mt-2 text-xs leading-5 text-muted-foreground">მხოლოდ სწავლის საფასური; საცხოვრებელი არ შედის. დემო კონვერტაცია: €1 = $1.10. დიაპაზონი ზედა ზღვარს ადგენს — იაფი ვარიანტებიც შედის.</Text>

          <SectionTitle>გამოცდები</SectionTitle>
          {EXAM_ORDER.map((k) => (
            <View key={k} className="mt-4">
              <Text className="mb-1.5 text-sm font-medium text-foreground">{EXAM_META[k].label}</Text>
              <View className="flex-row flex-wrap gap-2">
                {(Object.keys(ABROAD_EXAM_STATUS_LABEL) as AbroadExamStatus[]).map((st) => (
                  <Chip key={st} label={ABROAD_EXAM_STATUS_LABEL[st]} selected={statuses[k] === st} onPress={() => setStatuses((s) => ({ ...s, [k]: st }))} />
                ))}
              </View>
              {statuses[k] !== "none" && (
                <Input
                  className={`mt-2 ${errors[k] ? "border-destructive bg-card" : "border-border bg-card"}`}
                  keyboardType="decimal-pad"
                  maxLength={6}
                  placeholder={EXAM_META[k].placeholder}
                  value={scores[k]}
                  onChangeText={(t) => setScores((s) => ({ ...s, [k]: t.replace(/[^0-9.,]/g, "") }))}
                  accessibilityLabel={`${EXAM_META[k].label} ქულა`}
                />
              )}
              {errors[k] && <Text className="mt-1 text-xs text-destructive">{errors[k]}</Text>}
            </View>
          ))}

          <SectionTitle>განაცხადების რაოდენობა</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {TARGET_OPTIONS.map((n) => (
              <Chip key={n} label={`${n} განაცხადი`} selected={targetApps === n} onPress={() => setTargetApps(n)} />
            ))}
          </View>

          <SectionTitle>განაცხადების საფასურის ბიუჯეტი</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {FEE_BUDGET_OPTIONS.map((n) => (
              <Chip key={n} label={`$${n}`} selected={feeBudget === n} onPress={() => setFeeBudget(n)} />
            ))}
          </View>

          <Button className="mt-6 min-h-[52px]" onPress={save}>
            {abroad.setupDone ? "ცვლილებების შენახვა" : "შენახვა და პორტფოლიოს შექმნა"}
          </Button>
          {Object.keys(errors).length > 0 && (
            <Text className="mt-2 text-center text-sm text-destructive">გთხოვ, შეასწორე მონიშნული ველები.</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AbroadThemeScope>
  );
}
