import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { paraglideMiddleware } from "@/paraglide/server.js";

/**
 * The locale has to be resolved before TanStack Start renders, so the request is
 * wrapped here rather than in a route. The middleware reads the locale cookie
 * (falling back to Accept-Language) and keeps the result in AsyncLocalStorage so
 * concurrent requests cannot read each other's locale. The URL is left untouched
 * because the locale is not part of it.
 */
// oxlint-disable-next-line import/no-default-export -- TanStack Start resolves the server entry by default export.
export default createServerEntry({
  fetch: (request) => paraglideMiddleware(request, () => handler.fetch(request)),
});
