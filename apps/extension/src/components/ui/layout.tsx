import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Layout = ({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...rest} className={cn("h-full w-full flex flex-col rounded-md border", className)}>
      {children}
    </div>
  );
};
