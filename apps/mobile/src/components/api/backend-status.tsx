import { useFetch } from "@hyper-fetch/react";
import { View } from "react-native";

import { client } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";

/**
 * Smoke test for the API wiring: polls the backend `/health` endpoint through the
 * same HyperFetch client every typed request uses, so a red badge here means the
 * device cannot reach `EXPO_PUBLIC_API_BASE_URL`.
 *
 * `/health` is registered outside the typed route tree (it has to answer even when
 * boot fails), which is why it goes through `client.createRequest` instead of the
 * `sdk`. Everything else in the app should use `sdk` for end-to-end typing.
 */
type BootState = { status: "ok" } | { status: "error"; message: string; hint?: string };

const getHealth = client.createRequest<{ response: BootState }>()({
  endpoint: "/health",
  method: "GET",
});

export function BackendStatus() {
  const { data, error, loading } = useFetch(getHealth, {
    refresh: true,
    refreshTime: 5000,
  });

  const state = loading && !data && !error ? "connecting" : error ? "unreachable" : (data?.status ?? "unreachable");

  const label =
    state === "connecting"
      ? "Connecting"
      : state === "ok"
        ? "Connected"
        : state === "error"
          ? "Backend error"
          : "Unreachable";

  return (
    <View className="flex-row items-center gap-2">
      <Badge variant={state === "ok" ? "secondary" : state === "connecting" ? "outline" : "destructive"}>
        <Text>{label}</Text>
      </Badge>
      <Text className="text-muted-foreground text-xs">{client.url}</Text>
    </View>
  );
}
