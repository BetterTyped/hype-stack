import { createContext, useContext, useMemo, useState } from "react";

export type Granularity = "hour" | "day" | "week" | "month";

export type DateRangeValue = {
  from: Date;
  to: Date;
  granularity: Granularity;
  /** Preset id, or "custom" when the range was picked from the calendar. */
  preset: string;
};

export type DateRangePreset = {
  id: string;
  label: string;
  days: number;
  granularity: Granularity;
};

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { id: "24h", label: "Past 24h", days: 1, granularity: "hour" },
  { id: "7d", label: "Past 7 days", days: 7, granularity: "day" },
  { id: "30d", label: "Past 30 days", days: 30, granularity: "day" },
  { id: "90d", label: "Past 90 days", days: 90, granularity: "week" },
  { id: "12m", label: "Past 12 months", days: 365, granularity: "month" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pick a sensible bucket size for an arbitrary span so a custom range never
 * renders thousands of hourly points or a single monthly bar. Mirrors the
 * granularity baked into the presets: short spans go fine-grained, long spans
 * roll up.
 */
export const deriveGranularity = (from: Date, to: Date): Granularity => {
  const days = (to.getTime() - from.getTime()) / DAY_MS;
  if (days <= 2) return "hour";
  if (days <= 31) return "day";
  if (days <= 120) return "week";
  return "month";
};

const startOfDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const buildPresetRange = (preset: DateRangePreset): DateRangeValue => {
  const to = new Date();
  const from = new Date(to.getTime() - preset.days * DAY_MS);
  return { from, to, granularity: preset.granularity, preset: preset.id };
};

type DateRangeContextValue = {
  range: DateRangeValue;
  setPreset: (presetId: string) => void;
  /** Apply a calendar-picked range; granularity is derived from the span. */
  setCustomRange: (from: Date, to: Date) => void;
  /** Query params shaped for the admin analytics endpoints. */
  queryParams: { from: string; to: string; granularity: Granularity };
};

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<DateRangeValue>(() => buildPresetRange(DATE_RANGE_PRESETS[2]));

  const value = useMemo<DateRangeContextValue>(() => {
    return {
      range,
      setPreset: (presetId: string) => {
        const preset = DATE_RANGE_PRESETS.find((p) => p.id === presetId) ?? DATE_RANGE_PRESETS[2];
        setRange(buildPresetRange(preset));
      },
      setCustomRange: (from: Date, to: Date) => {
        const start = startOfDay(from);
        const end = endOfDay(to);
        setRange({ from: start, to: end, granularity: deriveGranularity(start, end), preset: "custom" });
      },
      queryParams: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        granularity: range.granularity,
      },
    };
  }, [range]);

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
}

export function useDateRange(): DateRangeContextValue {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error("useDateRange must be used within a DateRangeProvider");
  return ctx;
}

const GRANULARITY_LABELS: Record<Granularity, string> = {
  hour: "hourly",
  day: "daily",
  week: "weekly",
  month: "monthly",
};

export const granularityLabel = (granularity: Granularity): string => GRANULARITY_LABELS[granularity];
