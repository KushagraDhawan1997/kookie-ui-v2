/**
 * CodeBlock's laws, mounted (§11, §15).
 *
 * The element is display and position only, so almost every guarantee here is a MEASUREMENT
 * of a box: the pane is a ground and not a card, the scroller reaches the pane's own walls on
 * both block edges, the bound scrolls rather than clips, and the chrome rows hang from the
 * pane rather than from something around it. The two that are not measurements are agreements
 * — the mono family reaches the inner `<code>`, and a syntax token resolves to a solved ink
 * rather than to a colour anybody typed.
 *
 * Promoted from the docs' own block, where every one of these facts had been found by a
 * person looking at a page. Each law below names the arrangement that produced the fault, so
 * the sabotage that falsifies it is the fault itself rather than a guess at one.
 */
import { describe, expect, it } from "vitest";

import { SIZES, computed, mounted, within } from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Surface } from "../surface/surface.tsx";
import { CodeBlock } from "./code-block.tsx";

const SHORT = 'const greeting = "hello"\n';
const LONG = "x\n".repeat(80);

/** A row of chrome. Content only — the element places it, which is the promotion's own point. */
const Row = ({ label }: { label: string }) => <span data-probe={label}>{label}</span>;

const pane = (el: HTMLElement): HTMLElement => within(el, ".kui-code-block");
const viewport = (el: HTMLElement): HTMLElement => within(el, ".kui-scroll-viewport");
const pre = (el: HTMLElement): HTMLElement => within(el, "pre");
const px = (value: string): number => Number.parseFloat(value);

describe("the well is a ground, and a hosted one is not a pane at all (§10)", () => {
  it("a standalone well paints what a Surface paints, not what a Card paints", () => {
    /* THE COMPOSITION, stated as an agreement rather than as a token name: the code is not an
       object sitting on the page, it is a well recessed into it. Read against BOTH mounted
       twins, because asserting only the Surface half passes for a Card too on any day the two
       grounds happen to agree — the degenerate-fixture rule. */
    const el = mounted(<CodeBlock>{SHORT}</CodeBlock>, { theme: {} });
    const ground = mounted(<Surface />, { theme: {} });
    const card = mounted(<Card />, { theme: {} });
    expect(computed(pane(el), "background-color")).toBe(computed(ground, "background-color"));
    expect(computed(pane(el), "background-color")).not.toBe(computed(card, "background-color"));
  });

  it("a hosted well draws no pane of its own — no fill, no border, no inset", () => {
    /* A well inside a ground is the same ground twice. What the hosted arrangement keeps is a
       positioning context and nothing else, so every painted fact of a pane must be absent.
       Falsified by rendering the Surface branch for a hosted well, which brings all three
       back at once. */
    const el = mounted(
      <Card>
        <CodeBlock hosted>{SHORT}</CodeBlock>
      </Card>,
      { theme: {} },
    );
    const well = pane(el);
    expect(well.classList.contains("kui-surface")).toBe(false);
    expect(computed(well, "background-color")).toBe("rgba(0, 0, 0, 0)");
    expect(px(computed(well, "border-top-width"))).toBe(0);
    expect(px(computed(well, "padding-top"))).toBe(0);
    // And it is still the containing block the floating chrome needs.
    expect(computed(well, "position")).toBe("relative");
  });
});

