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

  it("no other viewport query hides in the sheet — the boundary, and two guards, is all", () => {
    // The narrow block, prefers-reduced-transparency (the scrim's, dialog.css's own pair) and
    // the pointer guard every hover in this system lives inside. A FOURTH appearing is a
    // decision, and it fails here first.
    //
    // It said two until 2026-08-20 and had been failing since the nav row's hover shipped
    // hours earlier — the law aged, not the sheet. Both survivors are named rather than
    // counted now, so a query swapped for another cannot keep the count and change the claim.
    expect(css.match(/@media/g) ?? []).toHaveLength(3);
    expect(css).toContain("@media (prefers-reduced-transparency: reduce)");
    expect(css).toContain("@media (hover: hover)");
  });

  it("EVERY overlay arm caps its extent — the strip is not decoration (audit 2026-08-16)", () => {
    // An uncapped overlay is the whole window: measured at 320px the scrim rendered 0px wide
    // and, with the rest of the shell contained, there was no pointer route back at all. The
    // mounted laws prove two arms at two widths; this proves the SET, so a seventh arm added
    // tomorrow cannot ship uncapped. Derived from the rules themselves rather than a count:
    // every rule that positions a pane absolutely must also cap it.
    //
    // The class name is bounded (2026-08-20): without `(?![-\w])` the filter also caught
    // `.kui-shell-rail-item::after` — the target expander, which is absolutely positioned and
    // is not an overlay arm at all — so the law counted seven and failed, and updating the
    // count would then have demanded a viewport cap on a press target. The count assertion is
    // the tripwire that made a law defect look like a code defect, which is the job.
    const arms = css
      .split("}")
      .filter((rule) =>
        /\.kui-shell-(rail|sidebar|inspector|bottom)(?![-\w])[^{]*\{[^{]*position:\s*absolute/.test(rule),
      );
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
    //
    // TWO sanctioned paints, not one (2026-08-20): the scrim's fill, and the nav row's hover.
    // The row restates hover because §21 stands it down for a ROVING highlight and a sidebar
    // has no roving highlight at all — without it the row is dead under the pointer, measured.
    // What this law owes that rule is that it reaches for the control layer's own fill rather
    // than naming a colour, which is the thing "the shell paints nothing" was protecting.
    const hoverPaint = /background-color:\s*var\(--kui-ct-fill-hover, var\(--kui-ct-fill-src-hover\)\);/;
    expect(css, "the nav row's hover paint is not where this law thinks").toMatch(hoverPaint);
    const withoutScrim = css
      .replace(/\.kui-shell-scrim\s*\{[^}]*\}/g, " ")
      .replace(hoverPaint, " ");
    expect(withoutScrim).not.toMatch(/background/);
    expect(css).not.toMatch(/box-shadow/);
    expect(css).not.toMatch(/[^-\w]transition\s*:/);
  });
});

describe("the shell tokens are emitted from config (§27)", () => {
  const tokens = raw("tokens/tokens.css");

  it("the RAIL has no width token at all — its extent is its item's (§27, 2026-08-20)", () => {
    // The absence IS the decision, so it is asserted rather than left to be noticed. A rail's
    // width is its square plus the air around it; re-introducing a designed number is how it
    // stops answering the size it is given.
    expect(tokens).not.toContain("--shell-rail-w");
    expect(sheet("components/shell/shell.css")).not.toContain("--shell-rail-w");
  });

  it("the pane defaults ride --scale, straight from shellWidth", () => {
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

  it("the deleted root axis leaves NO trace — posture is a pane's own fact (§27, 2026-08-20)", () => {
    // The shape the look axis's deletion earned (2026-08-20): a value left reachable in the
    // stylesheet is a value every call site can re-introduce, and here it would be worse than
    // dead — `data-panes` named the ROOT as the owner of a fact that is now per pane and
    // partly derived, so a surviving rule would silently outrank the derivation. The comment
    // strip matters, and `sheet()` already does it: shell.css's own prose quotes the old
    // spelling to explain what it replaced, so a raw read would pass on the documentation.
    const css = sheet("components/shell/shell.css");
    expect(css).not.toContain("data-panes");
    // And the fact it was replaced with is really keyed on the pane, not re-centralised.
    expect(css).toContain(".kui-shell-pane[data-flush]");
    expect(css).toContain(".kui-shell-pane:not([data-flush])");
  });
});
