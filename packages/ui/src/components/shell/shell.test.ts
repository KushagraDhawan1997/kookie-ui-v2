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

  it("no other viewport query hides in the sheet — every @media is one of three sanctioned forms", () => {
    // The narrow block, the scrim's prefers-reduced-transparency (dialog.css's own pair),
    // and the nav row's `(hover: hover)` guard — a capability query, not a viewport one,
    // arrived 2026-08-20 with the hover restoration and failed the old count of 2, which is
    // this law doing its job: any @media appearing here is a decision, and a NEW one still
    // fails first. Asserted as the exact SET rather than a count, because a count of three
    // would let a fourth form ride in by replacing one of these.
    const queries = (css.match(/@media[^{]+/g) ?? []).map((q) => q.replace(/\s+/g, " ").trim());
    expect(queries.sort()).toEqual(
      [
        `@media ${narrowMedia}`,
        "@media (hover: hover)",
        "@media (prefers-reduced-transparency: reduce)",
      ].sort(),
    );
  });

  it("EVERY overlay arm caps its extent — the strip is not decoration (audit 2026-08-16)", () => {
    // An uncapped overlay is the whole window: measured at 320px the scrim rendered 0px wide
    // and, with the rest of the shell contained, there was no pointer route back at all. The
    // mounted laws prove two arms at two widths; this proves the SET, so a seventh arm added
    // tomorrow cannot ship uncapped. Derived from the rules themselves rather than a count:
    // every rule that positions a pane absolutely must also cap it.
    //
    // The member boundary is load-bearing (2026-08-20): the first spelling's `[^{]*` ate
    // `-item::after`, so the day the rail grew its anatomy this law seized the ITEM's target
    // expander — a §16 pseudo-element, not a pane, and one that must never carry a viewport
    // cap — and failed on its own calibration. The lookahead holds the set to the four PANES.
    const arms = css
      .split("}")
      .filter((rule) =>
        /\.kui-shell-(rail|sidebar|inspector|bottom)(?![\w-])[^{]*\{[^{]*position:\s*absolute/.test(rule),
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
    // started painting on its own account. TWO paints are sanctioned: the scrim's fill, and
    // the nav row's hover restoration (2026-08-20, the member that restores what the row
    // family stands down) — which must spend the CONTROL layer's own currency, the pin
    // below, so the exemption is the row's state paint re-keyed and can never quietly
    // become a bed. The third non-roving row promotes the restoration into recipes.css,
    // and this exemption dies with the promotion.
    expect(
      block(css, ".kui-shell-nav-item:hover:not([data-disabled])"),
      "the restored hover must spend the control layer's own currency",
    ).toContain("background-color: var(--kui-ct-fill-hover, var(--kui-ct-fill-src-hover))");
    // A THIRD AND FOURTH RULE ARE SANCTIONED (2026-08-21), and they are the opposite of a
    // paint: a flush pane stands the surface's own lighting DOWN (`background-image: none`,
    // stated as the property because `--kui-sf-light` is not registered `inherits: false` and
    // the hook would strip the rim off every card inside the pane), and a drawer hands it
    // BACK by re-pointing at that same hook. The guarantee this law exists for is that the
    // shell never paints on its own account, so the exemption is bounded by VALUE rather than
    // by selector: neither rule may name a colour, and the only values they may carry are
    // `none` and the surface layer's own hook. A bed cannot hide inside that.
    const standDowns = [
      /\.kui-shell-pane\[data-flush\]\s*\{[^}]*\}/g,
      /\.kui-shell-pane\[data-flush\]\[data-presentation="(?:overlay|auto)"\]\s*\{[^}]*\}/g,
    ];
    for (const re of standDowns) {
      for (const rule of css.match(re) ?? []) {
        for (const decl of rule.match(/background[^;]*/g) ?? []) {
          expect(decl, "a stand-down may not paint").toMatch(
            /^background-image:\s*(none|var\(--kui-sf-light\))$/,
          );
        }
      }
    }
    const sanctioned = css
      .replace(/\.kui-shell-scrim\s*\{[^}]*\}/g, " ")
      .replace(/\.kui-shell-nav-item:hover[^{]*\{[^}]*\}/g, " ")
      .replace(standDowns[0]!, " ")
      .replace(standDowns[1]!, " ");
    expect(sanctioned).not.toMatch(/background/);
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
    // The vacuity guard: an empty set satisfies the equality above. Was 5 until
    // `--shell-nav-inset` was deleted 2026-08-21 — the pane's own padding is that air now.
    expect(consumed.size).toBeGreaterThanOrEqual(4);
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
