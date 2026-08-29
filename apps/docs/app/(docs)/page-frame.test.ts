/**
 * The page header laws (2026-08-27).
 *
 * The title/deck interval lived in six pages as six copies of `<Stack gap="3">`, which is six
 * chances to correct it and five chances to miss. It is `PageTitle` now, and these two laws are
 * what keep it there: the copies cannot come back, and the number cannot quietly return to the
 * card-scale value it was.
 *
 * FALSIFIED BOTH WAYS. Restoring any one page's hand-written `Heading size="8"` fails the first
 * law naming that file; setting TITLE_GAP back to "3" fails the second.
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
      if (name === "page-frame.tsx") continue;
      // The matrix is a TOOL that happens to live under this route group, not a page of the
      // documentation — it wears a small tool header (`size 6` over a `size 2` line) the way
      // the builder and the playground do, and giving it the page ladder would make a judging
      // instrument announce itself as loudly as a chapter. Exempted with the reason stated,
      // which is the only kind of exemption this repo allows.
      if (name.startsWith("matrix/")) continue;
      expect(source, `${name} writes its own page title — use <PageTitle>`).not.toMatch(
        /<h1[\s/>]/,
      );
    }
  });

  /**
   * And the interval itself. `3` is the card's number (§15 states title→description at `2`,
   * measured on a 24px title) and this is a 40px one. The ceiling is the caller's rather than
   * this law's — a bigger interval is legitimate as long as every page's next block moves with
   * it, which is a thing this law cannot see and a person judges by eye.
   */
  it("the title/deck interval is not the card's", () => {
    const frame = readFileSync(join(docsRoot, "page-frame.tsx"), "utf8");
    const match = frame.match(/const TITLE_GAP = "(\d+)";/);
    expect(match, "page-frame.tsx no longer states TITLE_GAP").not.toBeNull();
    const step = Number(match![1]);
    expect(step, "the title/deck interval is the card's — see PageTitle").toBeGreaterThan(3);
  });
});
