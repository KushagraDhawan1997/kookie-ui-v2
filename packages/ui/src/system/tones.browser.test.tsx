/**
 * ACCENT IS NEVER DILUTED (§7, §11, 2026-08-23) — the doctrine as PAINT.
 *
 * `tokens.test.ts` reads the emitted indirection and proves the generator wrote what config
 * asked for. This file asks the browser what a person actually sees, which is the standing
 * rule after the 2026-08-03 audit: every axis is proven by a law reading a computed value
 * through a mounted `<Theme>`, in both appearances, because a token name is one indirection
 * short of the thing that can be wrong.
 *
 * EVERY LAW HERE CARRIES A NEGATIVE CONTROL, and it is the same one each time: `blue`. Accent
 * and blue are the same recipe under two names (`{ hue: 250, vividness: 1 }` twice), so a
 * generator that had quietly sent EVERY tone's wash to neutral — or a stylesheet that had
 * stopped painting fills at all — satisfies "accent's medium fill is neutral" perfectly. The
 * pair differing is the claim; accent alone is a sentence about nothing. This is the
 * degenerate-fixture rule (2026-08-20) applied before the fact rather than after.
 *
 * INSTRUMENT NOTE, for whoever sabotages this file next. These laws read `tokens.css` from
 * DISK, so a mutation to `generate.ts` or `color-config.ts` changes nothing they can see until
 * `pnpm run tokens` has run. The first sabotage pass on this file reported all three
 * mutations SURVIVING and the laws looked worthless; regenerating between mutation and run
 * turns every one of them into six failures. CI is safe (the build regenerates first), but a
 * hand-run sabotage is a silent no-op without it — the 2026-08-08 "a law that did not run is a
 * way of not failing" finding, wearing a different hat.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { APPEARANCES, colorOn, computed, mounted, within } from "../test/browser.tsx";
import { Button } from "../components/button/button.tsx";
import { Text } from "../components/text/text.tsx";
import type { Emphasis } from "./axes.ts";

/** The same control at one rung in three families, mounted together so one theme serves all
    three and a difference between them cannot be a difference between mounts. */
function trio(emphasis: Emphasis, appearance: (typeof APPEARANCES)[number]) {
  const root = mounted(
    <div>
      <Button data-t="accent" tone="accent" emphasis={emphasis}>Save</Button>
      <Button data-t="blue" tone="blue" emphasis={emphasis}>Save</Button>
      <Button data-t="neutral" tone="neutral" emphasis={emphasis}>Save</Button>
    </div>,
    { theme: { appearance } },
  );
  return {
    accent: within(root, '[data-t="accent"]'),
    blue: within(root, '[data-t="blue"]'),
    neutral: within(root, '[data-t="neutral"]'),
  };
}

const fill = (el: Element) => computed(el, "background-color");

for (const appearance of APPEARANCES) {
  describe(`${appearance}: the washes go neutral and the pigment stays`, () => {
    it("a MEDIUM accent button is filled in neutral, where its twin is not", () => {
      const { accent, blue, neutral } = trio("medium", appearance);
      expect(fill(accent), "accent's medium fill is still its own").toBe(fill(neutral));
      // THE CONTROL. Without it this law passes on a package that paints no fills at all.
      expect(fill(blue), "blue lost its wash too — the rule is not accent-only").not.toBe(
        fill(neutral),
      );
    });

    it("...and the label is where the accent went", () => {
      const { accent, neutral } = trio("medium", appearance);
      // Read through the FAMILY, not the role: `var(--tone-label)` resolves at the element to
      // whatever tone is stamped, so asserting it would pass on a button that had lost its
      // stamp entirely and fallen back to neutral — which is precisely the failure this law
      // is here to catch, since the fill is now neutral either way.
      expect(computed(accent, "color")).toBe(colorOn(accent, "var(--accent-label)"));
      expect(computed(accent, "color"), "nothing distinguishes the accent button").not.toBe(
        computed(neutral, "color"),
      );
    });

    it("a LOUD accent button keeps the pigment — this is the rung the rule protects", () => {
      const { accent, neutral } = trio("loud", appearance);
      expect(fill(accent)).toBe(colorOn(accent, "var(--accent-solid)"));
      expect(fill(accent), "accent went neutral at the one rung it must not").not.toBe(
        fill(neutral),
      );
    });

    it("a QUIET accent button hovers grey, where its twin hovers blue", async () => {
      // The paint under a real pointer, not the token behind it: quiet's rest is transparent,
      // so the wash only exists as something the pointer summons and reading `--tone-soft` off
      // a resting button would test the indirection this file exists to look past.
      const { accent, blue, neutral } = trio("quiet", appearance);
      await userEvent.hover(accent);
      const accentHover = fill(accent);
      await userEvent.hover(neutral);
      const neutralHover = fill(neutral);
      await userEvent.hover(blue);
      const blueHover = fill(blue);
      expect(accentHover, "the hover wash never arrived at all").not.toContain("rgba(0, 0, 0, 0)");
      expect(accentHover).toBe(neutralHover);
      expect(blueHover, "blue lost its hover wash too").not.toBe(neutralHover);
    });

    it("accent TEXT is loud or it is not accent", () => {
      // The ink trio's faded rungs (§15). Loud keeps the family's designed text colour —
      // measured `#2a6caa` light, `#95c2f2` dark, and it INVERTS between modes, which is the
      // signature of a value that moves lightness to stay legible rather than draining chroma
      // to stay quiet. Muted and faint drained chroma, so they go.
      const root = mounted(
        <div>
          <Text data-t="a-loud" tone="accent">Save</Text>
          <Text data-t="a-med" tone="accent" emphasis="medium">Save</Text>
          <Text data-t="b-med" tone="blue" emphasis="medium">Save</Text>
          <Text data-t="n-med" tone="neutral" emphasis="medium">Save</Text>
        </div>,
        { theme: { appearance } },
      );
      const at = (t: string) => computed(within(root, `[data-t="${t}"]`), "color");
      expect(at("a-loud"), "loud accent text lost its family").toBe(
        colorOn(within(root, '[data-t="a-loud"]'), "var(--accent-ink)"),
      );
      expect(at("a-med"), "a quieted accent word is still blue").toBe(at("n-med"));
      expect(at("b-med"), "blue's muted ink went neutral too").not.toBe(at("n-med"));
    });
  });
}
