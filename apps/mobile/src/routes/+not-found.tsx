import { Stack } from "expo-router";

import { NotFound } from "@/components/errors/not-found";

const SCREEN_OPTIONS = { title: "Not found" };

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <NotFound />
    </>
  );
}
