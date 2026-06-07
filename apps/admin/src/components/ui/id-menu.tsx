import { Copy, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type IdMenuItem = { label: string; value: string };

/** Three-dots menu that copies opaque identifiers, keeping them out of the main UI. */
export function IdMenu({ items, label = "Identifiers" }: { items: IdMenuItem[]; label?: string }) {
  const copy = async (item: IdMenuItem) => {
    await navigator.clipboard.writeText(item.value);
    toast.success(`${item.label} copied`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground data-[state=open]:bg-accent">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.label} onSelect={() => void copy(item)} className="gap-2">
            <Copy className="size-3.5" />
            <div className="flex min-w-0 flex-col">
              <span>Copy {item.label}</span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">{item.value}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
