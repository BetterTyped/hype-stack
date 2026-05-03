import { Funnel, XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const FilterButton = ({
  activeFilters,
  children,
  onClear,
}: {
  activeFilters: number;
  children: React.ReactNode;
  onClear: () => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 lg:flex">
          <Funnel className="mr-2 h-4 w-4 opacity-80" />
          Filters
          {!!activeFilters && (
            <span
              data-slot="badge"
              className="border font-medium whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent bg-secondary text-secondary-foreground [a&amp;]:hover:bg-secondary/90 ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilters}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <div className="flex items-center justify-between py-1">
          <DropdownMenuLabel className="py-0 text-foreground">Filters</DropdownMenuLabel>
          {!!activeFilters && (
            <Button variant="ghost" size="xs" onClick={onClear}>
              <XIcon className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
