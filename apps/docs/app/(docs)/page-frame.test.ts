/**
 * The page header laws (2026-08-27, rewritten 2026-09-06 when the header left this app).
 *
 * The title/deck interval lived in six pages as six copies of `<Stack gap="3">`, which is six
 * chances to correct it and five chances to miss. It became `PageTitle` here, and on 2026-09-06
 * it became `Page` in the package (§46) — the values Kushagra judged over four days travelled
 * with it, so what is left for this app to check is that the local copy cannot grow back.
 *
 * That is `CodeBlock`'s swap law one route over, inverted the same way: the first law still
 * says no page writes its own title, and the second now says this app no longer states the
 * interval at all. FALSIFIED BOTH WAYS — restoring any page's hand-written `Heading size="8"`
 * fails the first, and re-adding a `TITLE_GAP` constant here fails the second.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const docsRoot = fileURLToPath(new URL(".", import.meta.url));

/** Every `.tsx` under the docs route group, as [path relative to the group, source]. */
function sources(): [string, string][] {
  const out: [string, string][] = [];
  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path, `${prefix}${entry.name}/`);
      else if (entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx"))
        out.push([`${prefix}${entry.name}`, readFileSync(path, "utf8")]);
    }
  };
  walk(docsRoot, "");
  return out;
}

describe("the page header has one home", () => {
  /**
   * A page's title is `PageTitle` or it is nothing. The `h1` is the signal rather than the
   * type step: a page has exactly one, only `PageTitle` renders it, and keying on the step
   * would make this law go quiet the day the step moves — which it did, 8 to 9, hours after
   * the law was written.
   */
  it("no docs page writes its own title", () => {
    for (const [name, source] of sources()) {

      // The matrix is a TOOL that happens to live under this route group, not a page of the
      // documentation — it wears a small tool header (`size 6` over a `size 2` line) the way
      // the builder and the playground do, and giving it the page ladder would make a judging
      // instrument announce itself as loudly as a chapter. Exempted with the reason stated,
      // which is the only kind of exemption this repo allows.
      if (name.startsWith("matrix/")) continue;
      expect(source, `${name} writes its own page title — use <Page>`).not.toMatch(
        /<h1[\s/>]/,
      );
    }
  });

  /**
   * AND THE INTERVAL IS NO LONGER THIS APP'S. It was `TITLE_GAP` in page-frame.tsx, judged by
   * eye across four days and then promoted into the package with the component that spends it
   * (§46). A copy here would be a second home for a number the package now owns, and the
   * cheapest way for one to come back is somebody re-deriving it beside a title.
   */
  it("this app states no title interval of its own — the package owns it now", () => {
    for (const [name, source] of sources()) {
      expect(source, `${name} restates the page's title interval — Page owns it`).not.toMatch(
        /TITLE_GAP/,
      );
    }
  });
});

/**
 * THE TABLE OF CONTENTS LANDS ON THE TITLE'S LINE (2026-09-06, Kushagra: "ToC needs to move
 * down too").
 *
 * The list is a SIBLING of the page, not a child, so it cannot read what `Page` declares — it
 * spends the same distance itself, in two places (resting, and pinned once the page travels).
 * Three copies of one rule, in two files, one of them in another package. That is the shape
 * this repo has a standing clause for: a mechanism with two implementations owes a law that
 * they AGREE.
 *
 * It reads the TERMS rather than the pixels, because this project is node-only and the
 * rendered result is the package's business (`page.browser.test.tsx` measures the title
 * against the band). What can go wrong here is a term being dropped from one copy and not the
 * others, which is exactly what happened twice before: `reach + pane inset` in both of these
 * rules while the page spent `reach − pane inset`, so the list sat sixteen pixels below the
 * title at rest and jumped sixteen back the first time the page moved.
 *
 * FALSIFIED: dropping `--layout-space-6` from either rule in prose.css fails, and so does
 * changing the page's own interval in the package without changing them.
 */
describe("the table of contents spends the page's own clearance (§46)", () => {
  const prose = readFileSync(join(docsRoot, "prose.css"), "utf8");
  const pageCss = readFileSync(
    fileURLToPath(new URL("../../../../packages/ui/src/components/page/page.css", import.meta.url)),
    "utf8",
  );

  /** The three terms, in order, however the declaration is wrapped across lines. */
  const terms = (block: string) =>
    (block.match(/var\(--[\w-]+(?:, 0px)?\)/g) ?? []).map((t) => t.replace(", 0px", ""));

  const declaration = (css: string, selector: string, property: string) => {
    const rule = css.slice(css.indexOf(selector));
    const body = rule.slice(rule.indexOf("{"), rule.indexOf("}"));
    const decl = body.slice(body.indexOf(`${property}:`));
    return decl.slice(0, decl.indexOf(";"));
  };

  it("the page states the reach, the pane inset it has already been given, and the interval", () => {
    const clearance = declaration(pageCss, ".kui-page {", "padding-block-start");
    expect(terms(clearance), "the page's clearance changed shape").toEqual([
      "var(--kui-pane-inset-block-start)",
      "var(--kui-sf-p)",
      "var(--layout-space-6)",
      "var(--layout-space-7)",
    ]);
  });

  for (const [selector, what] of [
    [".kd-toc-column {", "the list at rest"],
    [".kd-toc {", "the list once it is travelling"],
  ] as const) {
    it(`${what} spends the same three, so it lands on the title's line`, () => {
      const pinned = declaration(prose, selector, "inset-block-start");
      expect(terms(pinned), `${selector} drifted from the page's own clearance`).toEqual([
        "var(--kui-pane-inset-block-start)",
        "var(--kui-sf-p)",
        "var(--layout-space-6)",
      ]);
    });
  }
});
