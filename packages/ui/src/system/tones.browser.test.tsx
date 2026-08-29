/**
 * THE WASHES ARE NEUTRAL FOR EVERYONE, AND ACCENT GIVES UP MORE — the doctrine as PAINT.
 *
 * `tokens.test.ts` reads the emitted indirection and proves the generator wrote what config
 * asked for. This file asks the browser what a person actually sees, which is the standing
 * rule after the 2026-08-03 audit: every axis is proven by a law reading a computed value
 * through a mounted `<Theme>`, in both appearances, because a token name is one indirection
 * short of the thing that can be wrong.
 *
 * THE NEGATIVE CONTROL MOVED ON 2026-08-23 AND THAT IS WORTH READING BEFORE EDITING HERE.
 * `blue` is accent's own recipe under another name, so it was the one control that could not
 * be dismissed as a different colour behaving differently — and every law used it the same
 * way: accent's wash is neutral, blue's is not. Then the washes went neutral for every family
 * (Kushagra: "why do these buttons continue to have a light filter?"), which made that
 * comparison TRUE OF BOTH — a control that no longer controls, and a law that had quietly
 * become a tautology.
 *
 * So the laws split. The wash laws now assert three families agree, with a "the fill still
 * exists" guard in place of the old control. `blue` still controls where accent genuinely
 * still differs: `a3` and the two faded inks, which stayed accent-only so a Notice keeps its
 * tint and toned prose keeps its red. When you add a law here, ask which of those two shapes
 * it is — the wrong one is a sentence about nothing.
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
import { Row } from "../components/row/row.tsx";
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
    it("a MEDIUM button is filled in NEUTRAL whatever tone it carries", () => {
      // Widened 2026-08-23 from accent-only. The wash roles are neutral for every family now,
      // so this reads three families at once and asserts they are one colour — which is a
      // stronger claim than the old "accent equals neutral", and the one Kushagra asked for.
      const { accent, blue, neutral } = trio("medium", appearance);
      expect(fill(accent), "accent's medium fill is still its own").toBe(fill(neutral));
      expect(fill(blue), "blue still paints a tinted wash").toBe(fill(neutral));
      // Vacuity guard: a package that painted NO fill at all satisfies every line above. The
      // wash has to exist — what it lost is the claim that it is the family.
      expect(fill(neutral), "the medium rung stopped painting anything").not.toContain(
        "rgba(0, 0, 0, 0)",
      );
    });

    it("...and the family is in the LABEL — for every tone, not just accent", () => {
      const { accent, blue, neutral } = trio("medium", appearance);
      // Read through the FAMILY, not the role: `var(--tone-ink)` resolves at the element to
      // whatever is stamped, so asserting it would pass on a button that had lost its stamp
      // and fallen back to neutral — which is exactly the failure to catch, since the fill is
      // now neutral either way.
      expect(computed(accent, "color")).toBe(colorOn(accent, "var(--accent-ink)"));
      expect(computed(blue, "color")).toBe(colorOn(blue, "var(--blue-ink)"));
      // HELD THROUGH BOTH DIRECTIONS OF THE BRAND CHANGE, which is why it is worth saying what
      // it rests on: `--accent-ink` and `--neutral-ink` differ by STEP (`--accent-11` vs
      // `--neutral-12` — every named tone's ink sits one step short of neutral's own, §15's
      // "≡ the tone-less roles" reserving 12 for neutral alone), not by hue or vividness. It
      // was true on 2026-08-28 when accent's `{ hue, vividness }` was byte-for-byte neutral's,
      // and it is true again now that accent is blue. The LOUD rung below is the one that
      // moved, because there a grey brand takes the low-chroma branch onto neutral's own step.
      expect(computed(accent, "color"), "nothing distinguishes a toned button").not.toBe(
        computed(neutral, "color"),
      );
    });

    it("a button's label reads what a ROW's label reads — the 2026-08-23 reversal", () => {
      /**
       * The defect Kushagra found on the tone x emphasis board: "why does row label not read
       * the same as button's... Button label reads too dark."
       *
       * Buttons read `--tone-label` (between steps 11 and 12) while rows moved to `--tone-ink`
       * on 2026-08-09, for a reason that applied to both: on a chroma family `--tone-label` is
       * muddy — destructive resolves it to #6c3230, a BROWN, against the ink's #a64545. Rows
       * were fixed, buttons were not, and the two disagreed on one screen.
       *
       * DESTRUCTIVE is the fixture and that is load-bearing: on NEUTRAL the two roles are close
       * enough that a reader might not notice, and this law would be about nothing.
       */
      const root = mounted(
        <div>
          <Button data-t="btn" tone="destructive" emphasis="quiet">Delete</Button>
          <Row data-t="row" tone="destructive">Delete</Row>
        </div>,
        { theme: { appearance } },
      );
      const btn = within(root, '[data-t="btn"]');
      const row = within(root, '[data-t="row"]');
      expect(computed(btn, "color"), "a button and a row disagree about one word").toBe(
        computed(row, "color"),
      );
      expect(computed(btn, "color")).toBe(colorOn(btn, "var(--destructive-ink)"));
      // And it is NOT the control ink it used to be — the brown, measured.
      expect(computed(btn, "color"), "the button is back on the muddy label ink").not.toBe(
        colorOn(btn, "var(--destructive-label)"),
      );
    });

    it("a QUIET button hovers grey, whatever tone it carries", async () => {
      // The paint under a real pointer, not the token behind it: quiet's rest is transparent,
      // so the wash only exists as something the pointer summons.
      const { accent, blue, neutral } = trio("quiet", appearance);
      await userEvent.hover(accent);
      const accentHover = fill(accent);
      await userEvent.hover(neutral);
      const neutralHover = fill(neutral);
      await userEvent.hover(blue);
      const blueHover = fill(blue);
      expect(accentHover, "the hover wash never arrived at all").not.toContain("rgba(0, 0, 0, 0)");
      expect(accentHover).toBe(neutralHover);
      expect(blueHover, "blue still hovers to a tint").toBe(neutralHover);
    });

    it("a LOUD accent button keeps the pigment (2026-08-29, Kushagra: accent is blue again)", () => {
      // REVERSED TWICE, and the second reversal restores the first spelling. This law read
      // "accent IS neutral's solid" for one day, while `color-config.ts` held accent at
      // `vividness: 0.04` — true then, and true only by the low-chroma branch collapsing both
      // families onto step 12. With a pigment brand the loud rung is where accent and neutral
      // are furthest apart, which is what makes it the one rung worth reading.
      const { accent, neutral } = trio("loud", appearance);
      expect(fill(accent)).toBe(colorOn(accent, "var(--accent-solid)"));
      expect(fill(accent), "accent went neutral at the one rung it must not").not.toBe(
        fill(neutral),
      );
    });

    it("accent TEXT is loud or it is not accent — and blue is the control that still holds", () => {
      // The ink trio's faded rungs (§15), and this is one of the three roles that stayed
      // ACCENT-ONLY when the washes widened. `blue` therefore still controls here, which is
      // why the surviving difference was moved onto these: the pair no longer differs at the
      // wash roles at all, so a law using those as its control had become a tautology.
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
      expect(at("b-med"), "blue's muted ink went neutral too — Notice's prose would follow").not.toBe(
        at("n-med"),
      );
    });
  });
}
