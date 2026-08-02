/**
 * The resolver's laws (§2, §3). These are node tests because the question is what the
 * component *writes*, not what the engine then does with it — and the difference matters:
 * `var(--space-0)` and `0` both compute to `0px` for padding, so only reading the emitted
 * custom property can tell a working token from a broken one.
 */
import { describe, expect, it } from "vitest";

import { space } from "../tokens/config.ts";
import { resolveBoxProps } from "./resolve.ts";

describe("a value becomes a custom property, and nothing becomes a rule (§2)", () => {
  it("a bare index resolves through the palette", () => {
    expect(resolveBoxProps({ p: "4" }).style).toEqual({ "--kk-p": "var(--space-4)" });
  });

  it("a raw string is passed through untouched, on the same prop", () => {
    expect(resolveBoxProps({ p: "13px" }).style).toEqual({ "--kk-p": "13px" });
  });

  it("an index outside the palette is not silently invented", () => {
    // The palette starts at 1, so `p={0}` — the ordinary way to say no padding — used to emit
    // a reference to a token that does not exist. It rendered 0px anyway, because an unset
    // custom property falls back to the property's initial value, which for padding is 0.
    // Nothing downstream could have caught it; only the emitted value shows the difference.
    expect(resolveBoxProps({ p: 0 }).style).toEqual({ "--kk-p": "0" });
    expect(resolveBoxProps({ p: String(space.length + 1) }).style).toEqual({
      "--kk-p": String(space.length + 1),
    });
  });

  it("only the space-scaled props tokenize; the pass-through ones stay literal", () => {
    expect(resolveBoxProps({ width: "4" }).style).toEqual({ "--kk-w": "4" });
  });

  it("a responsive object emits one var per tier, base included", () => {
    expect(resolveBoxProps({ gap: { initial: "2", md: "6" } }).style).toEqual({
      "--kk-g": "var(--space-2)",
      "--kk-g-md": "var(--space-6)",
    });
  });

  it("structural keywords ride the identical pipe, which is why this is not a spacing mechanism", () => {
    expect(resolveBoxProps({ direction: "column", columns: "repeat(3, 1fr)" }).style).toEqual({
      "--kk-fd": "column",
      "--kk-gtc": "repeat(3, 1fr)",
    });
  });
});

describe("the boundary between props and the DOM (§3)", () => {
  it("anything the table does not name reaches the element untouched", () => {
    const { style, rest } = resolveBoxProps({ p: "4", id: "probe", onClick: undefined });
    expect(style).toEqual({ "--kk-p": "var(--space-4)" });
    expect(rest).toEqual({ id: "probe", onClick: undefined });
  });

  it("a conditional prop that resolved to nothing emits no declaration", () => {
    // The type admits undefined on purpose: `p={cond ? "4" : undefined}` is how a conditional
    // prop is written, and a type that refused it would send people to the escape hatch.
    expect(resolveBoxProps({ p: undefined, gap: undefined }).style).toEqual({});
  });
});
