"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { Drawer } from "@/components/ui/drawer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthDialogHost } from "@/features/auth";
import { CreateProjectDialog } from "@/features/projects";
import { selectMobileNavOpen, useUIStore } from "@/stores/ui-store";

import { MobileTopBar } from "./mobile-top-bar";
import { SidebarContent } from "./sidebar";

/**
 * Responsive application frame.
 *   < md (phone)    top bar + slide-in drawer
 *   md  (tablet)    72px icon rail with tooltips; its toggle opens the same drawer
 *   ≥ lg (desktop)  fixed 248px sidebar
 * Only <main> scrolls, so the page itself never scrolls sideways. <main> is `relative` so
 * absolutely positioned content (e.g. sr-only text) is contained and cannot grow the document.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const navOpen = useUIStore(selectMobileNavOpen);
  const setNavOpen = useUIStore((state) => state.setMobileNavOpen);
  // The control that opened the drawer, so focus can go back to it on close.
  const [opener, setOpener] = useState<HTMLElement | null>(null);

  // Close the drawer after navigating.
  useEffect(() => {
    useUIStore.getState().setMobileNavOpen(false);
  }, [pathname]);

  // The drawer is for narrow screens; close it if the window grows to desktop.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onChange = () => {
      if (desktop.matches) useUIStore.getState().setMobileNavOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  const closeNav = () => setNavOpen(false);
  const openNav = () => {
    setOpener(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setNavOpen(true);
  };

  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={300}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-toast focus:rounded-md focus:bg-inverse focus:px-4 focus:py-2 focus:text-label focus:text-inverse"
      >
        Skip to main content
      </a>

      <div className="flex h-dvh flex-col overflow-hidden bg-canvas md:flex-row">
        <MobileTopBar open={navOpen} onOpen={openNav} />

        <aside
          aria-label="Sidebar"
          className="hidden shrink-0 border-r border-default bg-sidebar md:block md:w-(--sn-sidebar-width-collapsed) lg:w-(--sn-sidebar-width)"
        >
          <div className="hidden h-full lg:block">
            <SidebarContent />
          </div>
          <div className="h-full lg:hidden">
            <SidebarContent collapsed expanded={navOpen} onExpand={openNav} />
          </div>
        </aside>

        <Drawer open={navOpen} onOpenChange={setNavOpen} title="Navigation" returnFocusTo={opener}>
          <SidebarContent onNavigate={closeNav} />
        </Drawer>

        <main
          id="main-content"
          tabIndex={-1}
          className="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto outline-none"
        >
          {children}
        </main>
      </div>

      <AuthDialogHost />
      <CreateProjectDialog />
    </TooltipProvider>
  );
}