describe("the floating chrome does not block the scroller's bleed", () => {
  it("the scroller reaches both block walls of the pane with a row over each", () => {
    /* THE PROMOTION'S LOAD-BEARING FACT. A row of chrome is a DOM sibling of the scroller and
       is not a sibling in the layout, and the surface layer's edge-bleed asks for the pane's
       first and last IN-FLOW child — so the element marks each row `data-float`. Without the
       mark the scroller stops an inset short of the wall on whichever edge carries a row, and
       the code can never scroll into the band the row floats over: exactly the fault that put
       a scroll area 25px below a card's top edge.

       Measured against the pane's own BORDER box (`clientTop`), because which side of a flush
       pane carries a border is not this element's business. Falsified by dropping `data-float`
       from either wrapper, which fails the corresponding edge and leaves the other green. */
    const el = mounted(
      <CodeBlock topbar={<Row label="top" />} footer={<Row label="bottom" />}>
        {LONG}
      </CodeBlock>,
      { theme: {} },
    );
    const well = pane(el);
    const area = within(el, ".kui-scroll-area");
    const wellBox = well.getBoundingClientRect();
    const areaBox = area.getBoundingClientRect();
    expect(areaBox.top - wellBox.top, "the start edge").toBeCloseTo(well.clientTop, 1);
    expect(wellBox.bottom - areaBox.bottom, "the end edge").toBeCloseTo(well.clientTop, 1);
    // The calibration half: the pane really does have an inset to lose, so the two
    // assertions above are not both trivially zero.
    expect(px(computed(well, "padding-top"))).toBeGreaterThan(0);
  });

  it("both rows hang from the pane itself, so they rest against one box", () => {
    /* Two rows floating against two different boxes is a difference nothing states, and in a
       hosted well it becomes a visible one: the bleed's negative bottom margin collapses out
       of the well onto anything wrapped around it, so a footer hung from a wrapper sat the
       host's inset too far up. Both rows are the element's own children now.

       The law reads CONTAINMENT rather than a distance, because the distance is right by
       accident in a standalone well and wrong only when hosted — and it asserts the pane is
       each row's offset parent, which is the fact a wrapper would take away. */
    for (const hosted of [false, true]) {
      const el = mounted(
        <Card>
          <CodeBlock
            {...(hosted ? { hosted } : {})}
            topbar={<Row label="top" />}
            footer={<Row label="bottom" />}
          >
            {LONG}
          </CodeBlock>
        </Card>,
        { theme: {} },
      );
      const well = pane(el);
      for (const row of el.querySelectorAll<HTMLElement>(".kui-code-block-float")) {
        expect(row.offsetParent, `hosted=${hosted}`).toBe(well);
      }
    }
  });

  it("the first line of code rests one chrome inset below the controls", () => {
    /* THE GAP IS THE THING, and it was ZERO for a day with every other law in this file green.
     *
     * The band the element reserves for its chrome is computed in JS, and its comment promised
     * "change the row's padding and this follows" while the string named `--layout-space-4` —
     * the token the row had stopped using. So unifying the two rows left the band short by
     * twice the difference and the first line came to rest exactly on the controls. Found by
     * eye, on a screenshot, which is the only reader this had.
     *
     * READ AS GEOMETRY, never as the tokens that produce it: the whole defect was two correct
     * expressions naming different things, so any law rebuilding the expected value from those
     * same inputs would have agreed with the bug. This measures the pixels between the bottom
     * of the control and the top of the first line, and asserts it is the inset the pane
     * states — one number, at both ends of the ladder, because a single index cannot tell a
     * derived value from a literal that matches it there. */
    for (const size of ["1", "4"] as const) {
      // A REAL CONTROL, not the `<span>` probe the other laws use. The band reserves one
      // `--control-height-N`, so a fixture whose row holds a text node measures a gap of the
      // inset PLUS whatever that node is shorter by — 26 against 16 at size 1 — and the law
      // then either fails on correct code or gets "corrected" into rebuilding the arithmetic.
      // What every chrome row on the site actually holds is a button.
      //
      // `band` IS THE SUBJECT, so the fixture states it: the clearance exists only for a row
      // that spans the pane, and without it the element correctly reserves nothing and the code
      // runs under a control sitting in one corner. A fixture without it measures the case this
      // law is not about — and measures it as a 0px band, which every arithmetic below then
      // agrees with.
      const el = mounted(
        <CodeBlock size={size} band topbar={<Button size={size} data-probe="top">Copy</Button>}>
          {LONG}
        </CodeBlock>,
        { theme: {} },
      );
      // THE CHROME'S inset, read off the row itself — not the pane's. The two were the same
      // number for a day and this law happened to be written against the pane, which is the
      // reading that goes stale the moment the chrome is allowed its own value. What the band
      // owes is one of the ROW's insets below the row's own controls.
      const inset = px(computed(within(el, '.kui-code-block-float[data-edge="start"]'), "padding-top"));
      const control = within(el, "[data-probe='top']").getBoundingClientRect();
      const code = pre(el).getBoundingClientRect().top + px(computed(pre(el), "padding-block-start"));
      expect(Math.round(code - control.bottom), `size ${size}`).toBe(Math.round(inset));
    }
  });

  it("both chrome rows rest at ONE inset, and it is tighter than the code's", () => {
    /* TWO CLAIMS, made a day apart and both worth their own assertion.
     *
     * The rows AGREE: they rested at 12 and 16 — two chrome insets in one pane — because each
     * was judged alone and neither against the other. An EQUALITY is what holds that, and it is
     * why this law was rewritten rather than deleted when it read "the chrome sits closer to the
     * wall than the code does": an inequality passes on any two numbers in the right order, so
     * it could never have caught the two rows drifting.
     *
     * And the shared number is TIGHTER than the pane's own padding, which is the second
     * decision and needs the inequality that the first one could not carry alone. Both, or the
     * law is half of itself: equal-but-equal-to-the-pane and tighter-but-disagreeing each pass
     * one of these.
     *
     * READ AT TWO INDEXES, because one cannot tell a derived inset from a literal that happens
     * to match it there. */
    for (const size of ["1", "4"] as const) {
      const el = mounted(
        <CodeBlock size={size} topbar={<Row label="top" />} footer={<Row label="bottom" />}>
          {LONG}
        </CodeBlock>,
        { theme: {} },
      );
      const inset = px(computed(pane(el), "padding-top"));
      const rows = (["start", "end"] as const).map((edge) =>
        px(computed(within(el, `.kui-code-block-float[data-edge="${edge}"]`), "padding-top")),
      );
      expect(rows[0], `size ${size}: the two rows agree`).toBe(rows[1]);
      expect(rows[0], `size ${size}: and sit tighter than the code`).toBeLessThan(inset);
    }
  });
});

