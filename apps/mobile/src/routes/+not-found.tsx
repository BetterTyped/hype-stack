import { Stack } from "expo-router";

import { NotFound } from "@/components/errors/not-found";
import { m } from "@/paraglide/messages.js";

const SCREEN_OPTIONS = { title: m.not_found_screen_title() };

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <NotFound />
    </>
  );
}
