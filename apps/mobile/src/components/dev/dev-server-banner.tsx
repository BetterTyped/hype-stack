import { useFetch } from "@hyper-fetch/react";
import { ServerCrashIcon, UnplugIcon, XIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { client } from "@/api/client";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

/**
 * Dev-only diagnostic, mirroring the frontend's DevServerBanner. Polls the
 * backend /health endpoint (which stays alive even when boot fails) and shows
 * a banner when the server is broken or unreachable.
 *
 * /health is registered outside the typed route tree so it responds even when
 * boot fails, which means it isn't exposed on the SDK. We still go through the
 * HyperFetch client so adapter defaults stay consistent with every other request.
 */
type BootState = { status: "ok" } | { status: "error"; message: string; hint?: string };

type BannerState = { kind: "hidden" } | { kind: "unreachable" } | { kind: "error"; message: string; hint?: string };

const getHealth = client.createRequest<{ response: BootState }>()({
  endpoint: "/health",
  method: "GET",
});

export function DevServerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const insets = useSafeAreaInsets();

  const { data, error, onSuccess } = useFetch(getHealth, {
    disabled: !__DEV__,
    refresh: true,
    refreshTime: 3000,
    refetchOnFocus: false,
  });

  onSuccess(({ response }) => {
    if (response.data?.status === "ok") setDismissed(false);
  });

  // The banner sits at the very top of the screen, under the notch/status bar.
  const insetStyle = useMemo(() => ({ paddingTop: insets.top }), [insets.top]);

  const state: BannerState = error
    ? { kind: "unreachable" }
    : data?.status === "error"
      ? { kind: "error", message: data.message, hint: data.hint }
      : { kind: "hidden" };

  if (state.kind === "hidden" || dismissed) return null;

  const BannerIcon = state.kind === "unreachable" ? UnplugIcon : ServerCrashIcon;
  const title = state.kind === "unreachable" ? "Backend not reachable" : "Backend failed to start";
  const message = state.kind === "unreachable" ? "The dev server isn't responding. Is it running?" : state.message;
  const hint =
    state.kind === "error" ? state.hint : state.kind === "unreachable" ? "Failed to reach the server API." : undefined;

  return (
    <View className="border-b border-red-500/25 bg-red-950 px-4 pb-3" style={insetStyle}>
      <View className="flex-row items-start gap-3 pt-3">
        <View className="mt-0.5 size-9 items-center justify-center rounded-lg bg-red-500/15">
          <Icon as={BannerIcon} className="size-5 text-red-300" />
        </View>

        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-red-50">{message || title}</Text>
            <Text className="rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-red-200">
              dev
            </Text>
          </View>
          {hint ? <Text className="text-xs text-red-200/60">{hint}</Text> : null}
        </View>

        <Pressable
          onPress={() => setDismissed(true)}
          accessibilityLabel="Dismiss"
          className="mt-0.5 size-7 items-center justify-center rounded-md"
        >
          <Icon as={XIcon} className="size-4 text-red-200/70" />
        </Pressable>
      </View>
    </View>
  );
}
