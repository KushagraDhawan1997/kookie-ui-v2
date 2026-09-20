/**
 * NOTHING MOVES (2026-09-20).
 *
 * The motion system was removed whole on Kushagra's call — *"Motion needs to be done properly,
 * what we have is not proper… lets go back to instant changes"* — and the record of what was
 * removed is `docs/archive/motion-v1.md`. Every state change in this package is now instant: no
 * transition on any stylesheet, no entry or exit animation, no geometry that answers a pointer.
 * A hovered control changes colour on the frame it is hovered and its box does not move.
 *
 * BOTH HALVES OF THAT SENTENCE ARE READ HERE, and for one day only the first was (audit
 * 2026-09-20). "No clock" and "nothing to put on a clock" are different claims, and a control
 * that jumps a pixel under the pointer with no transition satisfies the first completely.
 *
 * WHY THIS IS A STRUCTURAL LAW RATHER THAN A HABIT. Thirteen agents took motion out of fifty-odd
 * stylesheets in one day, and 231 laws went with the mechanisms they tested. What is left is an
 * absence, and an absence is the one kind of guarantee that no component law can hold: there is
 * nothing to mount, nothing to compute, nothing to read. The next `transition: opacity 120ms` —
 * added in good faith, to soften one thing — would ship with the whole suite green. So the claim
 * is made where a claim about "all of them" can be true tomorrow: over the WALK (audit D14),
 * never over a hand-written file list.
 *
 * THE ALLOWLIST IS THREE LOOPS, AND THE CRITERION IS THAT EACH ONE *IS* THE CONTENT.
 *
 *   - `kui-spin` (spinner.css) — a busy indicator that stops moving is information lost.
 *   - `kui-progress-sweep` (progress.css) — an indeterminate bar's whole message is "still going".
 *   - `kui-attachment-sweep` (attachment.css) — the same sentence, for an upload.
 *
 * None of the three eases a state CHANGE, which is what §8 governed and what was deleted. That
 * distinction is also why these three are the only things in the package that answer
 * `prefers-reduced-motion`, and why each one SLOWS rather than stopping: a loop that freezes has
 * stopped saying the thing it exists to say. Nothing else answers that preference, because
 * nothing else has anything to stand down.
 *
 * REBUILDING MOTION STARTS BY DELETING THIS LAW, DELIBERATELY. That is the point of writing it
 * as one file rather than as clauses scattered through the component laws: when motion is done
 * properly it will arrive as a designed system with its own laws, and the first commit of that
 * work removes this one and says so. What this law forbids is motion arriving by accident, one
 * well-meant softening at a time, with nothing anywhere to notice.
 */
import { describe, expect, it } from "vitest";

import { allStylesheets, raw, sheet, walkFiles } from "../test/stylesheets.ts";

/** Every stylesheet that ships, INCLUDING the two generated ones. `allStylesheets()` leaves
    those out because they are where literals and palette references legitimately bottom out —
    which is an argument about VALUES and has nothing to say about a transition, so both are
    scanned here like any other sheet. */
const SHEETS = [...allStylesheets(), "tokens/tokens.css", "system/layout.css"];

/** The three content loops, by the file that owns each one. Everything below is stated against
    this map, so widening the allowlist is one edit in one place — and an edit that has to name
    a file and a keyframe, which is harder to make absent-mindedly than adding a declaration. */
const CONTENT_LOOPS: Record<string, string> = {
  "components/spinner/spinner.css": "kui-spin",
  "components/progress/progress.css": "kui-progress-sweep",
  "components/attachment/attachment.css": "kui-attachment-sweep",
};

/**
 * A declaration of one of the transition properties — anchored on the start of a declaration,
 * so a custom property whose NAME contains the word (`--kui-ct-transition`) is not a match and
 * a real `transition-duration: 0s` is.
 *
 * THE PREFIX ARM AND THE `i` FLAG ARE BOTH LOAD-BEARING, and neither was here first (audit
 * 2026-09-20, four sabotages that each shipped motion past this law with the suite green).
 * The anchor takes `^`, `{`, `;` or whitespace, and the character before `-webkit-transition`
 * is a `-`, which is none of them; CSS property names are ASCII case-insensitive, so
 * `TRANSITION:` is a real declaration this regex could not see. Both spellings SURVIVE
 * Lightning CSS at this repo's own targets — the prefixed one ships verbatim, the uppercase
 * one is normalised to canonical `transition:` — so both reach a consumer's page. The prefix
 * arm is non-capturing, which keeps `found[1]` the property name the failure message prints.
 */
