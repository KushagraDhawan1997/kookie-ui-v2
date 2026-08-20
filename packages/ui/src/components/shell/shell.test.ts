/**
 * Shell node laws (§27) — what can be read off the shipped files without a browser.
 *
 * The mounted laws live in shell.browser.test.tsx; these pin the two seams that cross
 * files: the viewport boundary (shell.css is the ONE component sheet sanctioned to key on
 * the viewport, §13/§18, and its literal must be config's, verbatim) and the token emission
 * (the designed pane defaults and the gap pick must be what config states — a hand edit to
 * the generated sheet fails the drift check, but a generator that silently stopped emitting
 * would not, which is the "did not run" way of not failing).
 */
import { describe, expect, it } from "vitest";

import { narrowMedia, shellGap, shellWidth } from "../../tokens/config.ts";
import { block, raw, sheet } from "../../test/stylesheets.ts";

describe("the shell's viewport boundary is config's, verbatim (§18, §27)", () => {
  const css = sheet("components/shell/shell.css");

  it("the one width query is the narrow boundary — derived here, so a respelled literal fails", () => {
    // CSS cannot var() a media query, so the boundary is a literal in the sheet; this law is
    // what keeps that literal from being a second home. One occurrence: every narrow-window
    // rule lives in the single media block.
    const queries = css.match(/@media\s*\(max-width:[^)]*\)/g) ?? [];
    expect(queries).toHaveLength(1);
    expect(queries[0]!.replace(/\s+/g, " ")).toBe(`@media ${narrowMedia}`);
  });

  it("no other viewport query hides in the sheet — the boundary, and one a11y preference, is all", () => {
    // The narrow block plus prefers-reduced-transparency (the scrim's, dialog.css's own
    // pair). A third @media appearing is a decision, and it fails here first.
    expect(css.match(/@media/g) ?? []).toHaveLength(2);
    expect(css).toContain("@media (prefers-reduced-transparency: reduce)");
  });

  it("EVERY overlay arm caps its extent — the strip is not decoration (audit 2026-08-16)", () => {
    // An uncapped overlay is the whole window: measured at 320px the scrim rendered 0px wide
    // and, with the rest of the shell contained, there was no pointer route back at all. The
    // mounted laws prove two arms at two widths; this proves the SET, so a seventh arm added
    // tomorrow cannot ship uncapped. Derived from the rules themselves rather than a count:
    // every rule that positions a pane absolutely must also cap it.
    const arms = css
      .split("}")
      .filter((rule) => /\.kui-shell-(rail|sidebar|inspector|bottom)[^{]*\{[^{]*position:\s*absolute/.test(rule));
    expect(arms.length, "the overlay arms are not where this law thinks").toBe(6);
    for (const arm of arms) {
      expect(
        /max-(inline|block)-size:\s*calc\(100% - var\(--touch-target-min\)\)/.test(arm),
        `an overlay arm has no viewport cap:\n${arm}`,
      ).toBe(true);
    }
  });

  it("the pane extents do not inherit — the --kui-h trap, one family over (§12)", () => {
    // A custom property inherits by default, so a sidebar carrying --kui-shell-w handed that
    // width to every descendant, and a Shell composed inside a pane sized its own panes from
    // the outer pane's prop. Registration is what makes each rule's fallback reachable.
    // Read through the loud extractor, bounded to the registration's OWN body. The first
    // spelling took a 120-character window from the start of each block, which spans into the
    // next one — so the sabotage that flipped `--kui-shell-w` to `inherits: true` passed,
    // because the window found `--kui-shell-h`'s `false` and reported it as the subject's.
    // The repo's own commonest law defect (measuring the axis that was already right),
    // committed inside the law written to catch it, and caught by its own sabotage pass.
    for (const name of ["--kui-shell-w", "--kui-shell-h"]) {
      expect(block(css, `@property ${name}`), `${name} inherits`).toContain("inherits: false");
    }
  });

  it("the shell paints no bed, casts nothing, and moves nothing — the absences ARE the design (§27)", () => {
    // Panes are surfaces: fill, edge, depth and material all arrive from surfaces.css. A
    // background, box-shadow or transition appearing in this sheet means the shell has
    // started painting on its own account. The scrim's fill is the one sanctioned paint.
    const withoutScrim = css.replace(/\.kui-shell-scrim\s*\{[^}]*\}/g, " ");
    expect(withoutScrim).not.toMatch(/background/);
    expect(css).not.toMatch(/box-shadow/);
    expect(css).not.toMatch(/[^-\w]transition\s*:/);
  });
});

describe("the shell tokens are emitted from config (§27)", () => {
  const tokens = raw("tokens/tokens.css");

  it("the pane defaults ride --scale, straight from shellWidth", () => {
    expect(tokens).toContain(`--shell-rail-w: calc(${shellWidth.rail}px * var(--scale));`);
    expect(tokens).toContain(`--shell-sidebar-w: calc(${shellWidth.sidebar}px * var(--scale));`);
    expect(tokens).toContain(`--shell-inspector-w: calc(${shellWidth.inspector}px * var(--scale));`);
    expect(tokens).toContain(`--shell-bottom-h: calc(${shellWidth.bottom}px * var(--scale));`);
  });

  it("the gap is ONE layout-space pick, re-declared per density scope (the substitution trap)", () => {
    // A var() bakes where it is declared (§6): a :root-only --shell-gap would carry the
    // default rhythm into a compact subtree. :root plus the three density scopes = four
    // declarations, all spelling the same pick.
    const declarations = tokens.match(/--shell-gap:[^;]+;/g) ?? [];
    expect(declarations).toHaveLength(4);
    for (const decl of declarations) {
      expect(decl).toBe(`--shell-gap: var(--layout-space-${shellGap});`);
    }
  });

  it("the stylesheet consumes exactly the names the generator emits — both directions", () => {
    // The dangling-var lesson (2026-08-14): a renamed token leaves a var() resolving to
    // nothing and the declaration silently disarmed. Every --shell-* the sheet reads must be
    // emitted, and every one emitted must be read — an orphaned token is a decision nobody
    // is consuming.
    const css = sheet("components/shell/shell.css");
    const consumed = new Set(css.match(/--shell-[a-z0-9-]+/g) ?? []);
    const emitted = new Set(tokens.match(/--shell-[a-z0-9-]+(?=:)/g) ?? []);
    expect([...consumed].sort()).toEqual([...emitted].sort());
    expect(consumed.size).toBeGreaterThanOrEqual(5);
  });
});
