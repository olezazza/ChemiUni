import { type TextInputProps } from "react-native";
import { TextInput } from "@/lib/translated-text";

import { cn } from "@/lib/utils";
import { useAppearance } from "@/lib/appearance";
import { useThemeColors } from "@/lib/theme";

interface InputProps extends TextInputProps {
  className?: string;
  ref?: React.Ref<React.ElementRef<typeof TextInput>>;
}

export function Input({ className, ...props }: InputProps) {
  const { fontsReady } = useAppearance();
  const c = useThemeColors();
  return (
    <TextInput
      className={cn(
        "min-h-[52px] rounded-xl border border-border bg-input px-4 py-3 text-base text-foreground",
        fontsReady && "font-body",
        className,
      )}
      placeholderTextColor={c.mutedForeground}
      selectionColor={c.accent}
      {...props}
    />
  );
}
