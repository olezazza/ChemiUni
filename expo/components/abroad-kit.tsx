import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { ConfidenceBadge, DemoNote } from "@/components/kit";
import { Text } from "@/components/ui/Text";
import {
  abroadUniversityById,
  countryById,
  formatDeadline,
  formatUsd,
  AWARD_TYPE_LABEL,
  type AbroadProgram,
  type Scholarship,
} from "@/lib/abroad-data";
import { estimateAbroad, formatTuitionUsd, tipsFor, type AbroadEstimate } from "@/lib/abroad-engine";
import { useStore } from "@/lib/store";
import { useThemeColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function EnglishTag() {
  const c = useThemeColors();
  return (
    <View className="flex-row items-center gap-1 rounded-md bg-safe-soft px-2 py-1">
      <Feather name="globe" size={11} color={c.safe} />
      <Text className="text-[11px] font-semibold" style={{ color: c.safe }}>100% ინგლისურად</Text>
    </View>
  );
}

export function AbroadProgramCard({
  program,
  est,
  reasons,
  right,
}: {
  program: AbroadProgram;
  est: AbroadEstimate;
  reasons?: string[];
  right?: React.ReactNode;
}) {
  const c = useThemeColors();
  const { abroad } = useStore();
  const u = abroadUniversityById(program.universityId);
  const country = countryById(u.countryId);
  const value = est ?? estimateAbroad(abroad, program);
  return (
    <Pressable
      onPress={() => router.push(`/abroad-program/${program.id}`)}
      className="min-h-[44px] rounded-xl border border-border bg-card p-4 active:bg-secondary"
      accessibilityRole="button"
      accessibilityLabel={`${u.name}, ${program.name}`}
    >
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <Text className="text-xs leading-5 text-muted-foreground">
            {country.flag} {u.name}
          </Text>
          <Text className="mt-0.5 text-base font-semibold leading-6 text-foreground">{program.name}</Text>
          <View className="mt-1.5 flex-row flex-wrap items-center gap-x-3 gap-y-1.5">
            <View className="flex-row items-center gap-1">
              <Feather name="map-pin" size={12} color={c.mutedForeground} />
              <Text className="text-xs text-muted-foreground">{u.city}</Text>
            </View>
            <Text className="text-xs text-muted-foreground">{formatTuitionUsd(program.tuitionUsd)}</Text>
            {program.english && <EnglishTag />}
          </View>
        </View>
        {right}
      </View>
      {value ? (
        <View className="mt-4 flex-row flex-wrap items-center justify-between gap-2">
          <ConfidenceBadge confidence={value.confidence} />
          <Text className="text-xs font-semibold text-foreground">საილუსტრაციო შანსი ~{value.pct}%</Text>
        </View>
      ) : (
        <View className="mt-4 flex-row items-start gap-2 self-start rounded-md bg-muted px-2.5 py-1.5">
          <Feather name="help-circle" size={13} color={c.foreground} style={{ marginTop: 3 }} />
          <Text className="flex-1 text-xs leading-5 text-foreground">
            შეფასებისთვის მონაცემები არასაკმარისია — შეიყვანე გამოცდების ქულები პროფილში
          </Text>
        </View>
      )}
      {value && tipsFor(abroad, program).slice(0, 1).map((tip) => (
        <View key={tip} className="mt-3 flex-row items-start gap-2 border-l-2 border-violet pl-3">
          <Feather name="zap" size={13} color={c.violet} style={{ marginTop: 3 }} />
          <Text className="flex-1 text-xs leading-5 text-foreground">{tip}</Text>
        </View>
      ))}
      {reasons && reasons.length > 0 && (
        <View className="mt-3 gap-1">
          {reasons.map((r) => (
            <View key={r} className="flex-row items-start gap-2">
              <Feather name="check" size={13} color={c.accent} style={{ marginTop: 3 }} />
              <Text className="flex-1 text-sm leading-5 text-foreground">{r}</Text>
            </View>
          ))}
        </View>
      )}
      <View className="mt-3 flex-row items-center justify-end gap-1">
        <Text className="text-sm font-semibold text-accent">დეტალები</Text>
        <Feather name="chevron-right" size={16} color={c.accent} />
      </View>
    </Pressable>
  );
}

export function ScholarshipCard({ scholarship: s }: { scholarship: Scholarship }) {
  const c = useThemeColors();
  const country = s.countryId === "global" ? { name: "გლობალური", flag: "🌍" } : countryById(s.countryId);
  return (
    <Pressable onPress={() => router.push(`/scholarship/${s.id}`)} accessibilityRole="button" accessibilityLabel={`${s.name}, დეტალები`} className="min-h-[44px] rounded-lg border border-border bg-card p-4 active:bg-secondary">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-target-soft">
          <Feather name="award" size={18} color={c.target} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold leading-6 text-foreground">{s.name}</Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {country.flag} {country.name}
            {s.amountUsd != null ? ` · ${formatUsd(s.amountUsd)} / წელი` : ""}
          </Text>
        </View>
        <View className={cn("rounded-md px-2 py-1", s.awardType === "full-ride" ? "bg-safe-soft" : s.awardType === "tuition" ? "bg-violet-soft" : "bg-target-soft")}>
          <Text
            className="text-[11px] font-semibold"
            style={{ color: s.awardType === "full-ride" ? c.safe : s.awardType === "tuition" ? c.violet : c.target }}
          >
            {AWARD_TYPE_LABEL[s.awardType]}
          </Text>
        </View>
      </View>
      <Text className="mt-3 text-sm leading-6 text-muted-foreground">{s.eligibility}</Text>
      <View className="mt-3 flex-row items-center gap-1.5">
        <Feather name="clock" size={13} color={c.mutedForeground} />
        <Text className="text-xs text-muted-foreground">ვადა: {formatDeadline(s.deadline)}</Text>
        {s.forGeorgians && (
          <View className="ml-2 rounded-md bg-secondary px-2 py-0.5">
            <Text className="text-[11px] font-medium text-secondary-foreground">🇬🇪 ქართველებისთვის</Text>
          </View>
        )}
      </View>
      <View className="mt-3 flex-row items-center justify-end gap-1"><Text className="text-sm font-semibold text-accent">დაფარვა და პირობები</Text><Feather name="chevron-right" size={16} color={c.accent} /></View>
    </Pressable>
  );
}

export function AbroadDemoNote({ className }: { className?: string }) {
  return (
    <DemoNote
      className={className}
      text="საჩვენებელი მონაცემები: უნივერსიტეტების საფასური, მიღების მაჩვენებლები, მოთხოვნები, ვადები და სტიპენდიები გამოგონილია და მხოლოდ ილუსტრაციისთვისაა."
    />
  );
}
