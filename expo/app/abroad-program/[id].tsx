import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AbroadThemeScope } from "@/components/mode-theme";
import { AbroadDemoNote, EnglishTag } from "@/components/abroad-kit";
import { ConfidenceBadge, ScreenHeader, SectionTitle } from "@/components/kit";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { fieldName } from "@/lib/data";
import {
  abroadProgramById,
  abroadUniversityById,
  countryById,
  formatDeadline,
} from "@/lib/abroad-data";
import { estimateAbroad, examValue, portfolioPrograms, tipsFor, formatTuitionUsd } from "@/lib/abroad-engine";
import { EXAM_META } from "@/lib/abroad-types";
import { useStore } from "@/lib/store";
import { useThemeColors } from "@/lib/theme";

function Info({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  const c = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 py-2">
      <Feather name={icon} size={16} color={c.mutedForeground} />
      <Text className="w-28 text-sm text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}

function ReqRow({ label, required, mine }: { label: string; required: string; mine: number | null }) {
  const c = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 border-b border-border py-2.5">
      <Text className="w-24 text-sm text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-sm font-medium text-foreground">{required}</Text>
      {mine == null ? (
        <Text className="text-xs text-muted-foreground">არ არის შეყვანილი</Text>
      ) : (
        <View className="flex-row items-center gap-1">
          <Feather name="check-circle" size={13} color={c.safe} />
          <Text className="text-xs font-semibold" style={{ color: c.safe }}>{mine}</Text>
        </View>
      )}
    </View>
  );
}

export default function AbroadProgramDetail() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { abroad, updateAbroad } = useStore();
  const prog = abroadProgramById(id);

  if (!prog)
    return (
      <AbroadThemeScope>
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 8 }}>
          <ScreenHeader title="პროგრამა" />
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-center text-muted-foreground">პროგრამა ვერ მოიძებნა.</Text>
            <Button variant="tinted" className="mt-4" onPress={() => router.replace("/abroad-explore")}>
              დაბრუნება ძიებაში
            </Button>
          </View>
        </View>
      </AbroadThemeScope>
    );

  const u = abroadUniversityById(prog.universityId);
  const country = countryById(u.countryId);
  const est = estimateAbroad(abroad, prog);
  const tips = tipsFor(abroad, prog);
  const inPortfolio = portfolioPrograms(abroad).some((x) => x.id === prog.id);

  const togglePortfolio = () =>
    updateAbroad((p) =>
      inPortfolio
        ? {
            ...p,
            ...(p.approvedPortfolio ? { approvedPortfolio: p.approvedPortfolio.filter((x) => x !== prog.id) } : {}),
            removed: [...p.removed, prog.id],
          }
        : {
            ...p,
            ...(p.approvedPortfolio ? { approvedPortfolio: [...new Set([...p.approvedPortfolio, prog.id])] } : {}),
            portfolio: [...new Set([...p.portfolio, prog.id])],
            removed: p.removed.filter((x) => x !== prog.id),
          },
    );

  const en = prog.reqs.english;

  return (
    <AbroadThemeScope>
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 8 }}>
        <ScreenHeader title="პროგრამა" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}>
          <Text className="mt-2 text-xs leading-5 text-muted-foreground">
            {country.flag} {u.name}
          </Text>
          <Text className="mt-1 text-2xl font-bold leading-9 text-foreground">{prog.name}</Text>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            {prog.english && <EnglishTag />}
            <View className="rounded-md bg-secondary px-2 py-1">
              <Text className="text-[11px] font-semibold text-secondary-foreground">{prog.degree} · {prog.years} წელი</Text>
            </View>
          </View>

          {est ? (
            <View className="mt-5 flex-row items-center justify-between rounded-xl border border-border bg-card p-4">
              <ConfidenceBadge confidence={est.confidence} />
              <Text className="text-sm font-semibold text-foreground">საილუსტრაციო შანსი ~{est.pct}%</Text>
            </View>
          ) : (
            <View className="mt-5 rounded-xl border border-border bg-card p-4">
              <Text className="text-sm leading-6 text-foreground">
                შეფასებისთვის მონაცემები არასაკმარისია — შეიყვანე გამოცდების ქულები.
              </Text>
              <Button variant="tinted" className="mt-3" onPress={() => router.push("/abroad-setup")}>
                ქულების შეყვანა
              </Button>
            </View>
          )}

          <SectionTitle>დეტალები</SectionTitle>
          <View className="rounded-xl border border-border bg-card px-4 py-2">
            <Info icon="map-pin" label="მდებარეობა" value={`${u.city}, ${country.name}`} />
            <Info icon="book-open" label="სფერო" value={fieldName(prog.field)} />
            <Info icon="dollar-sign" label="საფასური" value={formatTuitionUsd(prog.tuitionUsd)} />
            <Info icon="credit-card" label="განაცხადის საფასური" value={`$${prog.appFeeUsd}`} />
            <Info icon="users" label="მიღება (დემო)" value={`~${prog.acceptanceRate}%`} />
            <Info icon="clock" label="ვადა" value={formatDeadline(prog.deadline)} />
          </View>

          <SectionTitle>მინიმალური მოთხოვნები</SectionTitle>
          <View className="rounded-xl border border-border bg-card px-4">
            {en && (
              <ReqRow
                label="ინგლისური"
                required={[en.ielts != null ? `IELTS ${en.ielts}` : null, en.toefl != null ? `TOEFL ${en.toefl}` : null, en.duolingo != null ? `Duolingo ${en.duolingo}` : null].filter(Boolean).join(" / ")}
                mine={Math.max(examValue(abroad, "ielts") ?? -1, examValue(abroad, "toefl") ?? -1, examValue(abroad, "duolingo") ?? -1) >= 0 ? Math.max(examValue(abroad, "ielts") ?? 0, examValue(abroad, "toefl") ?? 0, examValue(abroad, "duolingo") ?? 0) : null}
              />
            )}
            {(prog.reqs.sat != null || prog.reqs.act != null) && (
              <ReqRow
                label="SAT / ACT"
                required={[prog.reqs.sat != null ? `SAT ${prog.reqs.sat}` : null, prog.reqs.act != null ? `ACT ${prog.reqs.act}` : null].filter(Boolean).join(" / ")}
                mine={Math.max(examValue(abroad, "sat") ?? -1, examValue(abroad, "act") ?? -1) >= 0 ? Math.max(examValue(abroad, "sat") ?? 0, examValue(abroad, "act") ?? 0) : null}
              />
            )}
            {prog.reqs.gpa != null && <ReqRow label="GPA" required={`≥ ${prog.reqs.gpa}`} mine={examValue(abroad, "gpa")} />}
            {!en && prog.reqs.sat == null && prog.reqs.gpa == null && (
              <Text className="py-3 text-sm text-muted-foreground">სპეციალური მინიმუმები არ არის მითითებული (დემო).</Text>
            )}
          </View>

          {tips.length > 0 && (
            <>
              <SectionTitle>რა გააუმჯობესებს შანსებს</SectionTitle>
              <View className="gap-2">
                {tips.map((t) => (
                  <View key={t} className="flex-row items-start gap-2 rounded-xl bg-secondary px-3 py-2.5">
                    <Feather name="zap" size={14} color={c.accent} style={{ marginTop: 3 }} />
                    <Text className="flex-1 text-sm leading-6 text-secondary-foreground">{t}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text className="mt-6 text-sm leading-6 text-muted-foreground">{prog.blurb}</Text>
          <AbroadDemoNote className="mt-4" />

          <Button className="mt-6 min-h-[52px]" variant={inPortfolio ? "tinted" : "default"} onPress={togglePortfolio}>
            {inPortfolio ? "პორტფოლიოდან ამოღება" : "პორტფოლიოში დამატება"}
          </Button>
          <Pressable onPress={() => router.push("/abroad-explore")} className="mt-2 min-h-[44px] items-center justify-center">
            <Text className="font-semibold text-accent">მსგავსი პროგრამების ძიება</Text>
          </Pressable>
        </ScrollView>
      </View>
    </AbroadThemeScope>
  );
}
