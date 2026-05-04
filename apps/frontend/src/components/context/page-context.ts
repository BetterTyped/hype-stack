import { useWillMount } from "@better-hooks/lifecycle";
import { createContext } from "@radix-ui/react-context";
import { LinkProps } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
/* eslint-disable react-hooks/exhaustive-deps */
import { useLayoutEffect } from "react";

export type NavigationItem = { title: string; icon: LucideIcon; isActive: boolean } & Pick<LinkProps, "to" | "params">;

export const [PageContext, usePageContext] = createContext<{
  isClosed: boolean;
  isMobile: boolean;
  links: Array<NavigationItem>;
  setLinks: (links: Array<NavigationItem>) => void;
  setIsSideHidden: (isSideHidden: boolean) => void;
}>("PageContext", {
  isClosed: false,
  isMobile: false,
  links: [],
  setLinks: () => null,
  setIsSideHidden: () => null,
});

export const useHideSidebar = () => {
  const { setIsSideHidden } = usePageContext("useHideSidebar");

  useWillMount(() => {
    setIsSideHidden(true);
  });

  useLayoutEffect(() => {
    setIsSideHidden(true);
    return () => {
      setIsSideHidden(false);
    };
  }, []);
};

export const useSubLinks = (links: Array<NavigationItem>) => {
  const { setLinks } = usePageContext("useSubLinks");

  useWillMount(() => {
    setLinks(links);
  });

  useLayoutEffect(() => {
    setLinks(links);
    return () => {
      setLinks([]);
    };
  }, [links]);
};
