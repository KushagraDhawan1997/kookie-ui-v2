/**
 * Shell node laws (§27) — what can be read off the shipped files without a browser.
 *
 * The mounted laws live in shell.browser.test.tsx; these pin the two seams that cross
 * files: the viewport boundary (shell.css and dialog.css are the two sheets sanctioned to key
 * on the viewport, §13/§18, the set is swept here, and each literal must be config's,
 * verbatim) and the token emission
 * (the designed pane defaults and the gap pick must be what config states — a hand edit to
 * the generated sheet fails the drift check, but a generator that silently stopped emitting
 * would not, which is the "did not run" way of not failing).
 */
import { describe, expect, it } from "vitest";

import { narrowMedia, shellGap, shellWidth } from "../../tokens/config.ts";
import { allStylesheets, block, raw, sheet } from "../../test/stylesheets.ts";

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

  it("the sanctioned set is CLOSED, and it is two sheets — not one (2026-08-26)", () => {
    // This file's own head comment read "the ONE stylesheet sanctioned to key on the viewport"
    // and DECISIONS §2 read "Only Shell and page-gutter concerns key off the viewport", and
    // both had been false since 2026-08-21: `dialog.css` opens `@media (max-width: 48rem)` for
    // the dialog-as-sheet, a decision DECISIONS records in full one section over. That is this
    // repo's own named defect class — an "exactly one X" claim that quietly became two — and
    // the reason it went unnoticed is the reason the class keeps recurring: each sheet pinned
    // its OWN query and nothing swept the package, so a second sheet keying on the viewport
    // was not a failure anywhere.
    //
    // Two claims, because either alone is half the law. The SET is closed, so a third sheet
    // keying on the viewport is a decision that has to be made rather than one that happens;
    // and every such query is config's boundary verbatim, so `narrowMedia` stays the one home
    // for the number even where a sheet spells it as a literal (CSS cannot var() a query).
    const sanctioned = ["components/shell/shell.css", "components/dialog/dialog.css"];
    const keyed = allStylesheets().filter((file) => /@media[^{]*\((?:max|min)-width:/.test(sheet(file)));
    expect(keyed.sort(), "a stylesheet keys on the viewport without being sanctioned").toEqual(
      sanctioned.sort(),
    );
    for (const file of keyed) {
      for (const query of sheet(file).match(/@media[^{]*\((?:max|min)-width:[^)]*\)/g) ?? []) {
        expect(query.replace(/\s+/g, " ").trim(), `${file} states its own boundary`).toBe(
          `@media ${narrowMedia}`,
        );
      }
    }
  });

  it("no other viewport query hides in the sheet — every @media is one of two sanctioned forms", () => {
    // The narrow block and the scrim's prefers-reduced-transparency (dialog.css's own pair).
    // Asserted as the exact SET rather than a count, because a count would let a new form ride
    // in by replacing one of these — which is how this law has earned itself twice already.
    //
    // It was THREE for three days. The nav row's `(hover: hover)` guard arrived 2026-08-20 with
    // the hover restoration and failed the old count of 2; it left again 2026-08-23 when Row
    // shipped and the family took the rule back, and it failed this law on the way out too.
    // Both directions are the law working: an @media in this sheet is a decision, and the sheet
    // has no business holding a hover rule now that the family has one home for it.
    const queries = (css.match(/@media[^{]+/g) ?? []).map((q) => q.replace(/\s+/g, " ").trim());
    expect(queries.sort()).toEqual(
      [`@media ${narrowMedia}`, "@media (prefers-reduced-transparency: reduce)"].sort(),
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
        /max-(inline|block)-size:\s*calc\(100% - var\(--touch-target-min\) - 2 \* var\(--kui-shell-outer\)\)/.test(
          arm,
        ),
        `an overlay arm has no viewport cap:\n${arm}`,
      ).toBe(true);
    }
  });

  it("EVERY overlay arm spans the frame — an out-of-flow item does not size its own track", () => {
    // The 2026-08-20 CRITICAL, pinned across the SET rather than at one pane (audit
    // 2026-08-26). An absolutely positioned grid item's containing block is its GRID AREA, and
    // an out-of-flow item does not size its own `auto` track — so the moment a pane leaves flow
    // its column collapses to zero, `100%` means nothing, and the drawer paints its borders and
    // nothing else (measured: rect 1px, clientWidth 0, at a 375px window).
    //
    // The mounted laws reach exactly ONE of the six arms: the agreement law walks
    // `.kui-shell-sidebar` and the cap laws mount the sidebar. Delete `grid-column: 1 / -1`
    // from the inspector's narrow arm and every phone loses its inspector with the browser
    // suite green — which is the half-applied shape the 2026-08-20 comment in shell.css warns
    // about, in the one direction nothing was watching. A node law reaches all six for free.
    //
    // Read per-AXIS, because a side pane and the bottom pane span opposite ways and asserting
    // "some span" would let either satisfy the other's arm (a law about one axis of a two-axis
    // mechanism is half a law).
    const arms = css
      .split("}")
      .filter((rule) =>
        /\.kui-shell-(rail|sidebar|inspector|bottom)(?![\w-])[^{]*\{[^{]*position:\s*absolute/.test(rule),
      );
    expect(arms.length, "the overlay arms are not where this law thinks").toBe(6);
    for (const arm of arms) {
      const axis = /\.kui-shell-bottom(?![\w-])/.test(arm) ? "row" : "column";
      expect(
        new RegExp(`grid-${axis}:\\s*1 / -1`).test(arm),
        `an overlay arm does not span the frame on its ${axis} axis:\n${arm}`,
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
    // started painting on its own account. ONE paint is sanctioned: the scrim's fill.
    //
    // IT WAS TWO, AND THE SECOND DIED ON SCHEDULE (2026-08-23). The nav row's hover
    // restoration was exempted here on 2026-08-20 with the exemption's own expiry written
    // beside it — "the third non-roving row promotes the restoration into recipes.css, and
    // this exemption dies with the promotion". Row is that third member, so the rule is
    // `.kui-row[data-hover-lit]:hover` in the shared layer and this sheet paints one thing
    // again. Removing the exemption is not tidying: while it stood, a hover rule in this file
    // was legal, and now none is.
    expect(css, "the nav row's private hover rule came back").not.toContain(
      ".kui-shell-nav-item:hover",
    );
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
