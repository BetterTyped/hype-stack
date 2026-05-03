import { Context as HonoContext } from "hono";

import type { Env } from "./src/config/env/env.config";

declare global {
  /*~ Here, declare things that go in the global namespace, or augment
   *~ existing declarations in the global namespace
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface Context extends HonoContext {}

  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
