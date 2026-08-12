import { cn } from "@/lib/utils";

type TableTotalProps = {
  length: number;
  limit?: number;
  total: number;
} & React.HTMLAttributes<HTMLSpanElement>;

export const TableTotal = ({ length, limit = 20, total, className, ...rest }: TableTotalProps) => {
  const visible = Math.min(length, limit);

  return (
    <span {...rest} className={cn("text-xs text-muted-foreground", className)}>
      {visible} out of {total}
    </span>
  );
};
