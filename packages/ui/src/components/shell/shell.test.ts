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
    // THREE since 2026-09-05, and the third is a REFUSAL of the second's rule rather than a new
    // use of the mechanism: `command.css` opens the same query to state that a palette is NOT a
    // sheet. A dialog-as-sheet grows from a fixed bottom edge, and a palette's height is its
    // results, so bottom-pinning moves the field on every keystroke (§44). Adding it here is the
    // decision this law exists to force — the alternative was a silent third consumer.
    const sanctioned = [
      "components/shell/shell.css",
      "components/dialog/dialog.css",
      "components/command/command.css",
    ];
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
    //
    // IT IS FOUR SINCE 2026-09-01, and both new forms arrived with the resize handle, which is
    // the first thing this sheet draws that a person operates. `(hover: hover)` is REQUIRED of
    // it by the recipes law — an unguarded `:hover` sticks after a tap on a touch screen — and
    // `(prefers-reduced-motion: reduce)` is required by §8's stand-down law, because the
    // handle's line fades in. Two laws in other files oblige these two blocks, so the choice
    // here is not whether to allow them but whether the handle should draw at all; it should,
    // and the alternative (a boundary visible at rest) draws a second line beside the seam
    // hairline that already marks it.
    // The FORMS, deduplicated (2026-09-06): the drawer's own stand-down is a second
    // `prefers-reduced-motion` block, declared beside the rules it stands down rather than
    // bolted onto the handle's — which is §8's own doctrine after the 2026-08-10 finding, and
    // the reason this law asks which queries exist rather than how many.
    const queries = [
      ...new Set((css.match(/@media[^{]+/g) ?? []).map((q) => q.replace(/\s+/g, " ").trim())),
    ];
    expect(queries.sort()).toEqual(
      [
        `@media ${narrowMedia}`,
        "@media (prefers-reduced-transparency: reduce)",
        "@media (hover: hover)",
        "@media (prefers-reduced-motion: reduce)",
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
        /\.kui-shell-(rail|sidebar|inspector|bottom)(?![\w-])[^{>]*\{[^{]*position:\s*absolute/.test(rule),
      );
    // `[^{>]` rather than `[^{]` since 2026-09-09: a child combinator after the pane means the
    // rule is about something INSIDE it, and the tab bar's thumb is absolutely positioned in
    // exactly that shape. The lookahead already held the set to the four panes against
    // `-item::after`; this holds it against `> .kui-shell-rail-thumb`, which is the same
    // mistake one combinator over.
    //
    // SEVEN ARMS SINCE 2026-09-09, and the seventh is exempt from the cap BY DESIGN (§27): a
    // tab bar spans the window's width on purpose, and it is not a thing you dismiss, so there
    // is no strip of scrim it has to leave. Partitioned rather than counted around, so the
    // exemption is one named arm and a drawer added tomorrow still cannot ship uncapped.
    expect(arms.length, "the overlay arms are not where this law thinks").toBe(7);
    const bar = arms.filter((arm) => arm.includes('[data-presentation="bar"]'));
    expect(bar.length, "the tab bar's arm is not where this law thinks").toBe(1);
    expect(
      /max-(inline|block)-size/.test(bar[0]!),
      "the tab bar took a viewport cap — it spans the window, and capping it would inset one edge only",
    ).toBe(false);
    for (const arm of arms.filter((a) => !a.includes('[data-presentation="bar"]'))) {
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
        /\.kui-shell-(rail|sidebar|inspector|bottom)(?![\w-])[^{>]*\{[^{]*position:\s*absolute/.test(rule),
      );
    // Seven since 2026-09-09 — the tab bar leaves flow too, and it spans for the same reason
    // every other arm does: an out-of-flow grid item does not size its own `auto` track, so a
    // bar that claimed only the rail's column would be as wide as a rail.
    expect(arms.length, "the overlay arms are not where this law thinks").toBe(7);
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
    // `none`, `transparent` and the surface layer's own hooks. A bed cannot hide inside that.
    //
    // THE FILL JOINED THE PAIR ON 2026-09-05 and the bound did not move an inch. It used to be
    // said with the custom property (`--kui-sf-fill: transparent` on flush, `initial` on the
    // drawer), which this law never inspected because it reads declarations beginning
    // `background` — and that spelling was the defect: `--kui-sf-fill` is the name a material
    // declares its veil on, so standing it down deleted the veil and `initial` fell through to
    // the opaque `--kui-sf-fill-src`, painting every glass drawer white. Both halves are
    // properties now, so both come under this law for the first time, and the two values they
    // may carry are the ABSENCE and surfaces.css's own chain verbatim. A literal still cannot
    // get through, which is the only thing this arm has ever promised.
    /* A SIXTH IS SANCTIONED (2026-09-06): the WELL, the ground a receding frame goes back
       into. It is a paint, and it is the first one in this sheet that is not a stand-down — so
       it is bounded the way the handle is, by VALUE: the `::before` may name exactly one
       colour and it is the scrim's own token, which is the same statement ("the app is behind
       this") made by the surface the app is no longer covering. A bed cannot hide inside that,
       because a bed would have to be a colour the scrim family does not own. */
    const well = css.match(/\.kui-shell::before\s*\{[^}]*\}/g) ?? [];
    expect(well.length, "the well's rule vanished — this arm reads nothing").toBe(1);
    for (const decl of well[0]!.match(/background-color\s*:[^;]*/g) ?? []) {
      expect(decl.trim(), "the well may not name a colour of its own").toMatch(
        /^background-color:\s*(transparent|var\(--scrim-well\))$/,
      );
    }

    const standDowns = [
      /\.kui-shell-pane\[data-flush\]\s*\{[^}]*\}/g,
      // The SHEET's, since 2026-09-09: the flush stand-down is right for a pane level with the
      // page and wrong for one over it, and the exception narrowed to the pane it is true of
      // when the side panes started pushing the frame instead of covering it.
      /\.kui-shell-bottom\[data-flush\]\[data-presentation="(?:overlay|auto)"\]\s*\{[^}]*\}/g,
    ];
    for (const re of standDowns) {
      for (const rule of css.match(re) ?? []) {
        for (const decl of rule.match(/background[^;]*/g) ?? []) {
          expect(decl, "a stand-down may not paint").toMatch(
            /^(background-image:\s*(none|var\(--kui-sf-light\))|background-color:\s*(transparent|var\(--kui-sf-fill, var\(--kui-sf-fill-src\)\)))$/,
          );
        }
      }
    }
    // A FIFTH IS SANCTIONED (2026-09-01): the resize handle. It is the first thing this sheet
    // draws that a person operates, and a boundary that paints nothing at all cannot be found.
    // Bounded by VALUE exactly as the stand-downs are — it may name no colour, only `none` and
    // the tone indirection under the accent it stamps, and its one clock must ride the motion
    // tokens. A bed cannot hide inside that, and neither can a cast: `box-shadow` stays banned
    // outright, so the handle has no way to become a raised strip.
    const handleRules = css.match(/\.kui-shell-resize[^{]*\{[^}]*\}/g) ?? [];
    expect(handleRules.length, "the handle's rules vanished — this arm reads nothing").toBeGreaterThan(3);
    for (const rule of handleRules) {
      // EVERY colour-bearing property, not just `background` (audit 2026-09-02). The first
      // spelling inspected declarations whose property starts with `background`, so the stated
      // bound — "it may name no colour" — did not bind: a `color`, a `border-color`, a `fill`
      // or an `outline` could carry any literal past it. The handle's own focus ring is the
      // proof the property list has to be wider than one word.
      for (const decl of rule.match(/(?:background|border[a-z-]*color|outline[a-z-]*|[^-\w]color|fill)\s*:[^;]*/g) ?? []) {
        expect(decl.trim().replace(/^[^a-z]/, ""), "the handle may not name a colour of its own").toMatch(
          /^(background:\s*(none|var\(--tone-solid\))|outline(-offset)?:\s*var\(--focus-ring[a-z-]*\)(\s+solid\s+var\(--focus-ring\))?)$/,
        );
      }
      for (const decl of rule.match(/[^-\w]transition\s*:[^;]*/g) ?? []) {
        expect(decl.trim(), "the handle has one clock, riding the motion tokens, plus its stillness stand-down").toMatch(
          /^transition:\s*(opacity var\(--motion-duration\) var\(--motion-easing\)|none)$/,
        );
      }
    }
    /* A SEVENTH IS SANCTIONED (2026-09-06): the frame's own PLANE while it recedes. It is the
       flush rule one level up — a box level with the page is not a plane, and the frame stops
       being level with the page the instant it starts receding — so for the length of a
       drawer's life the frame carries the seal and the well shows only in the ring. Without it
       a flush frame showed the well straight through every pane and the app disappeared.

       It lives on `::after` rather than on the root, and that is not a spelling: the root
       isolates, so a `z-index: -1` pseudo paints ABOVE its parent's background. Two pseudos at
       one negative layer settle it by order instead. Bounded by VALUE like every other paint
       here — the plane may name exactly one colour and it is the seal — and by the SHAPE, so
       the arm cannot quietly move back onto the root where it does not work. */
    const planeRe = /\.kui-shell(?::has\(> \.kui-shell-bottom\[data-state="open"\]\[data-presentation="(?:overlay|auto)"\]\))?::after\s*\{[^}]*\}/g;
    const plane = css.match(planeRe) ?? [];
    expect(plane.length, "the frame's plane vanished — this arm reads nothing").toBe(3);
    for (const rule of plane) {
      for (const decl of rule.match(/background-color\s*:[^;]*/g) ?? []) {
        expect(decl.trim(), "the frame's plane may not name a colour of its own").toMatch(
          /^background-color:\s*(transparent|var\(--color-surface\))$/,
        );
      }
    }
    const recedingRoot = css.match(/\.kui-shell:has\(> \.kui-shell-bottom\[data-state="open"\]\[data-presentation="(?:overlay|auto)"\]\)\s*\{[^}]*\}/g) ?? [];
    expect(recedingRoot.length, "the recession's own rules vanished").toBe(2);
    for (const rule of recedingRoot) {
      expect(rule, "the plane moved back onto the root, where the well paints over it").not.toMatch(
        /background/,
      );
    }

    const sanctioned = css
      .replace(planeRe, " ")
      .replace(/\.kui-shell-scrim\s*\{[^}]*\}/g, " ")
      // The well and its one lit arm — bounded by value directly above.
      .replace(/\.kui-shell[^{]*::before\s*\{[^}]*\}/g, " ")
      .replace(/\.kui-shell-nav-item:hover[^{]*\{[^}]*\}/g, " ")
      .replace(/\.kui-shell-resize[^{]*\{[^}]*\}/g, " ")
      // The tab bar's thumb (2026-09-09), bounded by value the way the well and the plane are:
      // it may name the neutral soft rung and nothing else. Its glass currency is the shared
      // layer's, beside the segmented control's, and surfaces.test.ts reads it there.
      .replace(/\.kui-shell-rail\[data-presentation="bar"\] > \.kui-shell-rail-thumb\s*\{[^}]*\}/g, (rule) => {
        for (const decl of rule.match(/background[^;]*/g) ?? []) {
          expect(decl.trim(), "the bar's thumb may not name a colour of its own").toBe(
            "background-color: var(--tone-soft)",
          );
        }
        return " ";
      })
      .replace(standDowns[0]!, " ")
      .replace(standDowns[1]!, " ");
    expect(sanctioned).not.toMatch(/background/);
    expect(css).not.toMatch(/box-shadow/);
    // THE TRANSITION BAN STAYS ON THE WHOLE SHEET MINUS THE HANDLE (audit 2026-09-02). Moving
    // it to `sanctioned` — which also strips the scrim, the nav row and both flush stand-downs
    // — widened it far past the one rule that needed the exemption, so the shell could have
    // animated its scrim with the suite green. `sanctioned` is the right corpus for
    // `background`, because each of those rules is a sanctioned PAINT; it is the wrong corpus
    // for a clock, because none of them is a sanctioned clock.
    /* THE SHELL MOVES ONE THING SINCE 2026-09-06, and the ban becomes a BOUND rather than an
       absence. §27 had recorded the exit in writing — "the spring entry is the recorded
       follow-up, and a node law asserts the absence" — and the drawer is it: the pane slides,
       the frame recedes under it, and the well and the scrim take the frame's inverse.

       Bounded by VALUE, exactly as the handle's clock is, and by three separate readers rather
       than by this list: every duration must resolve to a motion token and every geometry
       channel to a spring (recipes.test.ts), and every clock declared here must be stood down
       under reduced motion (the same file). What this arm keeps is the part those cannot see —
       WHICH rules in this sheet are allowed to carry a clock at all, so a scrim that started
       fading on its own account, or a pane that gained a hover travel, still fails here. */
    const clocked = [
      /\.kui-shell-resize[^{]*\{[^}]*\}/g,
      /\.kui-shell\s*\{[^}]*\}/g,
      /\.kui-shell[^{]*::before\s*\{[^}]*\}/g,
      /\.kui-shell::after\s*\{[^}]*\}/g,
      /\.kui-shell-scrim\s*\{[^}]*\}/g,
      /\.kui-shell-pane\[data-presentation="(?:overlay|auto)"\]\s*\{[^}]*\}/g,
      // The live arm, both spellings: it carries the frame's recession AND the clip that stops
      // (2026-09-06) — one `transition` per element, so the two channels cannot reset each
      // other, which is what the first spelling did.
      /\.kui-shell:has\(> \.kui-shell-bottom\[data-state="open"\]\[data-presentation="(?:overlay|auto)"\]\)\s*\{[^}]*\}/g,
      // THE PUSH (2026-09-09): a side pane slides the whole frame rather than covering it, so
      // the frame's children carry the travel — the pane itself is excluded, since the open one
      // slides the same distance on the same clock and a parked one is off the frame either way.
      /:where\(\.kui-shell > :not\(\.kui-shell-rail\[data-presentation="auto"\]\)[^{]*\)\s*\{[^}]*\}/g,
      // And the tab bar's thumb, both direction arms — the travelling grip, self-keyed from the
      // segmented control, whose lead and trail clocks are the asymmetry.
      /\.kui-shell-rail\[data-presentation="bar"\] > \.kui-shell-rail-thumb\[data-activation-direction="(?:right|left)"\]\s*\{[^}]*\}/g,
      /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\s*\}\n\s*\}/g,
    ];
    const unclocked = clocked.reduce((acc, re) => acc.replace(re, " "), css);
    expect(unclocked, "a rule in this sheet moves that was not licensed to").not.toMatch(
      /[^-\w]transition\s*:/,
    );
    // And the licence is not a blank one: each of those rules must really be there, or this
    // arm is a list of holes rather than a list of exemptions.
    for (const re of clocked) expect(css.match(re)?.length ?? 0, String(re)).toBeGreaterThan(0);
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


