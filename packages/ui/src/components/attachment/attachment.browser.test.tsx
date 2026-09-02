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

import { APPEARANCES, DEPTHS, GLASS_MATERIALS, colorOn, computed, mounted, within } from "../../test/browser.tsx";
import { Box } from "../box/box.tsx";
import { Button } from "../button/button.tsx";
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

  it("the tile is a NAMED region, and the name is the file", () => {
    /* It shipped as a bare `<div>` with a prop doc calling `children` "the tile's accessible
       name" — and a `<div>` maps to `role=generic`, for which naming is PROHIBITED, so the
       documented name could not exist. The two disagreed and the prose was the wrong half. */
    const el = mounted(<Attachment>{NAME}</Attachment>, { theme: {} });
    expect(el.getAttribute("role")).toBe("group");
    expect(el.getAttribute("aria-label")).toBe(NAME);
  });

  it("the second line is announced WITH the tile, not found separately", () => {
    const el = mounted(
      <Attachment state="error" meta="File is larger than 25 MB">
        {NAME}
      </Attachment>,
      { theme: {} },
    );
    const described = el.getAttribute("aria-describedby");
    expect(described, "an error's reason must reach AT — colour alone is not a message").toBeTruthy();
    expect(el.querySelector(`#${CSS.escape(described!)}`)?.textContent).toBe("File is larger than 25 MB");
    // And a tile with nothing to describe points at nothing rather than at an empty node.
    expect(mounted(<Attachment>{NAME}</Attachment>, { theme: {} }).getAttribute("aria-describedby")).toBe(null);
  });

  it("each remove control is named for the file it removes", () => {
    /* Every one of them was called "Remove", so a screen reader's control list for a strip of
       attachments was a column of identical buttons with no way to tell them apart. */
    const el = mounted(<Attachment onRemove={() => {}}>{NAME}</Attachment>, { theme: {} });
    expect(within(el, ".kui-attachment-remove").getAttribute("aria-label")).toBe(`Remove ${NAME}`);
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
  /* GLASS IS IN THE WALK NOW (audit 2026-09-02). The stylesheet's whole (0,2,0) argument is
     about beating the material's transmitted cast, which is declared at
     `.kui-surface[data-material="thin"]` — and every cell here was `solid`, the one world where
     that rule does not apply. So the rank the comment is written around was unasserted, and
     weakening the selector to `.kui-attachment` left all fifteen laws green while a glass tile
     cast three real layers. */
  for (const appearance of APPEARANCES) {
    for (const depth of DEPTHS) {
      for (const material of ["solid", ...GLASS_MATERIALS] as const) {
      it(`${appearance}/${depth}/${material}: it throws no shadow where a Card does`, () => {
        const el = mounted(<Attachment backdrop>{NAME}</Attachment>, { theme: { appearance, depth, material } });
        /* EVERY layer, not "a layer somewhere is zero". The first spelling of this law tested
           `/0px 0px 0px 0px/` against the whole string, which the POOL's own transparent first
           layer satisfies — so it passed on a tile casting two real shadows, and the agreement
           law below is what caught it. Split and check each. */
        const shadow = computed(el, "box-shadow");
        const layers = shadow === "none" ? [] : shadow.split(/,(?![^(]*\))/);
        for (const layer of layers) {
          // The material's own POOL is what a glass pane HAS, not lift the app says (§10), so
          // it is allowed through — what must not survive is a real drop.
          if (material !== "solid" && /inset/.test(layer)) continue;
          expect(layer.trim(), `a real cast survived: ${shadow}`).toMatch(
            /rgba?\([^)]*,\s*0\)\s*0px 0px 0px 0px|inset/,
          );
        }
      });
      }
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
    expect(remove.getAttribute("aria-label")).toBe(`Remove ${NAME}`);
  });
});