describe("the bound scrolls and never clips", () => {
  it("a bounded well is shorter than its content and every line stays reachable", () => {
    /* Bounded means SCROLLABLE. A collapse that clips leaves the hidden lines in the tab order
       and out of reach of a wheel — v1's defect, made inexpressible here — so the law reads
       the overflow AND the two heights, not one of them. Falsified by any spelling that hides
       the overflow instead of scrolling it. */
    const el = mounted(<CodeBlock maxLines={6}>{LONG}</CodeBlock>, { theme: {} });
    const view = viewport(el);
    expect(view.scrollHeight).toBeGreaterThan(view.clientHeight + 100);
    expect(computed(view, "overflow-y")).not.toBe("hidden");
    expect(computed(view, "overflow-y")).not.toBe("clip");
    view.scrollTop = view.scrollHeight;
    expect(view.scrollTop).toBeGreaterThan(0);
  });

  it("an unbounded well is as tall as its code", () => {
    // The calibration half of the law above: with no bound there is nothing to scroll, so a
    // suite that measured only the bounded case could not tell the prop from a default.
    const el = mounted(<CodeBlock>{LONG}</CodeBlock>, { theme: {} });
    const view = viewport(el);
    expect(view.scrollHeight - view.clientHeight).toBeLessThanOrEqual(1);
  });

  it("the bound counts LINES, so a band is added rather than eaten", () => {
    /* `maxLines={6}` shows six lines whether or not chrome floats above them. Read as the
       DIFFERENCE between two mounted wells at one bound, which is the only reading that can
       tell "the band was added" from "the bound happens to be generous". */
    const plain = mounted(<CodeBlock maxLines={6}>{LONG}</CodeBlock>, { theme: {} });
    const banded = mounted(
      <CodeBlock maxLines={6} band topbar={<Row label="top" />}>
        {LONG}
      </CodeBlock>,
      { theme: {} },
    );
    const clearance = px(computed(pre(banded), "padding-top"));
    expect(clearance, "a band must reserve something").toBeGreaterThan(0);
    expect(
      viewport(banded).clientHeight - viewport(plain).clientHeight,
    ).toBeCloseTo(clearance, 0);
  });

  it("a band is reserved only when the row spans the pane", () => {
    /* A row that reaches two walls covers the whole of the first line; a row holding one
       control in a corner does not, and reserving a pane's width of clearance for it is what
       put a hand's width of nothing in the other corner. Both arms, and each one alone passes
       with the flag inverted. */
    const banded = mounted(
      <CodeBlock band topbar={<Row label="top" />}>
        {SHORT}
      </CodeBlock>,
      { theme: {} },
    );
    const bare = mounted(<CodeBlock topbar={<Row label="top" />}>{SHORT}</CodeBlock>, {
      theme: {},
    });
    expect(px(computed(pre(banded), "padding-top"))).toBeGreaterThan(0);
    expect(px(computed(pre(bare), "padding-top"))).toBe(0);
  });
});

