import "@kushagradhawan/kookie-ui-react/styles.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/inter/wght-italic.css";
import "@fontsource-variable/inter-tight/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./fonts.css";
import "./globals.css";

import type { Metadata } from "next";
import { TooltipProvider } from "@kushagradhawan/kookie-ui-react";

import { appearanceScript } from "./appearance-script";
import { wipNoticeScript } from "./(docs)/wip-notice-script";
import { DevOutlineGate } from "./dev-outline";
import { DocsTheme } from "./theme-store";

/**
 * The wordmark's face.
 *
 * §15 gives the type layer three family SLOTS and says an app supplies the face, so a display
 * face here is the app exercising that rather than the library growing a fourth slot. It is
 * loaded for one word in one place — the masthead — which is why it is a single static face
 * rather than a family: no italic, no second weight, nothing else may reach for it. Everything
 * the reader actually reads stays on the system stack's replacement, and that is deliberate: a
 * documentation site that ships a licensed face for its body text pays a download on every page
 * for prose that reads no better.
 *
 * TANKER (2026-09-06, Kushagra), from Fontshare — after Pencerio and Telma, which replaced PP
 * Playground, which replaced Chomsky. The word the mark says is unchanged; what changes is the
 * hand it is written in.
 *
 * ITS LICENCE IS SWITZER'S, NOT THE PANGRAM PACK'S. Tanker is Indian Type Foundry's (drawn by
 * Ruosi Huang) and travels under the same Fontshare Free Font License the body face does, so
 * `Fontshare-FFL.txt` already sitting beside it is the licence text for this file too. What does
 * NOT change is how the file travels: the FFL forbids making it available through another
 * repository, so this is covered by the blanket rule in `.gitignore` and may never be
 * force-added. A fresh clone renders the fallback.
 *
 * `weight: "400"` is what this file is, and the family ships nothing else — so the wordmark's
 * `weight="regular"` is an exact match and a heading asking for semibold cannot make the browser
 * synthesize a bolder one by stroking the outline. Pencerio needed that number ARGUED, because
 * its one file declares itself at 50; this one declares 400 and the two agree.
 */

/**
 * The reading face for the whole site (2026-08-29, Kushagra — Switzer, after General Sans,
 * which read too light, and Valley Sans, DM Sans, Scoutie Sans, Google Sans and Inter before
 * it).
 *
 * §15 gives the type layer three family SLOTS and says an APP supplies the face, so this is
 * the app doing what the specification describes rather than the library growing an opinion.
 * The package still ships the system stack as its default, which is what any consumer who
 * states nothing gets.
 *
 * Switzer by Indian Type Foundry, self-hosted from fontshare.com. It titles as well as reads:
 * §15's heading slot points at this same face, so the site is ONE face and the ladder does the
 * separating (Cabinet Grotesk held that slot for part of the day and lost it by eye). It is
 * not on Google Fonts, so `next/font/google` cannot resolve it and Next generates no
 * size-adjusted fallback from a known family's metrics: the plain stack below is what shows
 * until the face arrives, so the swap moves the text slightly.
 *
 * ITS LICENCE IS NOT OFL, AND THAT DECIDES HOW THE FILE TRAVELS. The ITF Free Font License
 * permits self-hosting for this site and forbids making the file available through "another
 * font website, font library, marketplace, REPOSITORY, download service" — so unlike Chomsky,
 * which is OFL, neither file here may ever be force-added. It is PP Monument's arrangement:
 * the blanket `*.woff2` rule in `.gitignore` is doing real work, `Fontshare-FFL.txt` sits
 * beside the files for the reader who downloads them, and a fresh clone renders the fallback
 * until somebody fetches the face from fontshare.com.
 *
 * TWO FILES, BECAUSE THIS FAMILY HAS A REAL ITALIC. The prose renders `<em>`, and every face
 * this site has tried before today shipped roman only, so an emphasized phrase was a browser
 * SYNTHESIZING an oblique — a sheared roman, not a drawn italic. Declaring both styles means
 * the browser fetches the italic only on a page that uses one.
 *
 * `weight: "100 900"` is the variable file's full range on its one axis. The ladder asks for
 * 400, 500 and semibold at 600, and all three sit inside it, so no weight is synthesized
 * either. THE LADDER IS NOT WHAT MOVES IF THE PAGE READS LIGHT: those three steps are the
 * package's, and an app that answers a thin face by walking them up is stating the system's
 * weights wrong to fix its own choice of face. The face is the variable here, which is why
 * General Sans was replaced rather than bolded.
 */

