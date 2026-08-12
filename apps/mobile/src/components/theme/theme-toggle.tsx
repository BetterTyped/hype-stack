import { MoonStarIcon, SunIcon } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useTheme } from "@/hooks/use-theme";

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onPress={toggleTheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 web:mx-4 rounded-full"
      accessibilityLabel="Toggle color theme"
      testID="theme-toggle"
    >
      <Icon as={THEME_ICONS[theme]} className="size-5" />
    </Button>
  );
}
