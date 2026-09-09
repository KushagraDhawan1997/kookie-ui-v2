"use client";
/**
 * THE TAB BAR (2026-09-09, Kushagra: "when I want it responsive, I want tabs, not necessarily
 * derived from sidebar, but declared by me"). Four places and a search seat, declared here and
 * nowhere derived: the docs have no rail, so `ShellTabBar` is the sidebar-only app's way of
 * saying what a phone gets. Nothing on a wide window. Which tab is current comes from the
 * route, the way the tree marks its current chapter. Search is a `ShellRailAction`, not a
 * fifth tab: it opens a dialog rather than going anywhere, so it sits outside the pill of
 * places as its own pane (§27, 2026-09-09).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShellRailAction, ShellRailItem, ShellRailList, ShellTabBar } from "@kookie-ui/react";

import { AllComponentsIcon, GridIcon, HomeIcon, IdeaIcon, SearchIcon } from "../icons";

const TABS = [
  { label: "Start", href: "/", icon: HomeIcon, at: (p: string) => p === "/" || p.startsWith("/start") || p.startsWith("/concepts") },
  { label: "Foundations", href: "/foundations/color", icon: IdeaIcon, at: (p: string) => p.startsWith("/foundations") },
  { label: "Patterns", href: "/patterns/composition", icon: GridIcon, at: (p: string) => p.startsWith("/patterns") },
  { label: "Components", href: "/components", icon: AllComponentsIcon, at: (p: string) => p.startsWith("/components") },
] as const;

export function DocsTabBar() {
  const pathname = usePathname() ?? "/";
  return (
    <ShellTabBar aria-label="Sections" flush={false} backdrop>
      <ShellRailList>
        {TABS.map(({ label, href, icon: Icon, at }) => (
          <ShellRailItem key={href} label={label} current={at(pathname)} render={<Link href={href} />}>
            <Icon />
          </ShellRailItem>
        ))}
      </ShellRailList>
      <ShellRailAction label="Search" onClick={() => document.dispatchEvent(new CustomEvent("kd:search"))}>
        <SearchIcon />
      </ShellRailAction>
    </ShellTabBar>
  );
}
