/**
 * Progress's laws, mounted (§11, §19). Written to the 2026-08-03 standard: computed values
 * through a real `<Theme>`, both appearances wherever colour is the claim, and every law
 * falsified against a sabotaged stylesheet before it was trusted.
 *
 * The shape of what is asserted follows the audit lesson twice over. The colour laws compare
 * against a SECOND value resolved in the same scope rather than against a token name, because
 * a law that greps for `--color-track` proves the name is present, which is never the thing in
 * doubt. The geometry laws walk the density x pointer cells rather than checking the default
 * path, because "no axis reaches this" is a claim about the cells, not about one of them.
 */
import { describe, expect, it } from "vitest";

import {
  APPEARANCES,
  DENSITIES,
  POINTERS,
  colorOn,
  computed,
  mounted,
  tokenOn,
} from "../../test/browser.tsx";
import { Button } from "../button/button.tsx";
import { Flex } from "../flex/flex.tsx";
import { Stack } from "../stack/stack.tsx";
import { Progress } from "./progress.tsx";

const RADIUS_LEVELS = ["none", "small", "medium", "large", "full"] as const;

/** The two parts, from one mount. `select` is loud, so a renamed class fails the law. */
function parts(ui: React.ReactElement, theme: Parameters<typeof mounted>[1] = { theme: {} }) {
  const root = mounted(ui, theme);
  const fill = root.querySelector<HTMLElement>(".kui-progress-fill");
  if (!fill) throw new Error("no .kui-progress-fill — the indicator is the law's subject");
  return { root, fill };
}

describe("the well is neutral and the level is the accent, in both appearances (§11)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: the well paints --color-track, the role minted for this pair`, () => {
      const { root } = parts(<Progress value={40} />, { theme: { appearance } });
      expect(computed(root, "background-color")).toBe(colorOn(root, "var(--color-track)"));
      // The well is NOT a dressed surface — that is the whole of §19's instrument rule as a
      // computed value. If this ever equals the seal, the bar has joined the look axis.
      expect(computed(root, "background-color")).not.toBe(colorOn(root, "var(--color-surface)"));
    });

    it(`${appearance}: the fill paints --tone-solid, and the stamp makes that ACCENT`, () => {
      const { root, fill } = parts(<Progress value={40} />, { theme: { appearance } });
      expect(computed(fill, "background-color")).toBe(colorOn(fill, "var(--tone-solid)"));
      // Resolved through the stamp, not just through the indirection: `data-tone="accent"` on
      // the root is what makes --tone-solid mean accent's solid, and asserting only the role
      // would pass on a bar that had lost the attribute and fallen back to neutral.
      expect(computed(fill, "background-color")).toBe(colorOn(root, "var(--accent-solid)"));
      expect(root.dataset.tone).toBe("accent");
    });

    it(`${appearance}: the well never tints with the fill's family`, () => {
      // "Track low" means neutral THROUGH a role (§11): the element stamps accent, so a well
      // that read the tone indirection would go faintly accent-coloured and nobody would call
      // it a bug. The two parts must resolve different families.
      const { root, fill } = parts(<Progress value={40} />, { theme: { appearance } });
      expect(computed(root, "background-color")).not.toBe(computed(fill, "background-color"));
      expect(computed(root, "background-color")).not.toBe(colorOn(root, "var(--tone-soft)"));
    });
  }
});

