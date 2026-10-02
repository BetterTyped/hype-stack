import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Styled `<select>` for the cases where a native picker beats a Radix popover: short
 * option lists, mobile browsers, dense tables. The browser arrow is removed with
 * `appearance-none` and replaced by a chevron that sits in the same spot as the
 * Select trigger's, so both components look identical side by side.
 *
 * Sizes mirror Input and SelectTrigger: xs h-6, sm h-8, default h-10, lg h-12. A native
 * select centers its text on its own, so vertical padding stays small; `py-2` on a short
 * control clips the glyphs.
 */
const nativeSelectSizes = {
  xs: {
    select: "h-6 py-0 pl-1.5 pr-7 text-xs",
    icon: "right-1.5 size-3.5",
  },
  sm: {
    select: "h-8 py-0 pl-3 pr-9",
    icon: "right-3 size-4",
  },
  default: {
    select: "h-10 py-1 pl-4 pr-10",
    icon: "right-4 size-4",
  },
  lg: {
    select: "h-12 py-2 pl-6 pr-12",
    icon: "right-6 size-4",
  },
} as const;

type NativeSelectSize = keyof typeof nativeSelectSizes;

function NativeSelect({
  className,
  wrapperClassName,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & {
  size?: NativeSelectSize;
  wrapperClassName?: string;
}) {
  return (
    <div
      data-slot="native-select-wrapper"
      data-size={size}
      className={cn("group/native-select relative w-full has-[select:disabled]:opacity-50", wrapperClassName)}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 w-full min-w-0 appearance-none rounded-md border bg-transparent text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          nativeSelectSizes[size].select,
          className,
        )}
        {...props}
      />
      <ChevronDownIcon
        data-slot="native-select-icon"
        aria-hidden="true"
        className={cn(
          "text-muted-foreground pointer-events-none absolute top-1/2 -translate-y-1/2 opacity-50 select-none",
          nativeSelectSizes[size].icon,
        )}
      />
    </div>
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return (
    <option data-slot="native-select-option" className={cn("bg-[Canvas] text-[CanvasText]", className)} {...props} />
  );
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption, nativeSelectSizes, type NativeSelectSize };