const TRANSITION =
  /(?:^|[{;\s])(?:-[a-z]+-)?(transition(?:-property|-duration|-timing-function|-delay|-behavior)?)\s*:/i;

/** Any animation declaration, same anchoring, same two arms. */
const ANIMATION = /(?:^|[{;\s])(?:-[a-z]+-)?(animation(?:-[a-z-]+)?)\s*:/i;

/** A keyframe definition, prefixed or not. `@-webkit-keyframes` defines a real, runnable loop
    in the pinned engine, so a sheet that smuggled one into the allowlist would otherwise
    satisfy `toEqual([loop])` while running two. */
const KEYFRAMES = /@(?:-[a-z]+-)?keyframes\s+([\w-]+)/gi;

/**
 * EVERY MOTION TOKEN THE GENERATOR EMITTED AT 39f3884 — the last commit that carried motion.
 *
 * Derived, not remembered: this is `comm` over the token names declared in `tokens.css` before
 * and after the removal. It is spelled out rather than matched by prefix because the prefixes
 * are shared with names that are still alive and load-bearing — `--floating-min-w` and
 * `--floating-chrome-elevated` are a panel's floor and its cast, `--overlay-w-1` is a dialog's
 * width, `--dialog-inset` its gutter, `--tooltip-max-w` its measure. A `--floating-` sweep would
 * have taken four live tokens with it, which is the kind of over-reach that gets a law deleted
 * rather than fixed.
 *
 * `--motion-` is the one safe prefix: the whole namespace was motion and nothing survives in it.
 */
const MOTION_PREFIX = "--motion-";
const MOTION_TOKENS = [
  "--dialog-depth",
  "--dialog-reveal",
  "--dialog-settle",
  "--done-blur",
  "--done-seed",
  "--floating-corner",
  "--floating-dissolve",
  "--floating-echo",
  "--floating-fall",
  "--floating-paint",
  "--floating-reveal",
  "--floating-reveal-delay",
  "--floating-seed",
  "--floating-settle",
  "--floating-spread",
  "--focus-ring-land",
  "--hover-travel",
  "--overlay-dissolve",
  "--overlay-echo",
  "--overlay-fall",
  "--overlay-grow",
  "--overlay-hold",
  "--overlay-lift",
  "--overlay-materialize",
  "--overlay-print",
  "--overlay-reveal",
  "--overlay-reveal-delay",
  "--overlay-seed",
  "--overlay-settle",
  "--overlay-spread",
  "--press-scale",
  "--press-scale-surface",
  "--press-squash",
  "--press-travel",
  "--press-travel-surface",
  "--print-blur",
  "--thumb-lean",
  "--tooltip-form",
  "--tooltip-paint",
  "--tooltip-seed",
];

/** The attributes the entry and exit machinery keyed on. A selector on any of them is a flight
    coming back: `data-starting-style`/`data-ending-style` are Base UI's open and close stamps,
    `data-unfurling` and `data-seed` were this package's own flight and silhouette. */
const FLIGHT_ATTRIBUTES = ["data-starting-style", "data-ending-style", "data-unfurling", "data-seed"];

/**
 * THE PROPERTIES THAT MOVE A BOX — the reader for rule 2, which had none (audit 2026-09-20).
 *
 * The removal deleted pointer geometry rather than making it instant: the hover rise, the press
 * sink and scale, the mark squash, the thumb's lean. That is a stronger claim than "no
 * transition", and it is the one this file's own header makes — *"a hovered control changes
 * colour on the frame it is hovered and its box does not move"*. Until this list existed, the
 * second half of that sentence had no reader at all, and
 * `.kui-button:hover { translate: 0 calc(-1 * var(--hover-travel)) }` — the exact deleted rule,
 * minus its clock — passed every assertion in the file.
 *
 * Anchored the same way the declaration regexes are, so `--kui-ct-height`, `border-width` and
 * `background-position` are names that merely CONTAIN one of these words and not matches. The
 * list is the box's own geometry in both axis vocabularies plus the spacing that displaces it;
 * paint (fill, ink, border colour, shadow, opacity) is deliberately absent, because paint
 * answering a pointer is exactly what survived.
 */
const GEOMETRY_PROPERTIES = [
  "translate",
  "scale",
  "rotate",
  "transform",
  "inset(?:-[a-z-]+)?",
  "top",
  "right",
  "bottom",
  "left",
  "(?:min-|max-)?(?:width|height)",
  "(?:min-|max-)?(?:inline|block)-size",
  "margin(?:-[a-z-]+)?",
  "padding(?:-[a-z-]+)?",
  "(?:row-|column-)?gap",
];
const GEOMETRY = new RegExp(`(?:^|[{;\\s])(${GEOMETRY_PROPERTIES.join("|")})\\s*:`, "i");

/**
 * Every rule in a sheet as `[selector, body]`.
 *
 * Nested at-rules need no special handling, and that falls out of the shape rather than being
 * arranged: `[^{}]+` before the `{` can only ever be the INNERMOST selector, because an
 * enclosing `@media (hover: hover) {` has already consumed its own brace before this pattern
 * reaches the rule inside it. That matters here — almost every `:hover` rule in this package
 * lives inside a hover guard.
 */
const rules = (css: string): { selector: string; body: string }[] =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1]!.trim().replace(/\s+/g, " "),
    body: m[2]!,
  }));

