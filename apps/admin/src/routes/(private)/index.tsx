import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Code2,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  Lock,
  Server,
  ShieldCheck,
  Users,
  Zap,
  FolderKanban,
  Bell,
} from "lucide-react";

import logoSrc from "@/assets/images/logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(private)/")({
  loader: () => ({ crumb: "Home" }),
  component: LandingPage,
});

const modules = [
  { icon: KeyRound, label: "Authentication", detail: "Auth, MFA & email flows" },
  { icon: ShieldCheck, label: "RBAC & Permissions", detail: "Role-based access out of the box" },
  { icon: Users, label: "Organizations", detail: "Multi-tenant with invitations & settings" },
  { icon: FolderKanban, label: "Projects", detail: "Scoped workspaces per organization" },
  { icon: CreditCard, label: "Payments", detail: "Stripe billing, plans & usage metering" },
  { icon: Bell, label: "Notifications", detail: "In-app + email with real-time delivery" },
  { icon: LayoutDashboard, label: "Layouts", detail: "Sidebar, breadcrumbs, dark mode, Electron" },
  { icon: Server, label: "Backend API", detail: "Hono, Prisma, Kysely, Valkey cache" },
  { icon: Lock, label: "Error Handling", detail: "Typed errors, Sentry, centralized middleware" },
  { icon: Zap, label: "Real-time", detail: "Type-safe WebSockets with HyperFetch" },
];

function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[20%] right-[10%] h-[600px] w-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6">
        <div className="flex flex-col items-center text-center">
          <img src={logoSrc} alt="Hype Stack" className="mb-4 h-28 w-28 drop-shadow-lg sm:h-36 sm:w-36" />

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Stop building boilerplate.
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Start shipping products.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Production-ready auth, organizations, payments, real-time, RBAC, and more — wired together so you don't have
            to. Every module you'd spend weeks building is already here, typed end-to-end.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8 text-base" asChild>
              <a href="https://www.hype-stack.dev/docs/getting-started/" target="_blank" rel="noopener noreferrer">
                Get Started
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-8 text-base" asChild>
              <a href="https://github.com/BetterTyped/hype-stack" target="_blank" rel="noopener noreferrer">
                <Code2 className="size-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-14 w-full">
          <p className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground/60">
            What's inside
          </p>
          <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">
            Weeks of work. Already done.
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(({ icon: Icon, label, detail }) => (
              <div
                key={label}
                className="group relative rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon className="size-4.5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{label}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 flex flex-col items-center rounded-2xl border border-border/40 bg-card/40 px-8 py-12 text-center backdrop-blur-sm sm:px-16">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Built with</p>
          <p className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>Hono</span>
            <span className="text-border">·</span>
            <span>React</span>
            <span className="text-border">·</span>
            <span>TanStack Router</span>
            <span className="text-border">·</span>
            <span>Prisma</span>
            <span className="text-border">·</span>
            <span>Kysely</span>
            <span className="text-border">·</span>
            <span>HyperFetch</span>
            <span className="text-border">·</span>
            <span>Stripe</span>
            <span className="text-border">·</span>
            <span>Tailwind</span>
            <span className="text-border">·</span>
            <span>shadcn/ui</span>
          </p>
          <p className="mt-6 max-w-lg text-muted-foreground">
            Every integration is production-grade and typed end-to-end. No glue code, no guesswork.
          </p>
          <Button size="lg" className="mt-8 gap-2 px-8 text-base" asChild>
            <a href="https://www.hype-stack.dev/packs/" target="_blank" rel="noopener noreferrer">
              Explore the modules
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>

        <footer className="mt-16 pb-8 text-center text-xs text-muted-foreground/50">
          <a
            href="https://www.hype-stack.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-muted-foreground"
          >
            www.hype-stack.dev
          </a>
        </footer>
      </div>
    </div>
  );
}
