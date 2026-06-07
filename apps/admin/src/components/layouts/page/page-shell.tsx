import { Link, type LinkProps } from "@tanstack/react-router";
import { createContext, Fragment, type ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type Crumb = {
  label: string;
  to?: LinkProps["to"];
  params?: LinkProps["params"];
};

type LayoutSlots = {
  breadcrumbs: HTMLElement | null;
  actions: HTMLElement | null;
  setBreadcrumbs: (el: HTMLElement | null) => void;
  setActions: (el: HTMLElement | null) => void;
};

const LayoutSlotsContext = createContext<LayoutSlots | null>(null);

function useLayoutSlots(): LayoutSlots {
  const ctx = useContext(LayoutSlotsContext);
  if (!ctx) throw new Error("Layout components must be used within a LayoutSlotsProvider");
  return ctx;
}

/** Holds the top-bar portal targets so any page can fill the breadcrumbs and actions slots. */
export function LayoutSlotsProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<HTMLElement | null>(null);
  const [actions, setActions] = useState<HTMLElement | null>(null);

  return (
    <LayoutSlotsContext.Provider value={{ breadcrumbs, actions, setBreadcrumbs, setActions }}>
      {children}
    </LayoutSlotsContext.Provider>
  );
}

/** Top-bar target where page breadcrumbs render. Mounted once by the admin chrome. */
export function LayoutBreadcrumbsSlot() {
  const { setBreadcrumbs } = useLayoutSlots();
  return <div ref={setBreadcrumbs} className="min-w-0" />;
}

/** Top-bar target where page actions render, aligned to the right. Mounted once by the admin chrome. */
export function LayoutActionsSlot() {
  const { setActions } = useLayoutSlots();
  return <div ref={setActions} className="ml-auto flex items-center gap-2" />;
}

function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1 sm:gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !item.to ? (
                  <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.to} params={item.params}>
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {isLast ? null : <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Page shell for admin screens. Sends `breadcrumbs` to the top bar and renders
 * the page body in the normal flow. Pair with `Actions` to fill the top-right
 * slot with search, filters, or the date range picker.
 */
export function Layout({ breadcrumbs, children }: { breadcrumbs: Crumb[]; children: ReactNode }) {
  const { breadcrumbs: slot } = useLayoutSlots();

  return (
    <>
      {slot ? createPortal(<Breadcrumbs items={breadcrumbs} />, slot) : null}
      {children}
    </>
  );
}

/** Renders its children into the top bar's right-aligned actions slot. */
export function Actions({ children }: { children: ReactNode }) {
  const { actions } = useLayoutSlots();
  if (!actions) return null;
  return createPortal(children, actions);
}