describe("the band's fade is handed over only where a band floats (§27, 2026-09-06)", () => {
  /* THE BROWSER CANNOT SEE THIS HALF. An unset custom property probes as `0px`, which is exactly
     what a shell handing the scroller a fade of NOTHING would probe as, and the mask that would
     tell them apart serializes identically until Base UI's own scroll pass has written the
     overflow distances — a frame-timing read, which this repo does not run on CI. The guarantee
     is a property of the SELECTOR, so it is read there. */
  const css = sheet("components/shell/shell.css");

  it("both fade rules are scoped to a floating band", () => {
    for (const edge of ["header", "footer"] as const) {
      const start = css.indexOf(`.kui-shell-pane:has(> .kui-pane-${edge}[data-float]) > .kui-shell-scroll`);
      expect(start, `no fade rule keyed on a floating ${edge}`).toBeGreaterThan(-1);
      const body = css.slice(start, css.indexOf("}", start));
      expect(body).toContain("--kui-sa-fade-");
    }
    // And those are the ONLY two: a third rule handing it over unconditionally would make the
    // designed value unreachable for every pane in the package. Counted rather than pattern-
    // matched — the obvious negative regex matched the scoped rules themselves, because the
    // character before the scroller in `…[data-float]) > .kui-shell-scroll` is a `>`.
    // THREE SINCE 2026-09-09, and the third is the tab bar's: the work area scrolls under a
    // floating bar exactly as it scrolls under a floating band, so it takes the bar's published
    // reach as its fade. Scoped like the other two — to a shell that HAS a bar, and to the
    // content pane's own direct scroller — which is what the count is here to keep true.
    expect(css.match(/--kui-sa-fade-/g) ?? []).toHaveLength(3);
    const bar = css.indexOf(
      '.kui-shell:has(> .kui-shell-rail[data-presentation="bar"]) > .kui-shell-content > .kui-shell-scroll',
    );
    expect(bar, "no fade rule keyed on a tab bar").toBeGreaterThan(-1);
    expect(css.slice(bar, css.indexOf("}", bar))).toContain("--kui-sa-fade-end");
  });
});
