import { validator } from "hono/validator";
import { z } from "zod";

export const validate = <T extends "form" | "json" | "query" | "param" | "header", S extends z.ZodSchema>(
  target: T,
  schema: S,
) =>
  validator(target, async (value) => {
    // We want errors to be thrown here
    // Later catched by middleware and handled in a single place
    return schema.parse(value);
  });
