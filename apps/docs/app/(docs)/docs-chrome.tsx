/**
 * The docs site, in KookieUI's own Shell (§27).
 *
 * This is the second real consumer the Shell has — the builder was the first, and porting it
 * found a hide mechanism that had been dead since the day it shipped. A docs site is the
 * honest second: a header, a navigation column, a scrolling body, and a phone posture, which
 * is the plainest thing an app frame is ever asked for. Everything the reader sees here is a
 * package export.
 *
 * The sidebar rests `auto` — open on a roomy window, an overlay on a narrow one, resolved in
 * CSS through §18's window class, so first paint is right with no script and hydration cannot
 * mismatch. The trigger in the header is what opens it once it is an overlay.
 *
 * A COMPONENT RATHER THAN THE LAYOUT ITSELF, because it has two callers Next will never let
 * share one: `layout.tsx` wraps the route group, and `not-found.tsx` cannot be in that group —
 * Next matches an unknown URL against no segment at all and wraps the root not-found in the
 * ROOT layout only. That is not hypothetical here: when the chrome last moved into a route
 * group (2026-08-08) the 404 was left behind and rendered with no header, no inset and no
 * `<main>` landmark, its heading flush in the viewport's corner with the ascenders clipped.
 * A route group is a layout boundary, not a place.
 */
import Link from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Shell,
  ShellContent,
  ShellHeader,
  ShellScroll,
  ShellSidebar,
  ShellTrigger,
} from "@kookie-ui/react";

import { AppearanceToggle } from "../appearance-toggle";
import { PanelLeftIcon } from "../icons";
import { CHAPTERS, SECTIONS } from "./chapters";
import { DocsNav, type NavSection } from "./docs-nav";
import { DocsSearch } from "./docs-search";
import { buildSearchIndex } from "./search-index";
import { ENTRIES } from "./components/registry";
import "./prose.css";

export function DocsChrome({ children }: { children: React.ReactNode }) {
  const sections: NavSection[] = SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    links: CHAPTERS.filter((chapter) => chapter.section === section.id).map((chapter) => ({
      href: `/${chapter.slug}`,
      label: chapter.title,
    })),
  })).filter((section) => section.links.length > 0);

  const components = ENTRIES.map((entry) => ({
    href: `/components/${entry.slug}`,
    label: entry.name,
  }));

  return (
    // The frame takes the window; `100dvh` rather than `100vh` so a phone's collapsing
    // browser chrome does not leave the shell taller than the screen it is in.
    <Box style={{ blockSize: "100dvh" }}>
      <Shell size="2">
        <ShellHeader>
          <Flex align="center" justify="space-between" gap="4" px="4" style={{ blockSize: "100%" }}>
            <Flex align="center" gap="3">
              <ShellTrigger
                target="sidebar"
                render={
                  <Button size="1" emphasis="quiet" iconOnly aria-label="Toggle navigation">
                    <PanelLeftIcon />
                  </Button>
                }
              />
              <Heading size="4" render={<span />}>
                <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
                  KookieUI
                </Link>
              </Heading>
            </Flex>
            {/* Deliberately thin. The workbench used to be three buttons here as well as a
                nav group, which is one fact in two places — and the header is the wrong one:
                a row of links beside the wordmark reads as the site's primary navigation,
                which these are not. They live in the sidebar with everything else now. */}
            <Flex align="center" gap="2">
              <DocsSearch index={buildSearchIndex()} />
              <Button
                size="1"
                emphasis="quiet"
                render={<a href="https://github.com/KushagraDhawan1997/kookie-ui-v2" />}
              >
                GitHub
              </Button>
              <AppearanceToggle />
            </Flex>
          </Flex>
        </ShellHeader>

        <ShellSidebar aria-label="Documentation">
          <DocsNav sections={sections} components={components} />
        </ShellSidebar>

        <ShellContent>
          <ShellScroll>
            {/* The page states its own measure, deliberately. A chapter is a reading column
                with a table of contents beside it; a component page is a reading column with
                wide tables under it; the home page is neither. One max-width here would have
                to be wrong for two of the three, and the version of this file that had one
                left a third of the window empty on every page. */}
            <Box p="6">{children}</Box>
          </ShellScroll>
        </ShellContent>
      </Shell>
    </Box>
  );
}
