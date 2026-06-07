"use client";

import { HTMLMotionProps } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";

import { cn } from "@/lib/utils";

const BUTTON_FADE_INITIAL = { opacity: 0 };
const BUTTON_FADE_ANIMATE = { opacity: 1 };
const BUTTON_FADE_EXIT = { opacity: 0 };
const SUBSCRIBED_TEXT_INITIAL = { y: -50 };
const SUBSCRIBED_TEXT_ANIMATE = { y: 0 };
const UNSUBSCRIBED_TEXT_INITIAL = { x: 0 };
const UNSUBSCRIBED_TEXT_EXIT = { x: 50, transition: { duration: 0.1 } };

interface AnimatedSubscribeButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  subscribeStatus?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AnimatedSubscribeButton = React.forwardRef<HTMLButtonElement, AnimatedSubscribeButtonProps>(
  ({ subscribeStatus = false, onClick, className, children, ...props }, ref) => {
    const [isSubscribed, setIsSubscribed] = useState<boolean>(subscribeStatus);
    const handleSubscribeClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        setIsSubscribed(true);
        onClick?.(event);
      },
      [onClick],
    );
    const handleUnsubscribeClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        setIsSubscribed(false);
        onClick?.(event);
      },
      [onClick],
    );

    if (
      React.Children.count(children) !== 2 ||
      !React.Children.toArray(children).every((child) => React.isValidElement(child) && child.type === "span")
    ) {
      throw new Error("AnimatedSubscribeButton expects two children, both of which must be <span> elements.");
    }

    const childrenArray = React.Children.toArray(children);
    const initialChild = childrenArray[0];
    const changeChild = childrenArray[1];

    return (
      <AnimatePresence mode="wait">
        {isSubscribed ? (
          <motion.button
            ref={ref}
            className={cn(
              "relative flex h-10 w-fit items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-primary-foreground",
              className,
            )}
            onClick={handleUnsubscribeClick}
            initial={BUTTON_FADE_INITIAL}
            animate={BUTTON_FADE_ANIMATE}
            exit={BUTTON_FADE_EXIT}
            {...props}
          >
            <motion.span
              key="action"
              className="relative flex h-full w-full items-center justify-center font-semibold"
              initial={SUBSCRIBED_TEXT_INITIAL}
              animate={SUBSCRIBED_TEXT_ANIMATE}
            >
              {changeChild} {/* Use children for subscribed state */}
            </motion.span>
          </motion.button>
        ) : (
          <motion.button
            ref={ref}
            className={cn(
              "relative flex h-10 w-fit cursor-pointer items-center justify-center rounded-lg border-none bg-primary px-6 text-primary-foreground",
              className,
            )}
            onClick={handleSubscribeClick}
            initial={BUTTON_FADE_INITIAL}
            animate={BUTTON_FADE_ANIMATE}
            exit={BUTTON_FADE_EXIT}
            {...props}
          >
            <motion.span
              key="reaction"
              className="relative flex items-center justify-center font-semibold"
              initial={UNSUBSCRIBED_TEXT_INITIAL}
              exit={UNSUBSCRIBED_TEXT_EXIT}
            >
              {initialChild} {/* Use children for unsubscribed state */}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    );
  },
);

AnimatedSubscribeButton.displayName = "AnimatedSubscribeButton";
