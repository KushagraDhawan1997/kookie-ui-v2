/**
 * Law tests for the token layer (ENGINEERING.md §6). These assert the system's
 * invariants — step counts, the size-index join, reference-not-coincidence, and
 * §12's multiplier table — never rendered values. No snapshots.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { density, fontSize, letterSpacing, lineHeight, radius, space } from "./config.ts";
import { generateTokens } from "./generate.ts";

const css = generateTokens();
const increasing = (xs: readonly number[]) => xs.every((v, i) => i === 0 || v > xs[i - 1]!);

/** Reads a declaration out of a scope: `:root` by default, or a density block. */
function declaration(name: string, level: "default" | "compact" | "comfortable" = "default") {
  const scope =
    level === "default"
      ? css.slice(css.indexOf(":root {"), css.indexOf("}"))
      : css.slice(css.indexOf(`[data-density="${level}"] {`));
  return scope.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];
}

describe("step counts are set per family, not copied across families (§6)", () => {
  it("space spans 12 steps, radius 7, type 9, controls 4 at every density", () => {
    expect(space).toHaveLength(12);
    expect(radius).toHaveLength(7);
    expect(fontSize).toHaveLength(9);
    for (const set of Object.values(density)) {
      for (const family of [set.height, set.px, set.gap, set.radius]) {
        expect(family).toHaveLength(4);
      }
    }
  });
});

describe("palettes are monotonic", () => {
  it("every scale strictly increases", () => {
    for (const scale of [space, radius, fontSize, lineHeight]) {
      expect(increasing(scale)).toBe(true);
    }
  });
});

describe("type tokens are paired, not derived (§15)", () => {
  it("every font size has a line height and letter spacing", () => {
    expect(lineHeight).toHaveLength(fontSize.length);
    expect(letterSpacing).toHaveLength(fontSize.length);
    for (let i = 1; i <= fontSize.length; i++) {
      expect(declaration(`font-size-${i}`)).toBeDefined();
      expect(declaration(`line-height-${i}`)).toBeDefined();
      expect(declaration(`letter-spacing-${i}`)).toBeDefined();
    }
  });
});

describe("the size index joins a coherent set (§4)", () => {
  it("every size 1-4 defines height, inline padding, gap, and radius together", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-height-${size}`)).toBeDefined();
      expect(declaration(`control-px-${size}`)).toBeDefined();
      expect(declaration(`control-gap-${size}`)).toBeDefined();
      expect(declaration(`radius-control-${size}`)).toBeDefined();
    }
  });
});

describe("semantic tokens reference palette tokens, never restate numbers (§6)", () => {
  it("control and surface radii resolve through var(--radius-N)", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`radius-control-${size}`)).toMatch(/^var\(--radius-\d\)$/);
    }
    expect(declaration("radius-surface")).toMatch(/^var\(--radius-\d\)$/);
    expect(declaration("radius-overlay")).toMatch(/^var\(--radius-\d\)$/);
  });

  it("control padding and gap resolve through the space palette", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-px-${size}`)).toContain("var(--space-");
      expect(declaration(`control-gap-${size}`)).toContain("var(--space-");
    }
  });
});

describe("density is a designed set, not a multiplier (§12)", () => {
  it("declares the whole control family at every level", () => {
    for (const level of ["compact", "comfortable"] as const) {
      for (let size = 1; size <= 4; size++) {
        for (const family of ["control-height", "control-px", "control-gap", "radius-control"]) {
          expect(declaration(`${family}-${size}`, level)).toBeDefined();
        }
      }
    }
  });

  it("orders compact < default < comfortable for a given size, and nothing else", () => {
    for (let i = 0; i < 4; i++) {
      expect(density.compact.height[i]!).toBeLessThan(density.default.height[i]!);
      expect(density.default.height[i]!).toBeLessThan(density.comfortable.height[i]!);
    }
  });

  it("keeps every level's own ladder increasing across sizes", () => {
    for (const set of Object.values(density)) {
      expect(increasing(set.height)).toBe(true);
    }
  });

  it("carries no density multiplier anywhere", () => {
    expect(css).not.toContain("var(--density)");
  });
});

describe("multiplier wiring matches §12's table", () => {
  it("type takes scale, never density", () => {
    for (let i = 1; i <= fontSize.length; i++) {
      for (const family of [`font-size-${i}`, `line-height-${i}`]) {
        expect(declaration(family)).toContain("var(--scale)");
        expect(declaration(family)).not.toContain("var(--density)");
      }
    }
  });

  it("the space palette takes scale, never density — compact must not shrink page gutters", () => {
    for (let i = 1; i <= space.length; i++) {
      expect(declaration(`space-${i}`)).toContain("var(--scale)");
      expect(declaration(`space-${i}`)).not.toContain("var(--density)");
    }
  });

  it("control height takes scale; padding and gap inherit it through the space palette", () => {
    for (let size = 1; size <= 4; size++) {
      expect(declaration(`control-height-${size}`)).toContain("var(--scale)");
      expect(declaration(`control-px-${size}`)).toMatch(/^var\(--space-\d+\)$/);
      expect(declaration(`control-gap-${size}`)).toMatch(/^var\(--space-\d+\)$/);
    }
  });

  it("radius takes scale and radius-factor, never density", () => {
    for (let i = 0; i < radius.length; i++) {
      expect(declaration(`radius-${i}`)).toContain("var(--scale)");
      expect(declaration(`radius-${i}`)).toContain("var(--radius-factor)");
      expect(declaration(`radius-${i}`)).not.toContain("var(--density)");
    }
  });
});

describe("generated output is not hand-edited (ENGINEERING §7)", () => {
  it("committed tokens.css matches the generator", () => {
    const committed = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "tokens.css"), "utf8");
    expect(committed).toBe(css);
  });

  it("carries a generated-file header naming its source", () => {
    expect(css).toContain("GENERATED FILE");
    expect(css).toContain("src/tokens/config.ts");
  });
});
