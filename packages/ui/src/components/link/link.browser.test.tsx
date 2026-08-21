/**
 * Link's laws, mounted (§11's typography row, §15).
 *
 * The component's whole claim is "Text, plus the two things that make a link a link", so the
 * laws are shaped as comparisons wherever the claim is *nothing changed* — a restated
 * assertion would go green against a Link that had quietly grown its own type behaviour.
 * What it ADDS is asserted against the roles it must resolve to, never against a literal.
 *
 * The refusals get laws of their own, because a refusal nothing reads is a refusal that comes
 * back: the control skeleton must not reach it, and it must not grow a target.
 */
import { describe, expect, it } from "vitest";

import { APPEARANCES, colorOn, computed, mounted, tokenOn } from "../../test/browser.tsx";
import { Blockquote } from "../blockquote/blockquote.tsx";
import { Button } from "../button/button.tsx";
import { Separator } from "../separator/separator.tsx";
import { Text } from "../text/text.tsx";
import { Link } from "./link.tsx";

describe("it reads as Text reads — the shared type layer does all of it (§15)", () => {
  it("the ramp is the layer's at every step, and the steps genuinely differ", () => {
    for (const size of ["1", "3", "6", "9"] as const) {
      const link = mounted(<Link size={size}>a</Link>, { theme: {} });
      const text = mounted(<Text size={size}>a</Text>, { theme: {} });
      for (const prop of ["font-size", "line-height", "letter-spacing", "font-family"]) {
        expect(computed(link, prop), `size ${size}: ${prop} diverged from Text`).toBe(
          computed(text, prop),
        );
      }
    }
    const one = mounted(<Link size="1">a</Link>, { theme: {} });
    const nine = mounted(<Link size="9">a</Link>, { theme: {} });
    expect(computed(one, "font-size")).not.toBe(computed(nine, "font-size"));
  });

  it("size is optional with NO default: unset, it takes the line it sits in", () => {
    // Code's rule, inherited verbatim (§15). The failure this catches is a `size = "3"`
    // default creeping in, which would push a link inside a caption back up to body size —
    // silent, and wrong in exactly the composition the component is most used in.
    const host = mounted(
      <Text size="2">
        go <Link>there</Link>
      </Text>,
      { theme: {} },
    );
    const link = host.querySelector("a")!;
    expect(link.hasAttribute("data-size"), "an unset size stamped an attribute").toBe(false);
    expect(computed(link, "font-size")).toBe(computed(host, "font-size"));
    expect(computed(link, "line-height")).toBe(computed(host, "line-height"));

    // ...and the vacuity guard: the host is genuinely NOT the default step, so the equality
    // above is doing work rather than agreeing with a coincidence.
    const plain = mounted(<Text>a</Text>, { theme: {} });
    expect(computed(host, "font-size")).not.toBe(computed(plain, "font-size"));
  });

  it("the UA margin is gone and the underline is the component's, not the browser's", () => {
    const el = mounted(<Link>a</Link>, { theme: {} });
    for (const side of ["top", "bottom", "left", "right"]) {
      expect(computed(el, `margin-${side}`), `margin-${side} survived`).toBe("0px");
    }
    expect(computed(el, "text-decoration-thickness")).toBe(tokenOn(el, "--border-width"));
  });

  it("renders an <a>, and render swaps the element while keeping the dress", () => {
    expect(mounted(<Link>a</Link>, { theme: {} }).tagName).toBe("A");
    const spanned = mounted(<Link render={<span />}>a</Link>, { theme: {} });
    expect(spanned.tagName).toBe("SPAN");
    expect(computed(spanned, "text-decoration-line")).toBe("underline");
  });
});

