// oxlint-disable-next-line import/no-unassigned-import
import "@/global.css";
import { Stack } from "expo-router";

import { Providers } from "@/components/providers/providers";

// Catches errors thrown anywhere in the app, including this layout.
export { AppError as ErrorBoundary } from "@/components/errors/app-error";

const STACK_OPTIONS = { headerShadowVisible: false };

export default function RootLayout() {
  return (
    <Providers>
      <Stack screenOptions={STACK_OPTIONS} />
    </Providers>
  );
}
