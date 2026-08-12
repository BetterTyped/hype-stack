import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTheme } from "@/hooks/use-theme";
import { STORAGE_KEY } from "@/lib/theme";

function ThemeProbe() {
  const { theme } = useTheme();
  return <Text testID="active-theme">{theme}</Text>;
}

const renderThemeUi = () =>
  render(
    <>
      <ThemeProbe />
      <ThemeToggle />
    </>,
  );

describe("useTheme", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("falls back to the default theme when nothing is stored", async () => {
    // Act
    renderThemeUi();

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("active-theme")).toHaveTextContent("dark");
    });
  });

  it("restores the persisted theme", async () => {
    // Arrange
    await AsyncStorage.setItem(STORAGE_KEY, "light");

    // Act
    renderThemeUi();

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("active-theme")).toHaveTextContent("light");
    });
  });

  it("persists the theme picked with the toggle", async () => {
    // Arrange
    const user = userEvent.setup();
    renderThemeUi();
    await waitFor(() => {
      expect(screen.getByTestId("active-theme")).toHaveTextContent("dark");
    });

    // Act
    await user.press(screen.getByTestId("theme-toggle"));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("active-theme")).toHaveTextContent("light");
    });
    await waitFor(async () => {
      expect(await AsyncStorage.getItem(STORAGE_KEY)).toBe("light");
    });
  });
});
