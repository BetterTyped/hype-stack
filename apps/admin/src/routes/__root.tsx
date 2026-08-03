import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

// oxlint-disable-next-line import/no-unassigned-import
import "@/assets/styles.css";
import { AppError } from "@/components/errors/app-error";
import { NotFound } from "@/components/errors/not-found";
import { Providers } from "@/components/providers/providers";
import { themeBootstrapScript } from "@/lib/theme";
import { m } from "@/paraglide/messages.js";
import { getLocale } from "@/paraglide/runtime.js";

const themeBootstrapHtml = { __html: themeBootstrapScript };

export const Route = createRootRoute({
  // Single source of truth for document metadata across SSR and CSR. SSR renders
  // these into <head>; in the browser React 19 hoists them there.
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
      { rel: "apple-touch-icon", href: "/assets/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  notFoundComponent: NotFound,
  errorComponent: AppError,
  component: Root,
});

/**
 * Under SSR React emits the entire document and hydrates against it, so the
 * wrapper has to come from here. The CSR build takes it from index.html and
 * mounts into #root, so it is compiled out of that bundle.
 */
function DocumentShell({ children }: { children: ReactNode }) {
  if (!__SSR_SHELL__) {
    return children;
  }

  return (
    // The theme script below mutates the class before React hydrates, which is
    // the point - suppressing lets that intentional difference through.
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={themeBootstrapHtml} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Root() {
  return (
    <DocumentShell>
      <Providers>
        <Outlet />
      </Providers>
      {!__SSR_SHELL__ && <HeadContent />}
    </DocumentShell>
  );
}