describe("one thickness, and no axis reaches it (§11 — the size question, recorded open)", () => {
  it("the bar is --progress-track tall in every density x pointer cell", () => {
    // The claim the absent size axis rests on: density moves control heights and pointer moves
    // the whole coarse world, and neither may move a bar. Walked rather than sampled — a
    // default-path check would have passed on a token that WAS re-priced in a scope.
    for (const pointer of POINTERS) {
      for (const density of DENSITIES) {
        const { root } = parts(<Progress value={40} />, { theme: { density, pointer } });
        expect(
          computed(root, "height"),
          `${pointer}/${density} moved the bar's thickness`,
        ).toBe(tokenOn(root, "--progress-track"));
      }
    }
  });

  it("the value is one number, not a ladder — the token resolves identically in all six cells", () => {
    // The second half, and the one that would actually catch a re-pricing: the law above
    // compares the box to the token in the SAME scope, so a scope that moved both would pass
    // it. This compares the token across scopes.
    const seen = new Set<string>();
    for (const pointer of POINTERS) {
      for (const density of DENSITIES) {
        const { root } = parts(<Progress value={40} />, { theme: { density, pointer } });
        seen.add(tokenOn(root, "--progress-track"));
      }
    }
    expect([...seen]).toHaveLength(1);
  });

  it("a squeezed column never thins it — the thickness is the information", () => {
    // Two 6px bars plus a gap into 20px of column: the shortfall is real, and a bar that
    // took its share of it would report the same value at a different weight.
    const col = mounted(
      <Stack gap="4" style={{ height: "20px", width: "300px" }}>
        <Progress value={40} />
        <Progress value={60} />
      </Stack>,
      { theme: {} },
    );
    const bars = [...col.querySelectorAll<HTMLElement>(".kui-progress")];
    expect(bars).toHaveLength(2);
    for (const bar of bars) {
      expect(bar.getBoundingClientRect().height).toBeCloseTo(
        parseFloat(tokenOn(bar, "--progress-track")),
        1,
      );
    }
  });

  it("...but a squeezed ROW still fits it — the floor is on the block axis, not on both", () => {
    // The law's other direction, and the one that was missing: `flex: none` held the
    // thickness AND froze a 100%-of-container inline basis, so the bar overflowed a flex row
    // by 81px in the first cut. A one-sided law passed it. A bar with no intrinsic width has
    // to be squeezable in the axis it has no opinion about.
    const row = mounted(
      <Flex gap="4" style={{ width: "300px" }}>
        <Button>Cancel</Button>
        <Progress value={40} />
      </Flex>,
      { theme: {} },
    );
    const bar = row.querySelector<HTMLElement>(".kui-progress")!;
    const button = row.querySelector<HTMLElement>(".kui-button")!;
    expect(button.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(bar.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right + 0.5,
    );
    // ...and it is still a bar, not a sliver squeezed to nothing.
    expect(bar.getBoundingClientRect().width).toBeGreaterThan(100);
    expect(bar.getBoundingClientRect().height).toBeCloseTo(
      parseFloat(tokenOn(bar, "--progress-track")),
      1,
    );
  });
});

describe("the cap is the capsule, and `none` still squares it (§6, audit R8's rule inherited)", () => {
  for (const level of RADIUS_LEVELS) {
    it(`radius="${level}": ${level === "none" ? "square" : "half the bar's own thickness"}`, () => {
      const { root } = parts(<Progress value={40} />, { theme: { radius: level } });
      const thickness = parseFloat(tokenOn(root, "--progress-track"));
      const corner = parseFloat(computed(root, "border-top-left-radius"));
      if (level === "none") {
        expect(corner).toBe(0);
      } else {
        // The min() must SATURATE at every level that has a corner — that is the claim the
        // stylesheet's comment makes, and the one cell where it could fail is `small`, whose
        // control radius is closest to half the bar.
        expect(corner).toBeCloseTo(thickness / 2, 3);
      }
    });
  }

  it("the levels are really different — otherwise the law above proves nothing", () => {
    // The negative control. Without it, a Theme that ignored `radius` entirely would satisfy
    // every cell above by accident: the scan-law vacuity lesson (Slider, 2026-08-06).
    const none = parts(<Progress value={40} />, { theme: { radius: "none" } });
    const large = parts(<Progress value={40} />, { theme: { radius: "large" } });
    expect(computed(none.root, "border-top-left-radius")).not.toBe(
      computed(large.root, "border-top-left-radius"),
    );
  });
});

describe("outside the look axis, whole (§19 — the instrument rule)", () => {
  it("every part is byte-identical across outlined and filled, in both appearances", () => {
    // Slider's and Switch's negative law, third instance. §19's membership test has a
    // mechanical half — a family is dressed because its sheet CONSUMES the roles — so the
    // proof is that flipping the axis moves nothing a user can see.
    for (const appearance of APPEARANCES) {
      const outlined = parts(<Progress value={40} />, { theme: { appearance, look: "outlined" } });
      const filled = parts(<Progress value={40} />, { theme: { appearance, look: "filled" } });
      for (const prop of ["background-color", "border-top-left-radius", "height", "border-width"]) {
        expect(
          computed(filled.root, prop),
          `${appearance}: the well's ${prop} moved with the look axis`,
        ).toBe(computed(outlined.root, prop));
      }
      expect(computed(filled.fill, "background-color")).toBe(
        computed(outlined.fill, "background-color"),
      );
    }
  });

  it("the axis really is live in this Theme — the control that keeps the law honest", () => {
    // Same vacuity guard: if `look` did nothing at all, the law above would pass on a bar that
    // HAD joined the axis. A field is a dressed family, so its fill must move.
    const outlined = mounted(<div className="kui-field" />, { theme: { look: "outlined" } });
    const filled = mounted(<div className="kui-field" />, { theme: { look: "filled" } });
    expect(colorOn(filled, "var(--look-field-fill)")).not.toBe(
      colorOn(outlined, "var(--look-field-fill)"),
    );
  });
});

describe("the value is geometry, and AT reads it (Base UI's half, wired by us)", () => {
  it("a determinate bar fills exactly its fraction of the well", () => {
    const { root, fill } = parts(<Progress value={40} />);
    const well = root.getBoundingClientRect().width;
    expect(well).toBeGreaterThan(100); // the measurement is real, not a collapsed box
    expect(fill.getBoundingClientRect().width).toBeCloseTo(well * 0.4, 0);
  });

  it("min and max move the fraction, so the bar is not reading `value` as a percentage", () => {
    const { root, fill } = parts(<Progress value={5} min={0} max={10} />);
    expect(fill.getBoundingClientRect().width).toBeCloseTo(
      root.getBoundingClientRect().width * 0.5,
      0,
    );
  });

  it("the root is the progressbar, and the fill is decoration", () => {
    const { root, fill } = parts(<Progress value={40} aria-label="Uploading" />);
    expect(root.getAttribute("role")).toBe("progressbar");
    expect(root.getAttribute("aria-valuenow")).toBe("40");
    expect(root.getAttribute("aria-label")).toBe("Uploading");
    expect(fill.getAttribute("role")).toBeNull();
  });

  it("the fill is clipped by the well, never spilling past its own corner", () => {
    const { root } = parts(<Progress value={40} />);
    expect(computed(root, "overflow-x")).toBe("hidden");
  });
});

describe("indeterminate is content, not a state change (§8's line, held)", () => {
  it("a null value sweeps, and a measured one does not", () => {
    const busy = parts(<Progress value={null} />);
    const measured = parts(<Progress value={40} />);
    expect(busy.fill.dataset.indeterminate).toBe("");
    expect(computed(busy.fill, "animation-name")).toBe("kui-progress-sweep");
    expect(computed(busy.fill, "animation-iteration-count")).toBe("infinite");
    // The other half, and the one that would catch a selector typo: a determinate fill must
    // be perfectly still. `animation-name` on a rule that never matched is `none`.
    expect(computed(measured.fill, "animation-name")).toBe("none");
  });

  it("a sweeping segment has a height and a width — an animated nothing is still nothing", () => {
    // The failure this exists for: the determinate geometry is Base UI's INLINE style, and an
    // indeterminate indicator gets `{}` — so every dimension has to come from the stylesheet,
    // and a bar that reported "busy" to AT while painting zero pixels would satisfy every
    // other law in this file.
    const { root, fill } = parts(<Progress value={null} />);
    expect(parseFloat(computed(fill, "height"))).toBeCloseTo(
      parseFloat(computed(root, "height")),
      1,
    );
    expect(parseFloat(computed(fill, "width"))).toBeGreaterThan(0);
    expect(computed(fill, "position")).toBe("absolute");
  });

  it("the root still reports indeterminate to AT — no aria-valuenow to read", () => {
    const { root } = parts(<Progress value={null} aria-label="Loading" />);
    expect(root.getAttribute("role")).toBe("progressbar");
    expect(root.getAttribute("aria-valuenow")).toBeNull();
  });
});

describe("a bar is not a control (§4, §16 — the mechanisms it must NOT have)", () => {
  it("no target expansion: the box is the paint, in the coarse world too", () => {
    // Every other §16 consumer grows a hit area. This one must not: the reach would sit over
    // neighbouring content to serve a pointer that never arrives.
    const { root } = parts(<Progress value={40} />, { theme: { pointer: "coarse" } });
    const before = getComputedStyle(root, "::after");
    expect(before.content).toBe("none");
    expect(computed(root, "cursor")).not.toBe(tokenOn(root, "--cursor-button"));
  });

  it("no shadow of its own — depth is the app's, and a bar is not a plane (§5)", () => {
    for (const surfaces of ["flat", "elevated"] as const) {
      const { root } = parts(<Progress value={40} />, { theme: { surfaces } });
      expect(computed(root, "box-shadow"), `${surfaces} lifted the bar`).toBe("none");
    }
  });
});
