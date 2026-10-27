// Drop-in replacements for React Native's Text and TextInput that follow the
// app language. Screens import these instead of the ones from "react-native".
import { Children, forwardRef, type ElementRef } from "react";
import { Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from "react-native";
import { tr, useLang } from "./language";

export const Text = forwardRef<ElementRef<typeof RNText>, TextProps>(function Text({ children, accessibilityLabel, ...props }, ref) {
  const lang = useLang();
  const kids = lang === "en" ? Children.map(children, (c) => (typeof c === "string" ? tr(c, lang) : c)) : children;
  return (
    <RNText ref={ref} {...props} accessibilityLabel={accessibilityLabel && tr(accessibilityLabel, lang)}>
      {kids}
    </RNText>
  );
});

export const TextInput = forwardRef<ElementRef<typeof RNTextInput>, TextInputProps>(function TextInput({ placeholder, ...props }, ref) {
  const lang = useLang();
  return <RNTextInput ref={ref} {...props} placeholder={placeholder && tr(placeholder, lang)} />;
});
