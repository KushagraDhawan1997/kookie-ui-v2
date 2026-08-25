/**
 * The docs site, in KookieUI's own Shell (§27).
 *
 * This is the second real consumer the Shell has — the builder was the first, and porting it
 * found a hide mechanism that had been dead since the day it shipped. A docs site is the
 * honest second: a navigation column, a scrolling body, and a phone posture, which is the
 * plainest thing an app frame is ever asked for. Everything the reader sees here is a
 * package export.
 *
 * NO HEADER (2026-08-26, Kushagra). The header's whole content was a wordmark, search and
 * two utilities — none of it about the page you are reading — so the row it occupied was
 * 100% chrome. The sidebar absorbs all of it through the Shell's own pinned-stack anatomy
 * (§27: siblings before a ShellScroll pin above it, siblings after pin below): the wordmark
 * and search are the sidebar's unofficial header, the GitHub link and the appearance Select
 * its unofficial footer. What the header used to guarantee — a route back to the sidebar
 * once it is closed or an overlay — moves to a trigger FLOATING in the content pane.
 *
 * The sidebar rests `auto` — open on a roomy window, an overlay on a narrow one, resolved in
 * CSS through §18's window class, so first paint is right with no script and hydration cannot
 * mismatch.
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
  ShellScroll,
  ShellSidebar,
  ShellTrigger,
  Stack,
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
      <Shell>
        <ShellSidebar aria-label="Documentation">
          {/* The unofficial header — pinned above the scroller by position alone (§27's
              pinned-stack rule; no part names exist and none are needed). */}
          <Stack gap="3">
            <Heading size="4" render={<span />}>
              <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
                KookieUI
              </Link>
            </Heading>
            <DocsSearch index={buildSearchIndex()} />
          </Stack>

          {/* DocsNav renders its own ShellScroll as its root — wrapping it in another one
              here nested two scrollers: the inner took its content's height, never scrolled
              vertically, lost the bleed re-pad (15px of real x-overflow) and drew a
              horizontal bar over the footer. Measured 2026-08-26. The scroller must be the
              pane's DIRECT child for the pinned-stack and bleed machinery to see it. */}
          <DocsNav sections={sections} components={components} />

          {/* The unofficial footer — pinned below the scroller the same way. */}
          <Flex align="center" justify="space-between" gap="2">
            <Button
              emphasis="quiet"
              render={<a href="https://github.com/KushagraDhawan1997/kookie-ui-v2" />}
            >
              GitHub
            </Button>
            <AppearanceToggle />
          </Flex>
        </ShellSidebar>

        {/* The shell rests at its default 2 (2026-08-26, Kushagra — it went to 3 for a day and
            came back; the pane states nothing and follows). The padding used to be a `p="6"`
            on a Box inside the scroller, which is the same distance said by hand — and said
            in the one place the pane's own padding could not reach it.

            `position: relative` is the trigger's containing block, stated inline because the
            shell root is the nearest positioned ancestor otherwise and the trigger would
            resolve its inset over the sidebar column, not this pane. */}
        <ShellContent style={{ position: "relative" }}>
          {/* The route back to a closed or overlaying sidebar floats in the pane's own safe
              area — `--kui-sf-p` inherits from the pane deliberately (§10, the bleed
              mechanism), so the trigger sits exactly where pinned content would start.
              Out of flow, so the reading column never budges when the sidebar opens; above
              the chapters' own positioned content (the sticky TOC) by the z-index. */}
          <Box
            style={{
              position: "absolute",
              insetBlockStart: "var(--kui-sf-p)",
              insetInlineStart: "var(--kui-sf-p)",
              zIndex: 1,
            }}
          >
            <ShellTrigger
              target="sidebar"
              render={
                <Button emphasis="quiet" iconOnly aria-label="Toggle navigation">
                  <PanelLeftIcon />
                </Button>
              }
            />
          </Box>
          <ShellScroll className="kd-scroll">
            {/* The page states its own measure, deliberately. A chapter is a reading column
                with a table of contents beside it; a component page is a reading column with
                wide tables under it; the home page is neither. One max-width here would have
                to be wrong for two of the three, and the version of this file that had one
                left a third of the window empty on every page. */}
            {children}
          </ShellScroll>
        </ShellContent>
      </Shell>
    </Box>
  );
}
