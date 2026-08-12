import { useFetch } from "@hyper-fetch/react";
import { ServerCrash, Unplug, X } from "lucide-react";
import { useState } from "react";

import { client } from "@/api/client";

/**
 * Dev-only diagnostic. Polls the backend /health endpoint (which stays alive even
 * when boot fails) and shows a banner when the server is broken or unreachable.
 *
 * /health is registered outside the typed route tree so it responds even when boot
 * fails, which means it isn't exposed on the SDK. We still go through the HyperFetch
 * client so credentials and adapter defaults stay consistent with every other request.
 */
type BootState = { status: "ok" } | { status: "error"; message: string; hint?: string };

type BannerState = { kind: "hidden" } | { kind: "unreachable" } | { kind: "error"; message: string; hint?: string };

const getHealth = client.createRequest<{ response: BootState }>()({
  endpoint: "/health",
  method: "GET",
});

export function DevServerBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data, error, onSuccess } = useFetch(getHealth, {
    disabled: !import.meta.env.DEV,
    refresh: true,
    refreshTime: 3000,
    refetchOnFocus: false,
  });

  onSuccess(({ response }) => {
    if (response.data?.status === "ok") setDismissed(false);
  });

  const state: BannerState = error
    ? { kind: "unreachable" }
    : data?.status === "error"
      ? { kind: "error", message: data.message, hint: data.hint }
      : { kind: "hidden" };

  if (state.kind === "hidden" || dismissed) return null;

  const Icon = state.kind === "unreachable" ? Unplug : ServerCrash;
  const title = state.kind === "unreachable" ? "Backend not reachable" : "Backend failed to start";
  const message = state.kind === "unreachable" ? "The dev server isn't responding. Is it running?" : state.message;
  const hint =
    state.kind === "error" ? state.hint : state.kind === "unreachable" ? "Failed to reach the server API." : undefined;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 w-full z-9999 border-b border-red-500/25 bg-linear-to-r from-red-950/95 to-red-900/90 px-4 py-3 text-red-50 shadow-lg shadow-red-950/40 ring-1 ring-inset ring-white/5 backdrop-blur-md duration-300">
      <div className="mx-auto flex w-full max-w-xl items-start gap-3.5">
        <div className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-300">
          <Icon className="size-5" strokeWidth={2.25} />
          <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-red-400 ring-2 ring-red-950" />
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold leading-none tracking-tight">{message || title}</p>
            <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase leading-none tracking-widest text-red-200">
              dev
            </span>
          </div>
          {hint ? (
            <p className="text-xs leading-snug text-red-200/60">{hint || "Failed to reach the server API."}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-red-200/70 transition-colors hover:bg-red-500/15 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
        >
          <X className="size-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
