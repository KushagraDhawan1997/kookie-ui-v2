/**
 * Attachment's laws, mounted (§43). Computed values through a real <Theme>, both appearances
 * where colour is the claim.
 *
 * The load-bearing ones are the two the component exists to guarantee — the app owns the file
 * (nothing here holds or times anything) and the state is drawn rather than inferred — plus
 * the cast refusal, which is the fourth appearance of §5's plane criterion and the one thing a
 * `.kui-surface` gets wrong by default.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";

import { APPEARANCES, DEPTHS, colorOn, computed, mounted, within } from "../../test/browser.tsx";
import { Card } from "../card/card.tsx";
import { Notice } from "../notice/notice.tsx";
import { Attachment } from "./attachment.tsx";

const NAME = "quarterly-report.pdf";

describe("the system draws the state; the app owns the file (§30, §43)", () => {
  it("every state is STAMPED, so the drawing is the prop and never an inference", () => {
    for (const state of ["idle", "uploading", "processing", "error"] as const) {
      const el = mounted(<Attachment state={state}>{NAME}</Attachment>, { theme: {} });
      expect(el.getAttribute("data-state")).toBe(state);
    }
  });

  it("a busy tile announces itself busy, and a resting one does not", () => {
    for (const state of ["uploading", "processing"] as const) {
      const el = mounted(<Attachment state={state}>{NAME}</Attachment>, { theme: {} });
      expect(el.getAttribute("aria-busy"), `${state} must announce busy`).toBe("true");
    }
    for (const state of ["idle", "error"] as const) {
      const el = mounted(<Attachment state={state}>{NAME}</Attachment>, { theme: {} });
      expect(el.getAttribute("aria-busy"), `${state} is not busy`).toBe(null);
    }
  });

  it("the bar exists only while something is happening", () => {
    // A resting tile that still drew a channel would be reporting a task nobody started.
    expect(mounted(<Attachment>{NAME}</Attachment>, { theme: {} }).querySelector(".kui-attachment-progress")).toBe(null);
    expect(
      mounted(<Attachment state="error">{NAME}</Attachment>, { theme: {} }).querySelector(".kui-attachment-progress"),
    ).toBe(null);
    for (const state of ["uploading", "processing"] as const) {
      const el = mounted(<Attachment state={state}>{NAME}</Attachment>, { theme: {} });
      expect(el.querySelector(".kui-attachment-progress"), `${state} draws a bar`).not.toBe(null);
    }
  });

  it("`progress` fills the bar while uploading, and `processing` never reads it", () => {
    /* This is what makes `uploading` and `processing` two states rather than one busy flag:
       one can be counted and the other cannot. The law reads the PAINTED fill, not the prop —
       an indeterminate bar and a 0% bar are the same number and a different drawing, so the
       determinate arm is read through `aria-valuenow`, which Base UI omits entirely when the
       value is null. Falsified by passing `progress` through in both arms. */
    const filling = within(
      mounted(
        <Attachment state="uploading" progress={0.4}>
          {NAME}
        </Attachment>,
        { theme: {} },
      ),
      ".kui-attachment-progress",
    );
    expect(filling.getAttribute("aria-valuenow")).toBe("0.4");

    const sweeping = within(
      mounted(
        <Attachment state="processing" progress={0.4}>
          {NAME}
        </Attachment>,
        { theme: {} },
      ),
      ".kui-attachment-progress",
    );
    expect(sweeping.getAttribute("aria-valuenow"), "processing reports no fraction").toBe(null);
  });

  it("the bar restates what the tile announces, so it is hidden from AT", () => {
    const bar = within(
      mounted(<Attachment state="uploading">{NAME}</Attachment>, { theme: {} }),
      ".kui-attachment-progress",
    );
    expect(bar.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("the state is the category, so there is no second colour axis (§43, §11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: an error tile reads in the destructive family, and a resting one does not`, () => {
      const failed = mounted(
        <Attachment state="error" meta="Upload failed">
          {NAME}
        </Attachment>,
        { theme: { appearance } },
      );
      const resting = mounted(<Attachment meta="1.2 MB">{NAME}</Attachment>, { theme: { appearance } });
      /* Both rungs are stamped, always — a surface with either half missing paints nothing,
         which is how the first draft shipped a transparent tile in both states. */
      expect(failed.getAttribute("data-tone")).toBe("destructive");
      expect(failed.getAttribute("data-emphasis")).toBe("medium");
      expect(resting.getAttribute("data-tone")).toBe("neutral");
      expect(resting.getAttribute("data-emphasis")).toBe("quiet");

      /* Read the PAINT, not the stamp — the stamp is an attribute that comes back verbatim and
         could never fail (2026-08-16's lesson). The claim is that the tone indirection actually
         reaches the fill without this component's stylesheet naming a colour.

         CALIBRATED FIRST, because the first spelling of this line was the instrument being
         wrong rather than the component: it read `colorOn(el, "background-color")`, and
         `colorOn` resolves a colour EXPRESSION, so it was handed a property name, resolved
         nothing, and reported both tiles transparent and therefore equal. The component was
         painting the destructive a3 the whole time. Read the property with `computed`, and
         assert against a resolved token so a silent fallback to nothing fails too. */
      expect(computed(failed, "background-color")).toBe(colorOn(failed, "var(--destructive-a3)"));
      expect(computed(failed, "background-color")).not.toBe(computed(resting, "background-color"));

      /* And the resting fill is stated as an AGREEMENT rather than as a token name, because
         "a tile rests as a card" is the actual design sentence: a Card at the same index must
         paint the identical seal. A token name would still pass if the two drifted apart. */
      const card = mounted(<Card>content</Card>, { theme: { appearance } });
      expect(computed(resting, "background-color")).toBe(computed(card, "background-color"));
    });
  }
});

