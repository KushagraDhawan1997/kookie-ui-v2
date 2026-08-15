import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RootLayout from "./layout";
import SiteLayout from "./(site)/layout";
import NotFound from "./not-found";
import { appearanceScript } from "./appearance-script";

/**
 * The app SHELL's laws (added 2026-08-08).
 *
 * appearance.test.ts proves the two implementations of the appearance rule agree with each
 * other. What nothing proved was that either one reaches a page: that the pre-paint script is
 * actually rendered into a document head, that a route actually sits inside the root Theme,
 * and that a page-shaped route actually gets the page chrome. Those are exactly the three
 * properties the (site) route-group move put at risk, and one of them broke — the 404 lost its
 * header, its inset and its <main> landmark, because Next wraps an unmatched URL in the ROOT
 * layout only and a group layout never reaches it.
 *
 * Rendered, not read. The question is what the browser receives, and a law that greps the
 * source would have passed on the broken tree unchanged: not-found.tsx was correct in
 * isolation the whole time — it was correct in the wrong PLACE.
 */
const app = dirname(fileURLToPath(import.meta.url));
const html = (node: unknown) => renderToStaticMarkup(node as never);

describe("the root layout is the one place appearance is decided", () => {
  it("renders the pre-paint script into the document head, verbatim", () => {
    // Verbatim against the exported string, so the script cannot be paraphrased into a
    // different rule than the one appearance.test.ts proves correct.
    const out = html(RootLayout({ children: "page" }));
    expect(out).toContain("<head>");
    expect(out).toContain(appearanceScript);
    expect(out.indexOf(appearanceScript)).toBeLessThan(out.indexOf("<body"));
  });

  it("puts every route inside the Theme, and leaves appearance to <html>", () => {
    // `appearance="inherit"` is the whole dark-SSR design: the Theme stamps every axis EXCEPT
    // appearance, which the script already wrote on <html>. A Theme that stamped a mode here
    // would be the server guessing, which is the hydration mismatch the design avoids.
    const out = html(RootLayout({ children: "page" }));
    expect(out).toContain('class="kui-theme"');
    expect(out).not.toContain('data-appearance=');
    expect(out).toContain("page");
  });
});

describe("a page-shaped route gets the page chrome — including the one Next reaches itself", () => {
  // The header, the inset and the landmark, asserted as the three things the 404 lost rather
  // than as "it renders SiteChrome" — a law naming the component would pass on a SiteChrome
  // that had been emptied.
  const wearsChrome = (out: string) => ({
    header: out.includes("<header"),
    main: out.includes("<main"),
    inset: /class="[^"]*kui-box[^"]*"[^>]*style="[^"]*--kui-p/.test(out) || out.includes("--kui-p"),
  });

  it("the (site) group wears it", () => {
    const chrome = wearsChrome(html(SiteLayout({ children: "page" })));
    expect(chrome).toEqual({ header: true, main: true, inset: true });
  });

  it("not-found wears it too, because a route group cannot reach it", () => {
    // The regression, stated as its own law: Next matches an unmatched URL against no segment,
    // so app/not-found.tsx is wrapped by the ROOT layout alone. It has to carry the chrome
    // itself, and did not between 0d192d4 and this commit.
    const chrome = wearsChrome(html(NotFound()));
    expect(chrome).toEqual({ header: true, main: true, inset: true });
  });

  it("every page.tsx outside (site) is a deliberate bare-viewport route", () => {
    // The structural half, because the two laws above can only check the routes they import.
    // A new page added outside the group silently opts out of the chrome, which is a decision
    // (/preview owns its viewport on purpose) — so it is allowed, and it has to be listed.
    // "lab" and "lab2" are the material scratch surfaces — temporary judging routes,
    // deleted when the recipes they exist to find move into config.
    const BARE = new Set(["preview", "lab", "lab2", "lab3"]);
    const outside = readdirSync(app, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("(") && !e.name.startsWith("_"))
      .filter((e) => {
        try {
          return readdirSync(join(app, e.name)).some((f) => f === "page.tsx");
        } catch {
          return false;
        }
      })
      .map((e) => e.name);
    expect(outside.filter((name) => !BARE.has(name))).toEqual([]);
  });
});
