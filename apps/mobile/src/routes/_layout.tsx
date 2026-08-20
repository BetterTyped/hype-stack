// oxlint-disable-next-line import/no-unassigned-import
import "@/global.css";
import { Stack } from "expo-router";

import { Providers } from "@/components/providers/providers";

// Catches errors thrown anywhere in the app, including this layout.
export { AppError as ErrorBoundary } from "@/components/errors/app-error";

// No native headers by default: route groups would render their folder name
// ("(private)") as the title, and installed shells draw their own chrome. A
// screen that wants the native header opts in via Stack.Screen options.
const STACK_OPTIONS = { headerShown: false, headerShadowVisible: false };

export default function RootLayout() {
  return (
    <Providers>
      <Stack screenOptions={STACK_OPTIONS} />
    </Providers>
  );
}
