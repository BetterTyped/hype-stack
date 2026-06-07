/**
 * Single source of truth for analytics metric colors. Every chart, bar, legend,
 * and tooltip across the analytics features should pull from here so a metric
 * always reads as the same color. Values are standard Tailwind palette colors.
 */
export const ANALYTICS_COLORS = {
  visitors: "#3b82f6", // blue-500
  views: "#8b5cf6", // violet-500
  revenue: "#f97316", // orange-500
} as const;

export type AnalyticsMetric = keyof typeof ANALYTICS_COLORS;
