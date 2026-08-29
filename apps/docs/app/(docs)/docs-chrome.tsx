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
  Shell,
  ShellContent,
  ShellScroll,
  ShellSidebar,
  ShellTrigger,
} from "@kookie-ui/react";

import { AppearanceToggle } from "../appearance-toggle";
import { PanelLeftIcon } from "../icons";
import { CHAPTERS, SECTIONS } from "./chapters";
import { DocsNav, type NavSection } from "./docs-nav";
import { DocsSearch } from "./docs-search";
import { Wordmark } from "./wordmark";
import { buildSearchIndex } from "./search-index";
import { ENTRIES } from "./components/registry";
import "./prose.css";

export function DocsChrome({ children }: { children: React.ReactNode }) {
  const sections: NavSection[] = SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    links: CHAPTERS.filter((chapter) => chapter.section === section.id).map(
      (chapter) => ({
        href: `/${chapter.slug}`,
        label: chapter.title,
      }),
    ),
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
        <ShellSidebar aria-label="Documentation" flush={false}>
          {/* The unofficial header — pinned above the scroller by position alone (§27's
              pinned-stack rule; no part names exist and none are needed).

              THE LOGO IS ONE LETTER (Kushagra, 2026-08-28). It was the full word in a
              condensed grotesque, then the full word in this blackletter, and the second of
              those is what produced this one: a blackletter's capitals are its ornate half,
              so "KookieUI" set here has two adjacent capitals at the end that read as one
              shape, and the same word in full capitals cannot be read at all. A single
              drawn capital is the form this kind of face has always been best at.

              THE ACCESSIBLE NAME IS STILL THE WHOLE NAME. The letter is decoration doing a
              logo's job, so the link states `aria-label` and a screen reader announces
              "KookieUI" rather than the letter K. Without it the one route back to the home
              page would announce itself as a single letter.

              THE GLYPH ITSELF IS `<Wordmark>` (2026-08-29), because the front door now sets
              the same mark above its title and the three facts that make it the mark — the
              face, the regular weight, the collapsed line box — cannot be copied to a second
              call site and stay one thing. Why each of them is what it is lives beside the
              component. What stays HERE is the only fact that is about this placement rather
              than the mark: the link. */}
          {/* One row, not two (2026-08-28) — search moved in beside the mark once it became
              an icon button rather than a full-width fake input, the same `Flex
              justify="space-between"` shape the footer row below already uses.

              `align="start"`, NOT `"center"` (2026-08-29): the wordmark's line box is a size-8
              display glyph, far taller than an icon button, so centering the row centered the
              button against the GLYPH's height — measurably lower than the collapse trigger
              floating in the content pane, which sits flush at the pane's own top inset with
              no tall sibling beside it. Top-aligning puts both buttons' top edges at the same
              offset from their pane's own padding, which is what actually matches them. */}
          <Flex align="start" justify="space-between">
            <Link
              href="/"
              aria-label="KookieUI"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Wordmark />
            </Link>
            <DocsSearch index={buildSearchIndex()} />
          </Flex>

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
              render={
                <a href="https://github.com/KushagraDhawan1997/kookie-ui-v2" />
              }
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
              the chapters' own positioned content (the sticky TOC) by the z-index.

              PLUS THE SHELL'S OWN SAFE AREA (§27, 2026-08-29). The sidebar floats, so this
              pane's box starts at the window's edge and runs UNDER it — which is what lets a
              wide page bleed behind the nav, and what would otherwise put this button
              underneath it. `--kui-shell-inset-inline-start` is the reach the floating pane
              leaves, published by the frame and zero the moment the sidebar closes or
              overlays, so the button walks back to the pane's own corner with no branch
              here. */}
          <Box
            style={{
              position: "absolute",
              insetBlockStart: "var(--kui-sf-p)",
              insetInlineStart:
                "calc(var(--kui-shell-inset-inline-start) + var(--kui-sf-p))",
              zIndex: 1,
            }}
          >
            <ShellTrigger
              target="sidebar"
              render={
                <Button
                  emphasis="quiet"
                  iconOnly
                  aria-label="Toggle navigation"
                >
                  <PanelLeftIcon />
                </Button>
              }
            />
          </Box>
          <ShellScroll className="kd-scroll">
            {/* AND THE READING COLUMN CLEARS THE SIDEBAR. The pane runs under the floating
                nav, so without this the measure would centre itself over the whole window —
                half of it behind the sidebar. The page's own frame centres inside whatever
                room it is given, so giving it the room that is actually visible is the entire
                fix; nothing here restates the sidebar's width, and nothing changes when the
                sidebar closes, because the published reach is zero then.

                It is stated HERE rather than on the pane so a page can still choose to bleed:
                a section that wants to run behind the nav says `m="bleed"` against this
                padding, which is the choice the reach exists to make possible. */}
            <Box style={{ paddingInlineStart: "var(--kui-shell-inset-inline-start)" }}>
              {/* The page states its own measure, deliberately. A chapter is a reading column
                  with a table of contents beside it; a component page is a reading column with
                  wide tables under it; the home page is neither. One max-width here would have
                  to be wrong for two of the three, and the version of this file that had one
                  left a third of the window empty on every page. */}
              {children}
            </Box>
          </ShellScroll>
        </ShellContent>
      </Shell>
    </Box>
  );
}