describe("an attachment does not cast (§5, §10)", () => {
  for (const appearance of APPEARANCES) {
    for (const depth of DEPTHS) {
      it(`${appearance}/${depth}: it throws no shadow where a Card does`, () => {
        const el = mounted(<Attachment>{NAME}</Attachment>, { theme: { appearance, depth } });
        /* EVERY layer, not "a layer somewhere is zero". The first spelling of this law tested
           `/0px 0px 0px 0px/` against the whole string, which the POOL's own transparent first
           layer satisfies — so it passed on a tile casting two real shadows, and the agreement
           law below is what caught it. Split and check each. */
        const shadow = computed(el, "box-shadow");
        const layers = shadow === "none" ? [] : shadow.split(/,(?![^(]*\))/);
        for (const layer of layers) {
          expect(layer.trim(), `a real cast survived: ${shadow}`).toMatch(/rgba?\([^)]*,\s*0\)\s*0px 0px 0px 0px/);
        }
      });
    }
  }

  it("the negative control: a Card at the same placement DOES cast in the elevated world", () => {
    /* Without this arm the suite above passes against a stylesheet in which nothing casts at
       all, which is the degenerate fixture this repo has been bitten by nine times. */
    const card = mounted(<Card>content</Card>, { theme: { depth: "elevated" } });
    expect(computed(card, "box-shadow")).not.toBe("none");
  });

  it("it agrees with the Notice, which is the component this reasoning came from", () => {
    const tile = mounted(<Attachment>{NAME}</Attachment>, { theme: { depth: "elevated" } });
    const strip = mounted(<Notice>Approaching weekly usage limit</Notice>, { theme: { depth: "elevated" } });
    expect(computed(tile, "box-shadow")).toBe(computed(strip, "box-shadow"));
  });
});

describe("the arrangement holds a name that does not fit (§43)", () => {
  it("one unbreakable file name never pushes the remove control off the tile", () => {
    /* The fixture is the finding: a hyphenated or spaced name breaks on its own and the law
       would pass with `min-inline-size` deleted — the Notice's own surviving sabotage, one
       component over. This name has nothing to break on. */
    const unbreakable = "averyveryverylongsinglewordfilenamewithnobreakopportunity.pdf";
    const el = mounted(
      <div style={{ inlineSize: "260px" }}>
        <Attachment onRemove={() => {}}>{unbreakable}</Attachment>
      </div>,
      { theme: {} },
    );
    const tile = within(el, ".kui-attachment").getBoundingClientRect();
    const remove = within(el, ".kui-attachment-remove").getBoundingClientRect();
    expect(remove.right).toBeLessThanOrEqual(tile.right + 1);
    expect(tile.width).toBeLessThanOrEqual(261);
  });

  it("the remove control exists only when the app can honour it", () => {
    expect(mounted(<Attachment>{NAME}</Attachment>, { theme: {} }).querySelector(".kui-attachment-remove")).toBe(null);
    const el = mounted(<Attachment onRemove={() => {}}>{NAME}</Attachment>, { theme: {} });
    const remove = within(el, ".kui-attachment-remove");
    expect(remove.getAttribute("aria-label")).toBe("Remove");
  });
});
