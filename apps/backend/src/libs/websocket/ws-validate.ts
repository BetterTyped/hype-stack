import type { z } from "zod";

import type { WsMiddleware } from "./types";

export const wsValidate = <S extends z.ZodSchema>(schema: S): WsMiddleware<z.infer<S>> => ({
  _parse: (data: unknown) => schema.parse(data),
});
