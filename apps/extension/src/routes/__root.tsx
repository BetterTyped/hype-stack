import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";

// oxlint-disable-next-line import/no-unassigned-import
import "@/assets/styles.css";
import { AppError } from "@/components/errors/app-error";
import { NotFound } from "@/components/errors/not-found";
import { Providers } from "@/components/providers/providers";
import { m } from "@/paraglide/messages.js";

export const Route = createRootRoute({
  // Single source of truth for document metadata. The popup gets the document
  // wrapper from index.html and mounts into #root; React 19 hoists these into
  // <head>.
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: m.app_title() },
      { name: "description", content: m.app_description() },
      { name: "theme-color", content: "#14110e" },
    ],
    links: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/assets/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/assets/favicon-16x16.png" },
    ],
  }),
  notFoundComponent: NotFound,
  errorComponent: AppError,
  component: Root,
});

function Root() {
  return (
    <>
      <Providers>
        <Outlet />
      </Providers>
      <HeadContent />
    </>
  );
}