describe("the code itself", () => {
  it("a long line wraps at a space it already has, and never inside a token", () => {
    /* BOTH HALVES, because either alone is satisfied by a wrong implementation: `pre-wrap`
       with `overflow-wrap: break-word` would also stop the sideways scroll, and it would cut
       an identifier down the middle. So the law reads the declared pair AND measures the two
       cases against each other.

       The fixture is the load-bearing part. A wrappable line is long ENGLISH-shaped code with
       real spaces in it; an unwrappable one is a single token of the same length. On a correct
       package the first stops scrolling and the second does not — which is a difference no
       single fixture can show, and the shape three audits here have named. */
    const spaced = "const value = " + "aa bb cc dd ee ff gg hh ".repeat(12) + ";";
    const solid = "const value = " + "a".repeat(240) + ";";

    const wrapped = mounted(<CodeBlock>{spaced}</CodeBlock>, { theme: {} });
    expect(computed(pre(wrapped), "white-space")).toBe("pre-wrap");
    expect(computed(pre(wrapped), "overflow-wrap")).toBe("normal");
    const wrappedView = viewport(wrapped);
    expect(wrappedView.scrollWidth).toBeLessThanOrEqual(wrappedView.clientWidth + 1);
    // It really did take more than one row, or "it does not scroll" proves nothing.
    expect(pre(wrapped).getBoundingClientRect().height).toBeGreaterThan(
      parseFloat(computed(pre(wrapped), "line-height")) * 2,
    );

    // The unbreakable line still overflows, and the scroller still reaches it.
    const solidEl = mounted(<CodeBlock>{solid}</CodeBlock>, { theme: {} });
    const solidView = viewport(solidEl);
    expect(solidView.scrollWidth).toBeGreaterThan(solidView.clientWidth + 100);
  });

  it("the mono family reaches the inner <code>", () => {
    /* THE UA STYLESHEET. The family is stated on the `<pre>`, and the `<code>` inside carries
       the UA's own `font-family: monospace` — an author declaration on an ancestor does not
       beat a UA declaration on the element itself. So every glyph paints in whatever the
       reader's machine calls monospace while the pre above it holds the chosen face, and the
       fault is invisible for exactly as long as those two are the same stack.

       Read as an agreement between the two elements, plus a calibration against a bare `<code>`
       outside the well — without which this passes on any machine where the UA's monospace and
       `--font-mono` resolve alike, which is the arrangement that hid it. */
    const el = mounted(<CodeBlock>{SHORT}</CodeBlock>, { theme: {} });
    const inner = within(el, "pre > code");
    expect(computed(inner, "font-family")).toBe(computed(pre(el), "font-family"));
    const ua = mounted(<code>x</code>, { theme: {} });
    expect(computed(inner, "font-family")).not.toBe(computed(ua, "font-family"));
  });

  it("a syntax token resolves to a solved ink, not to a colour anybody typed", () => {
    /* The package ships no highlighter; it ships the THEME. A highlighter pointed at the
       `--code-` prefix must land on the same ink ladder the rest of the type on the
       page is held to, so the law reads a token against the family role it claims — a literal
       in the stylesheet would fail it, and so would a name that resolves to nothing. */
    const el = mounted(<CodeBlock>{SHORT}</CodeBlock>, { theme: {} });
    const style = getComputedStyle(pre(el));
    const keyword = style.getPropertyValue("--code-token-keyword").trim();
    const accent = style.getPropertyValue("--accent-ink").trim();
    expect(keyword).not.toBe("");
    expect(keyword).toBe(accent);
    expect(style.getPropertyValue("--code-token-string").trim()).toBe(
      style.getPropertyValue("--green-ink").trim(),
    );
  });

  it("the identifier vocabulary is not one value (2026-09-06)", () => {
    /* A component name resolves through `token-constant` and a prop name through
       `token-function`, and both stood at `--color-text`: a tag at full strength surrounded by
       everything else at full strength, which emphasises nothing. Both halves of the repair are
       read here, because either alone passes on a theme carrying only the other — the subject
       takes a family of its own, the supporting cast steps down to the muted rung, and the two
       DIFFER. The relation is asserted beside the identities rather than instead of them: "not
       equal" is satisfied by any colour anybody typed, and an identity alone would pass on the
       day the other name was given the same value. */
    const el = mounted(<CodeBlock>{SHORT}</CodeBlock>, { theme: {} });
    const style = getComputedStyle(pre(el));
    const supporting = style.getPropertyValue("--code-token-function").trim();
    const subject = style.getPropertyValue("--code-token-constant").trim();
    expect(supporting).not.toBe("");
    expect(subject).not.toBe("");
    expect(supporting).not.toBe(subject);
    expect(subject).toBe(style.getPropertyValue("--orange-ink").trim());
    expect(supporting).toBe(style.getPropertyValue("--color-text-muted").trim());
    /* And the three hues are three: a family spent twice is the 2026-08-21 collapse, which
       shipped invisibly because nothing read a code sample's pixels. */
    const keyword = style.getPropertyValue("--code-token-keyword").trim();
    const string = style.getPropertyValue("--code-token-string").trim();
    expect(new Set([keyword, string, subject]).size).toBe(3);
  });
});

