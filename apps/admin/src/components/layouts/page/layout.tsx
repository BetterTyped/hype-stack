import { Link, Outlet, useRouterState, type LinkProps } from "@tanstack/react-router";
import { BlocksIcon, LucideIcon } from "lucide-react";

import brandIcon from "@/assets/images/icon.png";
import { LayoutActionsSlot, LayoutBreadcrumbsSlot } from "@/components/layouts/page/page-shell";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config";

const NAV_GROUPS = [
  {
    label: "Product",
    items: [
      {
        label: "Dashboard",
        icon: BlocksIcon,
        to: "/",
      },
    ],
  },
] as {
  label: string;
  items: ({ label: string; icon: LucideIcon; exact: boolean } & Pick<LinkProps, "to" | "params">)[];
}[];

export function PageLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <img src={brandIcon} alt="" className="size-7 shrink-0" />
            <span className="font-semibold">{APP_CONFIG.shortName}</span>
            <AnimatedThemeToggler className="ml-auto group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {NAV_GROUPS.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = item.exact ? pathname === item.to : pathname?.startsWith(item.to ?? "");
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                          <Link to={item.to}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex min-h-11 shrink-0 items-center gap-2 px-4 pt-4">
          <SidebarTrigger />
          <LayoutBreadcrumbsSlot />
          <LayoutActionsSlot />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
