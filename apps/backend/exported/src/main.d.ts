import { Env } from "./config/env/env.config";
declare global {
    namespace NodeJS {
        interface ProcessEnv extends Env {
        }
    }
}
//# sourceMappingURL=main.d.ts.map