describe("size prices the pane AND the text (§24, §25, §30)", () => {
  it("every index moves the pane's inset and the code's step together", () => {
    /* Ownership is the difference: a component that owns its pane and its text prices both.
       Read across ALL FOUR indexes rather than two, because two adjacent steps agree under
       more than one wrong spelling — the composer's own lesson, where a ladder that moved once
       in four passed a two-index law twice. */
    const insets: number[] = [];
    const steps: number[] = [];
    for (const size of SIZES) {
      const el = mounted(<CodeBlock size={size}>{SHORT}</CodeBlock>, { theme: {} });
      insets.push(px(computed(pane(el), "padding-top")));
      steps.push(px(computed(pre(el), "font-size")));
    }
    for (let i = 1; i < insets.length; i += 1) {
      expect(insets[i]!, `inset ${insets.join("/")}`).toBeGreaterThanOrEqual(insets[i - 1]!);
      expect(steps[i]!, `step ${steps.join("/")}`).toBeGreaterThanOrEqual(steps[i - 1]!);
    }
    /* Both ladders MOVE across the index, and neither is asserted strictly rung by rung: the
       surface padding band saturates at its top (measured 16/24/32/32), so a strict spelling
       is a law about that band rather than about this element, and it would fail the day the
       band is re-picked without anything here being wrong. What the element owes is that the
       index reaches both the pane and the text — which is the fault this catches, and the one
       a two-index reading missed in the composer. */
    expect(insets.at(-1)!, `inset ${insets.join("/")}`).toBeGreaterThan(insets[0]!);
    expect(steps.at(-1)!, `step ${steps.join("/")}`).toBeGreaterThan(steps[0]!);
  });
});