describe("the ink is the tone's, and accent is the default identity (§7, §11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: it rests on the accent family's ink, stamped rather than assumed`, () => {
      const el = mounted(<Link>a</Link>, { theme: { appearance } });
      expect(el.getAttribute("data-tone"), "the default identity must be stamped").toBe("accent");
      expect(computed(el, "color")).toBe(colorOn(el, "var(--accent-ink)"));

      // The thing that makes accent a CHOICE rather than a coincidence: it is not the colour
      // ordinary copy reads. This is the law that fails if the tone indirection stops
      // resolving and the element quietly falls back to the foreground role.
      const copy = mounted(<Text>a</Text>, { theme: { appearance } });
      expect(computed(el, "color")).not.toBe(computed(copy, "color"));
    });

    it(`${appearance}: a chosen tone moves BOTH the words and the underline`, () => {
      // "The ink went red, the underline stayed grey" is the half-fix that ships. Both are
      // read, in one law, for the reason Code's tone law reads both its ink and its fill.
      const red = mounted(<Link tone="destructive">a</Link>, { theme: { appearance } });
      const base = mounted(<Link>a</Link>, { theme: { appearance } });
      expect(computed(red, "color")).toBe(colorOn(red, "var(--destructive-ink)"));
      expect(computed(red, "color")).not.toBe(computed(base, "color"));
      // At rest the decoration is the quiet hairline in EITHER tone; under the pointer it
      // becomes the ink, which is where the family reaches it. Asserted through the hover
      // colour rather than the resting one, because the resting one is deliberately tone-less.
      expect(computed(red, "text-decoration-color")).toBe(computed(base, "text-decoration-color"));
    });

    it(`${appearance}: the resting underline is the quiet hairline every other rule uses`, () => {
      const el = mounted(<Link>a</Link>, { theme: { appearance } });
      expect(computed(el, "text-decoration-color")).toBe(colorOn(el, "var(--color-border)"));

      // §7's edge order, read as a computed value: one quiet line, three components. If this
      // ever diverges, a link's underline has become a second colour competing with the words.
      const rule = mounted(<Separator />, { theme: { appearance } });
      const quote = mounted(<Blockquote>a</Blockquote>, { theme: { appearance } });
      expect(computed(el, "text-decoration-color")).toBe(computed(rule, "background-color"));
      expect(computed(el, "text-decoration-color")).toBe(computed(quote, "border-left-color"));
    });
  }
});

describe("the refusals hold as computed values, not as absent props", () => {
  it("it is not a control: no target, no height, no box, and the text stays selectable", () => {
    const link = mounted(<Link>a</Link>, { theme: {} });
    const button = mounted(<Button size="2">a</Button>, { theme: {} });

    expect(link.classList.contains("kui-control"), "it opted into the skeleton").toBe(false);
    // Inline, so it has no box of its own to price. A control's does.
    expect(computed(link, "display")).toBe("inline");
    expect(computed(button, "display")).not.toBe("inline");
    // The skeleton's own facts, each of which would break prose if it reached here.
    expect(computed(link, "user-select"), "an inline link stopped being selectable").not.toBe(
      "none",
    );
    expect(parseFloat(computed(link, "min-height")) || 0).toBe(0);
    expect(parseFloat(computed(button, "min-height"))).toBeGreaterThan(0);
  });

  it("it grows no target — SC 2.5.8's inline exception, held structurally", () => {
    // §16's expansion is a `::before` whose box is larger than the paint. A mark has no
    // container to inherit a target from; a link's container is the paragraph, which may not
    // grow. This reads the pseudo-element rather than the class, because the class is what a
    // future author would copy and the pseudo-element is what would actually move the page.
    const link = mounted(<Link>a</Link>, { theme: {} });
    const before = getComputedStyle(link, "::before");
    expect(before.content, "a link grew a target pseudo-element").toBe("none");
  });

  it("the focus ring is the system's one ring, drawn by this sheet because no skeleton does", () => {
    const link = mounted(<Link>a</Link>, { theme: {} });
    link.focus();
    expect(document.activeElement, "an <a> with no href is not focusable").not.toBe(link);

    // ...so drive the real case: an anchor with an href, focused from the keyboard path.
    const real = mounted(<Link href="#x">a</Link>, { theme: {} });
    real.focus();
    expect(document.activeElement).toBe(real);
    expect(computed(real, "outline-style")).toBe("solid");
    expect(computed(real, "outline-width")).toBe(tokenOn(real, "--focus-ring-width"));
    expect(computed(real, "outline-color")).toBe(colorOn(real, "var(--focus-ring)"));
    expect(computed(real, "outline-offset")).toBe(tokenOn(real, "--focus-ring-offset"));
  });
});
