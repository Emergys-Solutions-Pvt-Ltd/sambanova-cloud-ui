"use client";

import { IconButton } from "@/components/ui/icon-button";

import { Logo } from "./logo";

/** Phone header: hamburger + logo. Hidden from the tablet breakpoint up. */
export function MobileTopBar({ onOpen, open }: { onOpen: () => void; open: boolean }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-default bg-sidebar px-3 md:hidden">
      <IconButton
        icon="menu"
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={onOpen}
      />
      <Logo />
    </header>
  );
}
