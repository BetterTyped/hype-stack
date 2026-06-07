import { Search, type LucideIcon } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn, getInitials } from "@/lib/utils";

/** Toolbar row that sits above a list card: search on the left, summary/actions on the right. */
export function ListToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>{children}</div>;
}

/** Search field with a leading icon, sized to feel like a real search box. */
export function ListSearch({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <Input
      startIcon={Search}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="sm"
      className={cn("w-full max-w-xs", className)}
    />
  );
}

/** Small pill that summarizes how many rows are in view. */
export function ListCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
      {children}
    </span>
  );
}

/** Initials avatar with an optional image, tinted with the brand color. */
export function InitialsAvatar({
  name,
  src,
  className,
}: {
  name: string | null | undefined;
  src?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-9 rounded-md border border-border/60", className)}>
      {src ? <AvatarImage src={src} alt={name ?? ""} className="rounded-md" /> : null}
      <AvatarFallback className="rounded-md bg-primary/10 text-sm font-semibold text-primary">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

const DOT_TONES = {
  positive: "bg-emerald-500",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground/50",
} as const;

/** Status chip with a leading colored dot. Tone maps to a small set of semantic colors. */
export function StatusPill({ tone, children }: { tone: keyof typeof DOT_TONES; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border bg-background/50 px-2 py-0.5 text-xs font-medium capitalize">
      <span className={cn("size-1.5 rounded-full", DOT_TONES[tone])} />
      {children}
    </span>
  );
}

/** Empty-state row that spans the whole table with an icon and a hint. */
export function ListEmpty({
  icon: Icon,
  title,
  description,
  colSpan,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  colSpan: number;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-48">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-5" />
          </div>
          <p className="text-sm font-medium">{title}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

/** Table-shaped loading skeleton so the page doesn't jump when data lands. */
export function ListSkeleton({ rows = 8, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_row, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_col, colIndex) => (
            <TableCell key={colIndex} className="py-3">
              {colIndex === 0 ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <Skeleton className={cn("h-4", colIndex === columns - 1 ? "w-8" : "w-20")} />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
