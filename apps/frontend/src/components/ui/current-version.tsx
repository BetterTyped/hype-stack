import { memo, useMemo } from "react";

import { Badge } from "./badge";
import { isElectronApp } from "@/lib/electron";
import { cn } from "@/lib/utils";

export const CurrentVersion = memo(({ className, ...props }: React.ComponentProps<typeof Badge>) => {
  const version = String(isElectronApp ? window.electron.getAppVersion() : "0.0.0");

  const name = useMemo(() => {
    // 0.0.0 or 0.0.1 is a development version
    if (version.startsWith("0")) {
      return "Next";
    }
    return `v${version}`;
  }, [version]);

  return (
    <Badge variant="outline" size="sm" {...props} className={cn("text-[10px] px-1.5 py-0 min-h-0 h-5", className)}>
      {name}
    </Badge>
  );
});
