"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-group" className={cn("grid gap-6", className)} {...props} />;
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field" className={cn("grid gap-3", className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={cn("font-medium", className)} {...props} />;
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

function FieldSeparator({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="field-separator" className={cn("relative text-center text-sm", className)} {...props}>
      <Separator className="absolute inset-0 top-1/2" />
      <span className="bg-page-background text-muted-foreground relative z-10 px-2">{children}</span>
    </div>
  );
}

export { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator };
