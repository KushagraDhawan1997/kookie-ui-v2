/**
 * Shell node laws (§26) — what can be read off the shipped files without a browser.
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
import { raw, sheet } from "../../test/stylesheets.ts";

describe("the shell's viewport boundary is config's, verbatim (§18, §26)", () => {
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

  it("the shell paints no bed, casts nothing, and moves nothing — the absences ARE the design (§26)", () => {
    // Panes are surfaces: fill, edge, depth and material all arrive from surfaces.css. A
    // background, box-shadow or transition appearing in this sheet means the shell has
    // started painting on its own account. The scrim's fill is the one sanctioned paint.
    const withoutScrim = css.replace(/\.kui-shell-scrim\s*\{[^}]*\}/g, " ");
    expect(withoutScrim).not.toMatch(/background/);
    expect(css).not.toMatch(/box-shadow/);
    expect(css).not.toMatch(/[^-\w]transition\s*:/);
  });
});

describe("the shell tokens are emitted from config (§26)", () => {
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
