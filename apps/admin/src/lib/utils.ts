import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRGBA(color: string) {
  if (typeof document === "undefined") {
    return color;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return color;
  }

  context.fillStyle = color;
  return context.fillStyle;
}

export function colorWithOpacity(color: string, opacity: number) {
  const normalizedOpacity = Math.min(Math.max(opacity, 0), 1);

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const fullHex =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;

    const red = Number.parseInt(fullHex.slice(0, 2), 16);
    const green = Number.parseInt(fullHex.slice(2, 4), 16);
    const blue = Number.parseInt(fullHex.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${normalizedOpacity})`;
  }

  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${normalizedOpacity})`);
  }

  if (color.startsWith("rgba(")) {
    return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3, ${normalizedOpacity})`);
  }

  return color;
}

export function formatCurrency(amountInCents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: value >= 10_000 ? "compact" : "standard" }).format(value);
}

/** Formats a duration in seconds as a compact "4m 33s" / "1h 02m" string. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(secs).padStart(2, "0")}s`;
  return `${secs}s`;
}

/** Currency with cents precision, e.g. "$0.85". For per-visitor style values. */
export function formatCurrencyPrecise(amountInCents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInCents / 100);
}

export function formatPercent(value: number | null): string {
  if (value === null) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(value: string | Date | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const RELATIVE_UNITS: { limit: number; unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { limit: 60, unit: "second", ms: 1000 },
  { limit: 3600, unit: "minute", ms: 60_000 },
  { limit: 86_400, unit: "hour", ms: 3_600_000 },
  { limit: 604_800, unit: "day", ms: 86_400_000 },
  { limit: 2_629_800, unit: "week", ms: 604_800_000 },
  { limit: 31_557_600, unit: "month", ms: 2_629_800_000 },
];

/** Human-friendly "3 days ago" style label. Falls back to "-" for empty values. */
export function formatRelativeTime(value: string | Date | null): string {
  if (!value) return "-";
  const date = new Date(value);
  const diffSeconds = (date.getTime() - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  const absSeconds = Math.abs(diffSeconds);

  for (const { limit, unit, ms } of RELATIVE_UNITS) {
    if (absSeconds < limit) {
      return formatter.format(Math.round((date.getTime() - Date.now()) / ms), unit);
    }
  }
  return formatter.format(Math.round((date.getTime() - Date.now()) / 31_557_600_000), "year");
}

/** Two-letter initials from a name or email, used for avatar fallbacks. */
export function getInitials(value: string | null | undefined): string {
  if (!value) return "?";
  const trimmed = value.trim();
  const local = trimmed.includes("@") ? (trimmed.split("@")[0] ?? trimmed) : trimmed;
  const parts = local.split(/[\s._-]+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return `${(parts[0] ?? "").charAt(0)}${(parts[parts.length - 1] ?? "").charAt(0)}`.toUpperCase();
}

let regionNames: Intl.DisplayNames | null | undefined;

/** Maps an ISO country code (e.g. "US") to a readable name ("United States"). */
export function formatCountry(code: string | null | undefined): string {
  if (!code) return "Unknown";
  if (regionNames === undefined) {
    regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
  }
  return regionNames?.of(code.toUpperCase()) ?? code;
}

/**
 * Turns a two-letter ISO country code into its flag emoji by mapping each
 * letter to its regional indicator symbol. Returns an empty string for codes
 * that aren't a valid pair of letters.
 */
export function countryFlag(code: string | null | undefined): string {
  if (!code) return "";
  const upper = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "";
  const points = [...upper].map((char) => 0x1f1e6 + (char.charCodeAt(0) - 65));
  return String.fromCodePoint(...points);
}

/** Readable country name prefixed with its flag emoji when the code is valid. */
export function formatCountryLabel(code: string | null | undefined): string {
  const flag = countryFlag(code);
  const name = formatCountry(code);
  return flag ? `${flag} ${name}` : name;
}

/**
 * Turns a raw URL path into a breadcrumb-style label so analytics reads like the
 * in-app navigation instead of bare slugs. `/docs/getting-started` becomes
 * "Docs > Getting Started". Dynamic id segments are left untouched.
 */
export function formatPathLabel(path: string): string {
  const clean = path.split(/[?#]/)[0] ?? path;
  const segments = clean.split("/").filter(Boolean);

  if (segments.length === 0) return "Home";

  return segments
    .map((segment) =>
      segment
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim(),
    )
    .join(" › ");
}
