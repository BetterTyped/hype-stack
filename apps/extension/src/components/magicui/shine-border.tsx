"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the border in pixels
   * @default 1
   */
  borderWidth?: number;
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number;
  /**
   * Color of the border, can be a single color or an array of colors
   * @default "#000000"
   */
  shineColor?: string | string[];
  /**
   * Visual style of the border.
   * - "shine": current look (transparent gaps with a moving highlight)
   * - "solid": fully colored gradient all the time
   * @default "shine"
   */
  variant?: "shine" | "solid";
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = "#000000",
  variant = "shine",
  className,
  style,
  ...props
}: ShineBorderProps) {
  const colors = Array.isArray(shineColor) ? shineColor.join(",") : shineColor;
  const borderStyle = React.useMemo(
    () =>
      ({
        "--border-width": `${borderWidth}px`,
        "--duration": `${duration}s`,
        backgroundImage:
          variant === "solid"
            ? `linear-gradient(90deg, ${colors})`
            : `radial-gradient(transparent, transparent, ${colors}, transparent, transparent)`,
        backgroundSize: variant === "solid" ? "200% 200%" : "300% 300%",
        mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: "var(--border-width)",
        ...style,
      }) as React.CSSProperties,
    [borderWidth, colors, duration, style, variant],
  );

  return (
    <div
      style={borderStyle}
      className={cn(
        "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]",
        variant === "solid" ? "motion-safe:animate-gradient" : "motion-safe:animate-shine",
        className,
      )}
      {...props}
    />
  );
}
