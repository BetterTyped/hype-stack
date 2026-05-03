/**
 * Typed helper for building frontend URLs from the backend.
 *
 * Route definitions here must be kept in sync with the frontend TanStack Router
 * routes in `apps/frontend/src/routes/`. If a frontend route changes its path
 * or search params, update the corresponding entry here.
 */

type RouteDefinitions = {
  "/": Record<string, never>;
};

type RoutePath = keyof RouteDefinitions;

type SearchParams<T extends RoutePath> = RouteDefinitions[T];

type HasRequiredKeys<T> = Record<string, never> extends T ? false : true;

type FrontendUrlArgs<T extends RoutePath> = HasRequiredKeys<SearchParams<T>> extends true
  ? { path: T; search: SearchParams<T> }
  : { path: T; search?: SearchParams<T> };

export function frontendUrl<T extends RoutePath>(args: FrontendUrlArgs<T>): string {
  const base = `${process.env.FRONTEND_URL}${args.path}`;
  const search = args.search as Record<string, string | undefined> | undefined;

  if (!search) return base;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined) {
      params.set(key, value);
    }
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
