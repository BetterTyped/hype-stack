import type { z } from "zod";
import type { WsMiddleware } from "./types";
export declare const wsValidate: <S extends z.ZodSchema>(schema: S) => WsMiddleware<z.infer<S>>;
//# sourceMappingURL=ws-validate.d.ts.map