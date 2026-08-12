import { ArrowDown, ArrowUp, ArrowUpDown, XIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "./badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getIcon = (sort: "asc" | "desc" | null) => {
  if (sort === "asc") {
    return <ArrowUp className="h-4 w-4" />;
  }
  if (sort === "desc") {
    return <ArrowDown className="h-4 w-4" />;
  }
  return <ArrowUpDown className="h-4 w-4" />;
};

export const SortButton = ({
  children,
  type,
  sorting,
  onClear,
}: {
  children: React.ReactNode;
  type: "asc" | "desc" | null;
  sorting: string | null;
  onClear: () => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 lg:flex">
          {getIcon(sorting ? type : null)}
          Sort{" "}
          {sorting && (
            <Badge variant="outline" size="sm">
              {sorting}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <div className="flex items-center justify-between py-1">
          <DropdownMenuLabel className="py-0 text-foreground">Sort by</DropdownMenuLabel>
          {sorting && (
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