/**
 * The body of an at-rule block, BRACE-BALANCED.
 *
 * `block()` in `test/stylesheets.ts` slices to the first `}`, which for an `@media` is the
 * first inner RULE's close and not the query's — so a law reading a media block through it
 * reads one rule and calls it the block. This is how a stand-down two rules down went
 * unnoticed, which is the sabotage that produced this helper.
 */
function atRuleBody(css: string, marker: string): string {
  const start = css.indexOf(marker);
  if (start === -1) throw new Error(`atRuleBody(): ${marker} not found`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`atRuleBody(): ${marker} is never closed`);
}

/** Shipped source: every `.ts`/`.tsx` under `src/` that a consumer's bundle can reach. The law
    files are excluded (a law that reads its own sabotage reads it back — the 2026-09-05 size
    coverage lesson) and so is `src/test/`, which is scaffolding: its own header says nothing in
    it is reachable from `index.ts`, and it writes `transition: none !important` on purpose. */
function shippedSources(): { path: string; code: string }[] {
  return [...walkFiles(".", ".ts"), ...walkFiles(".", ".tsx")]
    .filter((p) => !p.includes(".test.") && !p.startsWith("test/"))
    .map((p) => ({ path: p, code: stripTs(raw(p)) }));
}

/** Block and line comments out. The line-comment arm refuses a `//` preceded by `:` so a URL in
    a citation survives — these files are heavily commented and their comments name, by design,
    the very mechanisms this law forbids. */
const stripTs = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:\w])\/\/[^\n]*/g, "$1");

