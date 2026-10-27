import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

import { AbroadThemeScope } from "@/components/mode-theme";
import { useAppMode } from "@/lib/store";
import { useThemeColors } from "@/lib/theme";

export default function TabsLayout() {
  const c = useThemeColors();
  const abroad = useAppMode() === "abroad";
  return (
    <AbroadThemeScope>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.accent,
          tabBarInactiveTintColor: c.mutedForeground,
          tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
          tabBarBackground: () => <View style={{ flex: 1, backgroundColor: c.card }} />,
          tabBarItemStyle: { backgroundColor: c.card },
          tabBarLabelStyle: { fontSize: 11, fontFamily: "FiraGOBold", letterSpacing: 0 },
        }}
      >
        {/* Georgia Mode tabs — unchanged when Georgia Mode is active. */}
        <Tabs.Screen name="index" options={{ title: "მთავარი", href: abroad ? null : undefined, tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} /> }} />
        <Tabs.Screen name="list" options={{ title: "ჩემი სია", href: abroad ? null : undefined, tabBarIcon: ({ color, size }) => <Feather name="list" color={color} size={size} /> }} />
        <Tabs.Screen name="explore" options={{ title: "აღმოაჩინე", href: abroad ? null : undefined, tabBarIcon: ({ color, size }) => <Feather name="search" color={color} size={size} /> }} />
        {/* Abroad Mode tabs. */}
        <Tabs.Screen name="abroad-home" options={{ title: "მთავარი", href: abroad ? undefined : null, tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} /> }} />
        <Tabs.Screen name="abroad-explore" options={{ title: "აღმოაჩინე", href: abroad ? undefined : null, tabBarIcon: ({ color, size }) => <Feather name="search" color={color} size={size} /> }} />
        <Tabs.Screen name="abroad-scholarships" options={{ title: "სტიპენდიები", href: abroad ? undefined : null, tabBarIcon: ({ color, size }) => <Feather name="award" color={color} size={size} /> }} />
        <Tabs.Screen name="abroad-portfolio" options={{ title: "პორტფოლიო", href: abroad ? undefined : null, tabBarIcon: ({ color, size }) => <Feather name="briefcase" color={color} size={size} /> }} />
        {/* Shared tab. */}
        <Tabs.Screen name="profile" options={{ title: "პროფილი", tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} /> }} />
      </Tabs>
    </AbroadThemeScope>
  );
}
