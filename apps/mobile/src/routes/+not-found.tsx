import { Stack } from "expo-router";

import { NotFound } from "@/components/errors/not-found";
import { m } from "@/paraglide/messages.js";

// Opts back into the native header the root layout hides by default.
const SCREEN_OPTIONS = { headerShown: true, title: m.not_found_screen_title() };

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <NotFound />
    </>
  );
}