describe("nothing moves (2026-09-20)", () => {
  it("the walks find the corpus — an empty walk proves nothing", () => {
    // The negative control this file cannot do without. Every assertion below is an ABSENCE,
    // and an absence is satisfied perfectly by finding no files at all.
    expect(SHEETS.length, "the stylesheet walk came back short").toBeGreaterThan(40);
    expect(shippedSources().length, "the source walk came back short").toBeGreaterThan(50);
    for (const path of Object.keys(CONTENT_LOOPS)) {
      expect(SHEETS, `the walk missed ${path}, which the allowlist names`).toContain(path);
    }
  });

  it("no stylesheet declares a transition", () => {
    for (const path of SHEETS) {
      const found = TRANSITION.exec(sheet(path));
      expect(found?.[1], `${path} declares \`${found?.[1]}\` — every state change is instant`).toBeUndefined();
    }
  });

  it("the only animations are the three content loops, each in its own sheet", () => {
    for (const path of SHEETS) {
      const css = sheet(path);
      const loop = CONTENT_LOOPS[path];
      const keyframes = [...css.matchAll(KEYFRAMES)].map((m) => m[1]!);
      const animates = ANIMATION.exec(css);

      if (!loop) {
        expect(keyframes, `${path} defines a keyframe — only the three content loops may`).toEqual([]);
        expect(
          animates?.[1],
          `${path} declares \`${animates?.[1]}\` — motion that is not content is instant`,
        ).toBeUndefined();
        continue;
      }
      // An allowlisted sheet gets exactly ONE keyframe, and it must be the named one: a second
      // loop smuggled into spinner.css would otherwise inherit the exemption.
      expect(keyframes, `${path} may define ${loop} and nothing else`).toEqual([loop]);
      // And it must really define it — the allowlist has to stay a description of the code
      // rather than a list of files nothing checks.
      expect(css, `${path} no longer runs ${loop} — take it out of the allowlist`).toContain(
        `animation: ${loop} `,
      );
    }
  });

  it("only the three content loops answer prefers-reduced-motion, and each one SLOWS", () => {
    for (const path of SHEETS) {
      const asks = sheet(path).includes("prefers-reduced-motion");
      if (CONTENT_LOOPS[path]) {
        // Each one SLOWS: a loop that stands down to `none` has stopped saying what it exists
        // to say. The shape is a longer duration, never a suppression.
        expect(asks, `${path} runs ${CONTENT_LOOPS[path]} and owes it a reduced-motion arm`).toBe(true);
        // SCOPED TO THE BLOCK, and the first spelling was not (audit 2026-09-20). It asked the
        // whole FILE two independent questions — does the string `prefers-reduced-motion`
        // appear, and does the string `animation-duration` appear — which a sabotage satisfies
        // by standing the loop down to `animation: none` inside the query and leaving a plain
        // `animation-duration` anywhere outside it. Measured: the upload sweep STOPPED under
        // the preference with all 678 node laws and all 37 of the Attachment's own green.
        const guard = atRuleBody(sheet(path), "@media (prefers-reduced-motion: reduce)");
        expect(
          /animation-duration\s*:/.test(guard),
          `${path} answers the preference without slowing its loop`,
        ).toBe(true);
        expect(
          /animation\s*:\s*none/.test(guard),
          `${path} STOPS ${CONTENT_LOOPS[path]} under the preference — the motion is the information`,
        ).toBe(false);
      } else {
        expect(
          asks,
          `${path} answers prefers-reduced-motion — nothing outside the three loops has anything to stand down`,
        ).toBe(false);
      }
    }
  });

  it("nothing grows, scrolls smoothly, or keys on a flight", () => {
    for (const path of SHEETS) {
      const css = sheet(path);
      expect(css, `${path} uses interpolate-size — an animated size is still motion`).not.toContain(
        "interpolate-size",
      );
      expect(
        /scroll-behavior\s*:\s*smooth/.test(css),
        `${path} scrolls smoothly — a scroll is a state change like any other`,
      ).toBe(false);
      for (const attribute of FLIGHT_ATTRIBUTES) {
        expect(css, `${path} keys a rule on [${attribute}] — the entry machinery is gone`).not.toContain(
          `[${attribute}`,
        );
      }
      // The same claim in the platform's own syntax. `data-starting-style` is Base UI's stamp
      // for the state a panel enters FROM; `@starting-style` is the browser's, and the two
      // attributes above were banned without it, so the native spelling of the thing this law
      // forbids walked past the clause written to forbid it.
      expect(css, `${path} declares @starting-style — nothing enters, so nothing has a state to enter from`)
        .not.toContain("@starting-style");
    }
  });

  it("no rule answers a pointer with its BOX — the geometry is deleted, not stilled", () => {
    /**
     * RULE 2 OF THE REMOVAL, and the half the rest of this file cannot see. Everything above
     * asserts that nothing is on a clock; this asserts there is nothing to put on one.
     *
     * The distinction is the whole design of the removal. `translate: 0 -1px` with no
     * transition is not a slow rise made instant — it is a control whose box is in a different
     * place while a pointer is over it, which §8 said a control does and this package no longer
     * does. Every assertion above passes against it.
     *
     * Falsified by restoring button.css's deleted rise:
     *   `.kui-button:hover { translate: 0 calc(-1 * var(--hover-travel)) }`
     * — which fails here and nowhere else in the suite.
     */
    let scanned = 0;
    for (const path of SHEETS) {
      for (const { selector, body } of rules(sheet(path))) {
        if (!/:hover|:active/.test(selector)) continue;
        scanned += 1;
        const moves = GEOMETRY.exec(body);
        expect(
          moves?.[1],
          `${path} moves a box under the pointer: \`${selector}\` declares \`${moves?.[1]}\``,
        ).toBeUndefined();
      }
    }
    // VACUITY. Every assertion in the loop is an absence, and an absence is satisfied perfectly
    // by a rule walk that finds no `:hover` rule at all — a broken splitter, a renamed
    // pseudo-class, a stripper that ate the file.
    expect(scanned, "the walk found no hover or press rule — this law is reading nothing").toBeGreaterThan(20);
  });

  it("tokens.css emits no motion token, and no sheet reads one", () => {
    for (const path of SHEETS) {
      const css = sheet(path);
      expect(css, `${path} names a token in the ${MOTION_PREFIX} namespace`).not.toContain(MOTION_PREFIX);
      for (const token of MOTION_TOKENS) {
        // Word-boundaried, because several of these names are prefixes of each other
        // (`--press-travel` / `--press-travel-surface`) and a bare `includes` would report the
        // wrong one. Declaration AND reference: a var() pointing at a dead name is a disarmed
        // declaration, which this repo has shipped before (the dangling-var law, 2026-08-14).
        expect(
          new RegExp(`${token}(?![\\w-])`).test(css),
          `${path} still names the motion token ${token}`,
        ).toBe(false);
      }
    }
  });

  it("shipped TypeScript neither drives nor listens to an animation", () => {
    for (const { path, code } of shippedSources()) {
      expect(
        /behavior\s*:\s*["']smooth["']/.test(code),
        `${path} asks the browser to scroll smoothly`,
      ).toBe(false);
      for (const event of ["transitionend", "transitioncancel", "animationend"]) {
        expect(code, `${path} listens for ${event} — there is nothing left to wait for`).not.toContain(
          event,
        );
      }
      // The one call that means "reach into a running animation". The floating runner used it to
      // seize a flight; nothing ships a flight to seize.
      expect(code, `${path} calls getAnimations()`).not.toContain("getAnimations");

      /**
       * AND THE DRIVING HALF, which this law was titled for and did not check (audit
       * 2026-09-20). Everything above is JavaScript LISTENING for motion; a sabotage carrying
       * all five of these shapes at once passed the whole node project, 678 green.
       *
       * The Web Animations API is why this cannot be left to the stylesheet laws:
       * `el.animate([...])` needs no CSS at all — measured on a bare div, one running
       * Animation and opacity 0.046 mid-flight — so no walk over `SHEETS` can ever see it.
       * An inline `style.transition = …` is the same argument one mechanism over: it beats
       * every rule in the cascade and appears in no stylesheet.
       *
       * THERE IS NO ALLOWLIST, and that is worth stating rather than leaving implied: all
       * three content loops are declared in CSS, so no shipped source needs an exemption here.
       * An allowlist nobody needs is the cheapest place for a hole to open later.
       */
      for (const call of [".animate(", "startViewTransition", "new Animation("]) {
        expect(code, `${path} drives an animation from JavaScript: ${call}`).not.toContain(call);
      }
      expect(
        /\bstyle\.(transition|animation)[A-Za-z]*\s*=/.exec(code)?.[0],
        `${path} writes a transition inline, where it outranks every rule`,
      ).toBeUndefined();
      expect(
        /(?:^|[{,]\s*)(transition|animation)[A-Za-z]*\s*:/m.exec(code)?.[1],
        `${path} carries a transition in a style object`,
      ).toBeUndefined();
    }
  });
});
