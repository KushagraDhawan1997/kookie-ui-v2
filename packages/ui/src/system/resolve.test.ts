/**
 * The resolver's laws (§2, §3). These are node tests because the question is what the
 * component *writes*, not what the engine then does with it — and the difference matters:
 * `var(--space-0)` and `0` both compute to `0px` for padding, so only reading the emitted
 * custom property can tell a working token from a broken one.
 */
import { describe, expect, it } from "vitest";

import { space } from "../tokens/config.ts";
import { boxProps } from "./props.ts";
import { resolveBoxProps } from "./resolve.ts";

describe("a value becomes a custom property, and nothing becomes a rule (§2)", () => {
  it("a bare index resolves through LAYOUT space — the density-aware layer, never the raw palette (§3, §12)", () => {
    expect(resolveBoxProps({ p: "4" }).style).toEqual({ "--kui-p": "var(--layout-space-4)" });
  });

  it("a raw string is passed through untouched, on the same prop", () => {
    expect(resolveBoxProps({ p: "13px" }).style).toEqual({ "--kui-p": "13px" });
  });

  it("an index outside the palette is not silently invented", () => {
    // The palette starts at 1, so `p={0}` — the ordinary way to say no padding — used to emit
    // a reference to a token that does not exist. It rendered 0px anyway, because an unset
    // custom property falls back to the property's initial value, which for padding is 0.
    // Nothing downstream could have caught it; only the emitted value shows the difference.
    expect(resolveBoxProps({ p: 0 }).style).toEqual({ "--kui-p": "0" });
    expect(resolveBoxProps({ p: String(space.length + 1) }).style).toEqual({
      "--kui-p": String(space.length + 1),
    });
  });

  it("only the space-scaled props tokenize; the pass-through ones stay literal", () => {
    expect(resolveBoxProps({ width: "4" }).style).toEqual({ "--kui-w": "4" });
  });

  it("a responsive object emits one var per tier, base included", () => {
    expect(resolveBoxProps({ gap: { initial: "2", md: "6" } }).style).toEqual({
      "--kui-g": "var(--layout-space-2)",
      "--kui-g-md": "var(--layout-space-6)",
    });
  });

  it("structural keywords ride the identical pipe, which is why this is not a spacing mechanism", () => {
    expect(resolveBoxProps({ direction: "column", columns: "repeat(3, 1fr)" }).style).toEqual({
      "--kui-fd": "column",
      "--kui-gtc": "repeat(3, 1fr)",
    });
  });
});

describe("the boundary between props and the DOM (§3)", () => {
  it("anything the table does not name reaches the element untouched", () => {
    const { style, rest } = resolveBoxProps({ p: "4", id: "probe", onClick: undefined });
    expect(style).toEqual({ "--kui-p": "var(--layout-space-4)" });
    expect(rest).toEqual({ id: "probe", onClick: undefined });
  });

  it("a conditional prop that resolved to nothing emits no declaration", () => {
    // The type admits undefined on purpose: `p={cond ? "4" : undefined}` is how a conditional
    // prop is written, and a type that refused it would send people to the escape hatch.
    expect(resolveBoxProps({ p: undefined, gap: undefined }).style).toEqual({});
  });
});

describe("no row emits a shorthand into a space another row also feeds (§2, requirement 3)", () => {
  // props.ts has carried the words "Never a shorthand" since 2026-08-02, when padding was
  // found emitting `padding:` in front of its own longhands. Nothing enforced it, and two
  // rows went on violating it: `inset` and `overflow` both shipped as dead no-ops, because a
  // shorthand followed by a longhand whose var is unset does not degrade — the longhand is
  // invalid at computed-value time and resets the property to its INITIAL value, beating the
  // shorthand that preceded it.
  //
  // A shorthand is legal only where no other row feeds any longhand it would swallow, which is
  // why `grid-area` stays: nothing else writes grid-row-start.
  const EXPANDS: Record<string, string[]> = {
    inset: ["top", "right", "bottom", "left"],
    overflow: ["overflow-x", "overflow-y"],
    padding: ["padding-block-start", "padding-block-end", "padding-inline-start", "padding-inline-end"],
    margin: ["margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end"],
    gap: ["row-gap", "column-gap"],
    "grid-area": ["grid-row-start", "grid-row-end", "grid-column-start", "grid-column-end"],
    flex: ["flex-grow", "flex-shrink", "flex-basis"],
  };

  it("holds for every row in the table", () => {
    const fedBy = new Map<string, string[]>();
    for (const [name, def] of Object.entries(boxProps)) {
      for (const prop of def.css) (fedBy.get(prop) ?? fedBy.set(prop, []).get(prop)!).push(name);
    }
    for (const [prop, names] of fedBy) {
      const swallowed = EXPANDS[prop];
      if (!swallowed) continue;
      const collisions = swallowed.filter((longhand) => fedBy.has(longhand));
      expect(
        collisions,
        `${names.join("/")} emits the shorthand \`${prop}\`, which would be reset by ${collisions.join(", ")}`,
      ).toEqual([]);
    }
  });

  it("and the two that were broken now feed their longhands through the precedence chain", () => {
    expect(boxProps.inset.css).toEqual(["top", "right", "bottom", "left"]);
    expect(boxProps.overflow.css).toEqual(["overflow-x", "overflow-y"]);
    for (const [shorthand, longhands] of [
      [boxProps.inset, [boxProps.top, boxProps.right, boxProps.bottom, boxProps.left]],
      [boxProps.overflow, [boxProps.overflowX, boxProps.overflowY]],
    ] as const) {
      for (const longhand of longhands) expect(longhand.precedence).toBeGreaterThan(shorthand.precedence);
    }
  });
});
