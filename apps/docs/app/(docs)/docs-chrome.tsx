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
  ShellPaneFooter,
  ShellPaneHeader,
  ShellSidebar,
  ShellTrigger,
} from "@kookie-ui/react";

import { AppearanceToggle } from "../appearance-toggle";
import { PanelLeftIcon } from "../icons";
import { CHAPTERS, SECTIONS } from "./chapters";
import { DocsBack } from "./docs-back";
import { DocsNav, type NavSection } from "./docs-nav";
import { DocsSearch } from "./docs-search";
import { Wordmark } from "./wordmark";
import { humanLabel } from "./label";
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
    label: humanLabel(entry.name),
  }));

  return (
    // The frame takes the window; `100dvh` rather than `100vh` so a phone's collapsing
    // browser chrome does not leave the shell taller than the screen it is in.
    <Box style={{ blockSize: "100dvh" }}>
      <Shell>
        {/* RESIZABLE, and the bounds are this site's content speaking (§27's own reason for a
            width prop). The floor is not the system's 160: below about 240 the longest chapter
            titles — "The component families", "States and interaction" — wrap to two lines, and
            a nav whose rows change height as you drag is a worse thing than a nav you cannot
            narrow. The ceiling is a reading site's: past ~420 the column is wider than most of
            what it indexes.

            No `onResize` and no persistence. The Shell sits in this route group's layout, so a
            dragged width survives every navigation and resets on reload — which is the honest
            behaviour until the site has somewhere to put the number. Persisting it is not a
            `localStorage` line: the pane would hydrate at its default and jump, so it wants the
            pre-paint script's treatment, the same one dark mode has. */}
        <ShellSidebar
          aria-label="Documentation"
          flush={true}
          resizable
          minWidth={240}
          maxWidth={420}
          /* The package default is "Resize panel", which is right for a library that does not
             know what the pane holds. This one holds the navigation, and there is only one. */
          resizeLabel="Resize navigation"
        >
          {/* The unofficial header — pinned above the scroller by position alone (§27's
              pinned-stack rule; no part names exist and none are needed).

              THE LOGO IS THE WORD (Kushagra, 2026-09-01). It has been three things: the word
              in a condensed grotesque, then a single drawn capital in a blackletter, and now
              the word again in a script. The middle one was right for the face it was set in —
              a blackletter's capitals are its ornate half, so "KookieUI" set there had two
              adjacent capitals at the end reading as one shape, and a lone initial is what that
              kind of face has always been best at. A script is a face for WRITING a name, so it
              took the word back. `wordmark.tsx` carries the reasoning; what changed here is
              only that the link now wraps a word rather than a letter.

              THE ACCESSIBLE NAME IS STILL THE LINK'S. The mark is decoration doing a logo's
              job and is `aria-hidden` either way, so the link states `aria-label` and a screen
              reader announces "KookieUI" — which is what keeps the one route back to the home
              page from announcing itself as a picture with no name.

              THE GLYPH ITSELF IS `<Wordmark>` (2026-08-29), because the front door now sets
              the same mark above its title and the three facts that make it the mark — the
              face, the regular weight, the collapsed line box — cannot be copied to a second
              call site and stay one thing. Why each of them is what it is lives beside the
              component. What stays HERE is the only fact that is about this placement rather
              than the mark: the link. */}
          {/* One row, not two (2026-08-28) — search moved in beside the mark once it became
              an icon button rather than a full-width fake input, the same `Flex
              justify="space-between"` shape the footer row below already uses.

              THE ROW CENTRES ITSELF AGAIN (2026-09-01, Kushagra: the mark is "not center
              aligned with say, search"). Both children carried `alignSelf: "start"` from
              2026-08-29, and the reason was real THEN: the mark was a lone display capital
              whose line box towers over a 32px icon button, so centring the row sank the
              button against the GLYPH's height, below the collapse trigger floating in the
              content pane next door. Now the mark is a word rather than a display capital, so
              centring is what the eye wants and the overrides are gone rather than re-tuned:
              the part's own `align-items: center` places both children and nothing here
              restates it.

              THAT LEFT FOUR PIXELS, closed 2026-09-02: centring is only level with the pane
              next door while both rows are the same height, and the mark's own collapsed box
              was 40px against the row's 32, so the sidebar's band grew and took both of its
              children down with it. The mark's box is the row now — see `kd-masthead` below. */}
          {/* FLOATING since 2026-08-30 (Kushagra: "lets have content go behind logo header
              and light dark mode footer") — the pane's own chrome parts, shipped the day
              before. The rows pass behind this and behind the footer, the nav's scroller
              fades them out on the way (its `fade`), and the tree rests clear by spending
              the published reach — all three statements live in docs-nav.tsx. */}
          {/* The part IS the row (2026-08-30) — its children are clusters, never a
              full-width wrapper, because the floating band is transparent to the pointer
              and each child takes itself back: a wrapper spanning the row would swallow
              the clicks on the rows passing beneath. */}
          <ShellPaneHeader float>
            {/* `kd-masthead` is the one placement fact: in a chrome row the mark's box is
                the row, so it cannot grow the band and sink the search button below the
                collapse trigger next door. prose.css carries the measurement. */}
            <Link
              href="/"
              aria-label="KookieUI"
              className="kd-masthead"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Wordmark />
            </Link>
            <DocsSearch index={buildSearchIndex()} />
          </ShellPaneHeader>

          {/* DocsNav renders its own ShellScroll as its root — wrapping it in another one
              here nested two scrollers: the inner took its content's height, never scrolled
              vertically, lost the bleed re-pad (15px of real x-overflow) and drew a
              horizontal bar over the footer. Measured 2026-08-26. The scroller must be the
              pane's DIRECT child for the pinned-stack and bleed machinery to see it. */}
          <DocsNav sections={sections} components={components} />

          {/* The footer, floating with the header — one posture for the pane's chrome. */}
          <ShellPaneFooter float>
            <Button
              emphasis="quiet"
              render={
                <a href="https://github.com/KushagraDhawan1997/kookie-ui-v2" />
              }
            >
              GitHub
            </Button>
            <AppearanceToggle />
          </ShellPaneFooter>
        </ShellSidebar>

        {/* The shell rests at its default 2 (2026-08-26, Kushagra — it went to 3 for a day and
            came back; the pane states nothing and follows). The padding used to be a `p="6"`
            on a Box inside the scroller, which is the same distance said by hand — and said
            in the one place the pane's own padding could not reach it.

            `position: relative` is the trigger's containing block, stated inline because the
            shell root is the nearest positioned ancestor otherwise and the trigger would
            resolve its inset over the sidebar column, not this pane. */}
        <ShellContent style={{ position: "relative" }} flush={true}>
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
          {/* A MARKED PART since 2026-08-30, not a hand-positioned Box: the edge-bleed asks
              the DOM for the first child that takes no space, and it can only see the
              package's own vocabulary — the unmarked Box was blocking the reading column
              from scrolling to the pane's edge. The part carries the pane padding and the
              z-index the Box carried by hand; what stays here is only what is about this
              placement: clearing the floating sidebar by the frame's published reach. */}
          <ShellPaneHeader float>
            {/* MARGIN, not padding (2026-08-30, Kushagra: the search button was dead): the
                part's children take the pointer back, and padding is part of the child's
                box — so a padded spacer was a 336px pointer-catcher lying over the floating
                sidebar's own chrome, which this pane's band paints above. A margin clears
                the same distance while the child's box stays the button's. */}
            <Flex
              gap="2"
              align="center"
              style={{
                marginInlineStart: "var(--kui-shell-inset-inline-start)",
              }}
            >
              <ShellTrigger
                target="sidebar"
                render={
                  <Button
                    emphasis="quiet"
                    iconOnly
                    /* Floating chrome over the reading column, like the search button and
                       the appearance toggle — it states its backdrop (§10). */
                    backdrop
                    aria-label="Toggle navigation"
                  >
                    <PanelLeftIcon />
                  </Button>
                }
              />
              {/* The route back OUT of a component's page, beside the one that opens the nav
                  (2026-09-01). It draws nothing on every other route, so this band is the
                  toggle alone almost everywhere and the `gap` costs nothing. */}
              <DocsBack />
            </Flex>
          </ShellPaneHeader>
          <ShellScroll className="kd-scroll" fade>
            {/* AND THE READING COLUMN CLEARS THE SIDEBAR. The pane runs under the floating
                nav, so without this the measure would centre itself over the whole window —
                half of it behind the sidebar. The page's own frame centres inside whatever
                room it is given, so giving it the room that is actually visible is the entire
                fix; nothing here restates the sidebar's width, and nothing changes when the
                sidebar closes, because the published reach is zero then.

                It is stated HERE rather than on the pane so a page can still choose to bleed:
                a section that wants to run behind the nav says `m="bleed"` against this
                padding, which is the choice the reach exists to make possible. */}
            <Box
              style={{
                paddingInlineStart: "var(--kui-shell-inset-inline-start)",
              }}
            >
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
