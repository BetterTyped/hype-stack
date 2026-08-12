import { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  inputClassName?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const paddingMap = {
  xs: "px-1.5",
  sm: "px-3",
  md: "px-4",
  lg: "px-6",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, inputClassName, size = "md", ...props }, ref) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;

    return (
      <div className={cn("w-full relative", className)}>
        {StartIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <StartIcon size={18} className="text-muted-foreground" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex w-full rounded-md border border-input bg-background py-2 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
            size === "xs" && "h-6",
            size === "sm" && "h-8",
            size === "md" && "h-10",
            size === "lg" && "h-12",
            paddingMap[size],
            startIcon ? "!pl-9" : "",
            endIcon ? "!pr-9" : "",
            inputClassName,
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <EndIcon className="text-muted-foreground" size={18} />
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