/**
 * The mono face is JetBrains Mono (2026-11-11, Kushagra: "For code, we can use jetbrains mono").
 * It is open source and arrives with `@fontsource-variable/jetbrains-mono`, imported above, so
 * every clone and the live site render it. It replaced PP Neue Montreal Mono, a licensed face
 * that could not travel with the repository and so never loaded on the live site.
 *
 * One variable file carries every weight the site asks mono for: 400 for code samples and 500
 * for the component reference.
 */

export const metadata: Metadata = {
  title: "Kookie UI",
  description:
    "Base UI primitives behind a Kookie-owned API, generated OKLCH color, token-only styling.",
};

/**
 * The root scope, and ONLY the scope. `appearance="inherit"` is the whole dark-SSR design:
 * the Theme stamps every axis EXCEPT appearance, which lives on <html> where the pre-paint
 * script put it — one element owns the mode, no flash, and hydration matches because the
 * server never guessed. `suppressHydrationWarning` covers exactly the attributes that script
 * writes before React ever runs.
 *
 * The site chrome (header, nav, page padding) lives in the (site) route group; /preview owns
 * its own full-viewport shell. The root stays chrome-free so a route can be an app rather
 * than a page.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The three faces publish their names from `:root` (fonts.css) rather than from classes
    // here, so nothing inherits a family and one rule in prose.css still decides where the
    // wordmark lands.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
        <script dangerouslySetInnerHTML={{ __html: wipNoticeScript }} />
      </head>
      <body>
        {/* The docs run on the system's own glass (Kushagra, 2026-08-26 — "let's embrace
            kookie"; `thin` after an hour at `regular`, judged live). Selectivity means this
            costs nothing at rest: popups pass it by construction, `backdrop`-marked controls
            take it, and every unmarked in-flow control still resolves solid. */}
        {/* `size="3"` (2026-09-05, the day the axis shipped): the docs app states its own
            resting index rather than writing it on every control. Nothing here is a form to
            fill in — it is a document read at arm's length — so the frame, the nav rows and the
            controls in the chrome all sit one step up. It reaches no prose: the type family is
            outside this axis by design, so the chapters are unmoved. */}
        {/* THE AXES COME FROM A STORE SINCE 2026-09-08 (theme-store.tsx): the sidebar's Theme
            panel writes them and this root reads them. Its resting values are what was written
            here — `material="3"`, `size="2"`. */}
        <DocsTheme>
          {/* THE SITE'S TOOLTIP TIMING, ONCE (2026-09-06, Kushagra: "Why no tooltip?" — and
              there were tooltips; what was missing is this).

              The Provider does two things and the second is the one that was absent. It states
              the delay, and it GROUPS every tooltip inside it, so the first one waits and the
              rest appear as the pointer travels. With no Provider anywhere on this site, every
              tooltip waited its full 600ms independently — measured 656ms cold and 640ms
              travelling to the very next control in the same toolbar. Moving along a row of
              five icons, nobody is ever still long enough on any one of them, so nothing
              appears and the row reads as if it carries no tooltips at all.

              It has been that way for every tooltip on the site since the first one shipped:
              the back button, the GitHub link, the page actions. The package's own instruction
              says to wrap an app once near the root, and this is that. */}
          <TooltipProvider>{children}</TooltipProvider>
        </DocsTheme>
        {/* Dev only: bare `o` outlines every box on the page. Null in a production build. */}
        <DevOutlineGate />
      </body>
    </html>
  );
}
