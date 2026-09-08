import "@kookie-ui/react/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import { TooltipProvider } from "@kookie-ui/react";

import { appearanceScript } from "./appearance-script";
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
const wordmark = localFont({
  src: "./fonts/Tanker-Regular.woff2",
  variable: "--kd-font-wordmark",
  weight: "400",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
});

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
const body = localFont({
  src: [
    { path: "./fonts/Switzer.woff2", weight: "100 900", style: "normal" },
    {
      path: "./fonts/Switzer-Italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--kd-font-body",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
});

/**
 * The mono face (2026-08-29, Kushagra — PP Neue Montreal Mono, from the Pangram Pangram
 * starter pack).
 *
 * THIS REVERSES A STATED DECISION, which is why it is written down rather than simply done.
 * The mono slot was left on the system stack on purpose, with the reason recorded in
 * `globals.css`: a code sample is set in whatever the reader's machine calls a monospace, and
 * that is the one place a familiar face beats a chosen one. The counter-argument is that a
 * site whose body and headings are one chosen face and whose code is whatever SF Mono or
 * Consolas happens to be is not one document — the reader's machine gets a vote on a third of
 * the page. The slot is the app's to fill either way, so this is the app changing its mind.
 *
 * TWO WEIGHTS, WHICH IS EVERY WEIGHT THIS SITE ASKS MONO FOR. Code samples set 400; the
 * component reference sets `weight="medium"`, which is 500. This family ships static faces
 * rather than a variable file, so each weight is a file and shipping the ones nobody uses is
 * a download nobody needs. THE GAP IS 600: the type ladder tops at semibold and no file here
 * carries it, so a mono atom asking for semibold matches the 500 file and Chrome may shear
 * it. Nothing on this site asks — bold is refused system-wide and the syntax theme drops it —
 * so the gap is stated rather than papered over with a Bold file declared at a weight it is
 * not.
 *
 * PANGRAM PANGRAM FORBID REDISTRIBUTION, so this is PP Monument's arrangement and not the
 * Fontshare one: the files stay gitignored, they may never be force-added, and no licence
 * text travels beside them because the pack does not ship one to carry. A fresh clone renders
 * the system stack — which is exactly what the package's own default is, so the fallback here
 * is the decision this file just reversed.
 *
 * THE PACKAGE'S OPTICAL CORRECTION WAS JUDGED AGAINST THE SYSTEM STACK. `monoScale` (0.925)
 * exists because mono faces run wider with a taller x-height and read a step large beside the
 * body face; the number was picked by eye in 2026-08-08 against whatever SF Mono resolved to.
 * A chosen face has its own x-height, so the constant may want re-judging now that the face is
 * known — that is a package config line and a taste call, not something this file may take.
 */
const mono = localFont({
  src: [
    { path: "./fonts/NeueMontrealMono.woff2", weight: "400", style: "normal" },
    {
      path: "./fonts/NeueMontrealMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--kd-font-mono",
  display: "swap",
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Consolas",
    "monospace",
  ],
});

export const metadata: Metadata = {
  title: "KookieUI",
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
    // The wordmark's class only publishes `--kd-font-wordmark`; it sets no font-family here,
    // so nothing inherits the face and one rule in prose.css decides where it lands.
    <html
      lang="en"
      className={`${wordmark.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
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
            here — `material="regular"`, `size="2"`. */}
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
