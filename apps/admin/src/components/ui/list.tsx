"use client";

import { useMemo, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Status = {
  id: string;
  name: string;
  color: string;
};

type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
};

export type ListItemsProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export const ListItems = ({ children, className, ...rest }: ListItemsProps) => (
  <div {...rest} className={cn("flex flex-1 flex-col gap-2 p-3", className)}>
    {children}
  </div>
);

export type ListHeaderProps =
  | {
      children: ReactNode;
    }
  | {
      name: Status["name"];
      color: Status["color"];
      className?: string;
    };

export const ListHeader = (props: ListHeaderProps) => {
  const colorStyle = useMemo(() => ("children" in props ? undefined : { backgroundColor: props.color }), [props]);

  return "children" in props ? (
    props.children
  ) : (
    <div className={cn("flex shrink-0 items-center gap-2 bg-foreground/5 p-3", props.className)}>
      <div className="h-2 w-2 rounded-full" style={colorStyle} />
      <p className="m-0 font-semibold text-sm">{props.name}</p>
    </div>
  );
};

export type ListGroupProps = {
  id: Status["id"];
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export const ListGroup = ({ children, className, ...rest }: ListGroupProps) => (
  <div {...rest} className={cn("bg-secondary", className)}>
    {children}
  </div>
);

export type ListItemProps = Pick<Feature, "id" | "name"> & HTMLAttributes<HTMLDivElement>;

export const ListItem = ({ name, children, className, ...rest }: ListItemProps) => (
  <div {...rest} className={cn("flex items-center gap-2 rounded-md border bg-background p-2 shadow-sm", className)}>
    {children ?? <p className="m-0 font-medium text-sm">{name}</p>}
  </div>
);