describe("the glass path has a reader (audit 2026-09-02)", () => {
  /* `useMaterial`, the `data-material` stamp, `useLensRef` and `GlassScope` could ALL be
     deleted and every law stayed green — four mechanisms with no reader, which is exactly the
     shape this repo found in Popover a week earlier. */
  it("a tile states its backdrop, or takes the region's, and a plain one pays nothing", () => {
    const stated = mounted(<Attachment backdrop>{NAME}</Attachment>, { theme: { material: "regular" } });
    expect(stated.getAttribute("data-material")).toBe("regular");
    expect(computed(stated, "backdrop-filter")).not.toBe("none");

    const ambient = mounted(
      <Box backdrop>
        <Attachment>{NAME}</Attachment>
      </Box>,
      { theme: { material: "regular" } },
    );
    expect(within(ambient, ".kui-attachment").getAttribute("data-material")).toBe("regular");

    // Selectivity (§10): an unmarked in-flow tile resolves solid and costs nothing.
    const plain = mounted(<Attachment>{NAME}</Attachment>, { theme: { material: "regular" } });
    expect(plain.getAttribute("data-material")).toBe(null);
    expect(computed(plain, "backdrop-filter")).toBe("none");
  });

  it("a glass tile scopes its subtree, so the remove control paints no second veil", () => {
    /* THE FIXTURE IS THE LAW HERE (audit 2026-09-02, second round). The first spelling put an
       unmarked Button inside a `backdrop` tile — which resolves solid by SELECTIVITY whether or
       not the scope exists, so deleting `GlassScope` left it green. The scope only does
       anything inside an ambient region, where the region would otherwise reach the button
       too: that is the one arrangement where a correct and a broken implementation differ.
       Notice was bitten by this exact fixture in 2026-08-21. */
    const inRegion = mounted(
      <Box backdrop>
        <Attachment onRemove={() => {}}>{NAME}</Attachment>
      </Box>,
      { theme: { material: "regular" } },
    );
    const tile = within(inRegion, ".kui-attachment");
    expect(computed(tile, "backdrop-filter"), "the tile itself is the pane").not.toBe("none");
    expect(
      computed(within(inRegion, ".kui-attachment-remove"), "backdrop-filter"),
      "one glass per stack — the region must stop at the tile's edge",
    ).toBe("none");
  });
});

describe("size prices what its own doc says it prices (audit 2026-09-02)", () => {
  /* The prop names five things and no law read any of them at any index. */
  for (const size of ["1", "2", "3", "4"] as const) {
    it(`${size}: the symbol lands on the surface icon box and the remove control stands level with a Button`, () => {
      const el = mounted(
        <Attachment size={size} icon={<svg viewBox="0 0 16 16" />} onRemove={() => {}}>
          {NAME}
        </Attachment>,
        { theme: {} },
      );
      const icon = within(el, ".kui-attachment-icon");
      // Compared as a RESOLVED length: the hook's own value is an unresolved `calc()` string,
      // so reading the token and comparing strings measures the spelling, not the box.
      const probe = document.createElement("div");
      probe.style.inlineSize = "var(--kui-sf-icon)";
      el.appendChild(probe);
      expect(computed(icon, "inline-size")).toBe(computed(probe, "inline-size"));
      probe.remove();
      const bar = mounted(<Button size={size}>Level</Button>, { theme: {} });
      expect(computed(within(el, ".kui-attachment-remove"), "block-size")).toBe(
        computed(within(bar, ".kui-button"), "block-size"),
      );
    });
  }

  it("the second line is quieter than the name, and it is the muted role", () => {
    const el = mounted(
      <Attachment meta="2.4 MB">{NAME}</Attachment>,
      { theme: {} },
    );
    const name = computed(within(el, ".kui-attachment-name"), "color");
    const meta = computed(within(el, ".kui-attachment-meta"), "color");
    expect(meta).not.toBe(name);
    expect(meta).toBe(colorOn(el, "var(--color-text-muted)"));
  });
});
