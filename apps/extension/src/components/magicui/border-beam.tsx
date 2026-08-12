"use client";

import { motion, MotionStyle, Transition } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number;
  /**
   * The duration of the border beam.
   */
  duration?: number;
  /**
   * The delay of the border beam.
   */
  delay?: number;
  /**
   * The color of the border beam from.
   */
  colorFrom?: string;
  /**
   * The color of the border beam to.
   */
  colorTo?: string;
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition;
  /**
   * The class name of the border beam.
   */
  className?: string;
  /**
   * The style of the border beam.
   */
  style?: React.CSSProperties;
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean;
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number;
  /**
   * The border width of the beam.
   */
  borderWidth?: number;
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  const containerStyle = React.useMemo(
    () =>
      ({
        "--border-beam-width": `${borderWidth}px`,
      }) as React.CSSProperties,
    [borderWidth],
  );
  const beamStyle = React.useMemo(
    () =>
      ({
        width: size,
        offsetPath: `rect(0 auto auto 0 round ${size}px)`,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        ...style,
      }) as MotionStyle,
    [colorFrom, colorTo, size, style],
  );
  const initial = React.useMemo(() => ({ offsetDistance: `${initialOffset}%` }), [initialOffset]);
  const animate = React.useMemo(
    () => ({
      offsetDistance: reverse
        ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
        : [`${initialOffset}%`, `${100 + initialOffset}%`],
    }),
    [initialOffset, reverse],
  );
  const beamTransition = React.useMemo(
    () => ({
      repeat: Infinity,
      ease: "linear" as const,
      duration,
      delay: -delay,
      ...transition,
    }),
    [delay, duration, transition],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] border-(length:--border-beam-width)"
      style={containerStyle}
    >
      <motion.div
        className={cn(
          "absolute aspect-square",
          "bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent",
          className,
        )}
        style={beamStyle}
        initial={initial}
        animate={animate}
        transition={beamTransition}
      />
    </div>
  );
};
