/**
 * The type layer's laws (§15), same shape as surfaces.test.ts: the ramp is carried once by
 * the shared file, the components in front of it add nothing, and every value resolves
 * through a token. The mounted half — what the engine actually computes through a Theme —
 * lives in components/text/text.browser.test.tsx (the 2026-08-03 audit standard).
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { tones } from "../tokens/color-config.ts";
import { fontSize } from "../tokens/config.ts";
import { sheet } from "../test/stylesheets.ts";

const here = dirname(fileURLToPath(import.meta.url));
const stripped = sheet("system/type.css");

describe("Text and Heading own no CSS at all (§2, §15)", () => {
  it("neither ships a stylesheet — the type layer is the whole of what they look like", () => {
    expect(existsSync(join(here, "../components/text/text.css"))).toBe(false);
    expect(existsSync(join(here, "../components/heading/heading.css"))).toBe(false);
  });
});

describe("a size step joins the three paired scales at one index (§15)", () => {
  it("every step on the ramp is defined exactly once, with all three pairs", () => {
    // Driven by the config, not a local count: a tenth step added there fails here until
    // the layer carries it.
    for (let step = 1; step <= fontSize.length; step++) {
      const blocks = stripped.match(new RegExp(`\\[data-size="${step}"\\][^}]*}`, "g")) ?? [];
      expect(blocks.length).toBe(1);
      // Font-size rides through the optical-scale indirection (§15, 2026-08-08 — identity
      // at 1, the mono atoms' discount otherwise); the other two pairs never see it, which
      // is half the design: the line box and tracking are the step's own.
      expect(blocks[0]).toContain(
        `font-size: calc(var(--font-size-${step}) * var(--kui-ty-scale))`,
      );
      for (const family of ["line-height", "letter-spacing"]) {
        expect(blocks[0]).toContain(`${family}: var(--${family}-${step})`);
      }
    }
  });

  it("every weight reads its token, exactly once", () => {
    for (const weight of ["regular", "medium", "semibold", "bold"]) {
      const blocks = stripped.match(new RegExp(`\\[data-weight="${weight}"\\][^}]*}`, "g")) ?? [];
      expect(blocks.length).toBe(1);
      expect(blocks[0]).toContain(`font-weight: var(--font-weight-${weight})`);
    }
  });

  it("the emphasis ladder resolves to the three foreground roles, each rung once (§9, §15)", () => {
    for (const [rung, role] of [
      ["loud", "--color-text"],
      ["medium", "--color-text-muted"],
      ["quiet", "--color-text-faint"],
    ] as const) {
      const blocks = stripped.match(new RegExp(`\\[data-emphasis="${rung}"\\][^}]*}`, "g")) ?? [];
      expect(blocks.length).toBe(1);
      expect(blocks[0]).toContain(`color: var(${role})`);
    }
  });

  it("tone re-scopes the roles onto the ink trio, in one block naming no family (§7)", () => {
    const blocks = stripped.match(/\[data-tone\][^}]*}/g) ?? [];
    expect(blocks.length).toBe(1);
    expect(blocks[0]).toContain("--color-text: var(--tone-ink)");
    expect(blocks[0]).toContain("--color-text-muted: var(--tone-ink-muted)");
    expect(blocks[0]).toContain("--color-text-faint: var(--tone-ink-faint)");
  });

  it("tone never names a family — the indirection is the whole mechanism (§7)", () => {
    expect(stripped).not.toMatch(/\[data-tone="/);
  });

  it("no rule pairs one axis with another — they stay orthogonal (§2)", () => {
    expect(stripped).not.toMatch(
      /\[data-(size|weight|emphasis)="[a-z0-9]+"\]\[data-(size|weight|emphasis)=/,
    );
    expect(stripped).not.toMatch(
      /\[data-tone\]\[data-(size|weight|emphasis)=|\[data-(size|weight|emphasis)="[a-z0-9]+"\]\[data-tone\]/,
    );
  });
});

describe("type never takes density or pointer, and only tokens carry values (§12, §15, §16)", () => {
  it("the layer never scopes by a world — labels hold while boxes move", () => {
    expect(stripped).not.toContain("data-density");
    expect(stripped).not.toContain("data-pointer");
  });

  it("no raw px, no numeric weight, no colour literal — every value is a token", () => {
    expect(stripped).not.toMatch(/\dpx/);
    expect(stripped).not.toMatch(/font-weight:\s*\d/);
    expect(stripped).not.toContain("#");
  });

  it("names roles, never a tone family (§7, §11)", () => {
    for (const name of Object.keys(tones)) expect(stripped).not.toContain(`--${name}-`);
    expect(stripped).toContain("var(--color-text)");
  });
});
