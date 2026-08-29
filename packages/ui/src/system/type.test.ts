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
import { fontSize, fontWeight } from "../tokens/config.ts";
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
    // DERIVED from config, not restated (2026-08-09): the list was a literal four here, so
    // deleting `bold` from the set left this law still demanding a rule for it — a law that
    // fails on the fix rather than on the defect. Now the set is the config's.
    for (const weight of Object.keys(fontWeight)) {
      const blocks = stripped.match(new RegExp(`\\[data-weight="${weight}"\\][^}]*}`, "g")) ?? [];
      expect(blocks.length).toBe(1);
      expect(blocks[0]).toContain(`font-weight: var(--font-weight-${weight})`);
    }
  });

  it("and NO weight outside the set has a rule — bold is refused, not merely unused (§15)", () => {
    // The other direction, and the one that matters after a removal: re-adding a `bold` block
    // (or any weight the config does not name) has to fail, or the refusal holds by memory.
    const declared = new Set(Object.keys(fontWeight));
    const inSheet = [...stripped.matchAll(/\[data-weight="([a-z]+)"\]/g)].map((m) => m[1]!);
    expect([...new Set(inSheet)].filter((w) => !declared.has(w))).toEqual([]);
    expect(declared.has("bold"), "bold is back in the config — §15 refused it").toBe(false);
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

describe("the inert atoms have ONE identity, and the third member is what moved it here (§11, §15)", () => {
  // The family rule (LOG 2026-08-05, TextArea's): the second member self-keys, the third
  // promotes. Code shipped the fill, the corner and the optical-scale application; Kbd
  // restated all three verbatim while it was the second; Badge landed 2026-08-23 as the third
  // and they moved into `.kui-atom`, with the one-line box Kbd designed moving into
  // `.kui-atom-box` beside it.
  //
  // This law is what makes the promotion mean anything. A member that quietly re-declared the
  // fill would look right for exactly as long as its copy happened to agree, which is the
  // drift the promotion exists to end — and no mounted law can catch it, because a copy that
  // agrees computes the same value.
  const ATOMS = ["code", "kbd", "badge"] as const;

  it("the shared identity is declared once, in the type layer", () => {
    for (const [name, decl] of [
      // The fill's spelling gained one level of indirection when Badge grew `backdrop`
      // (2026-08-26): the derived name is unset at rest and the fallback IS the old value,
      // so the identity this law protects — one declaration, in the type layer — is intact.
      ["the fill", "background-color: var(--kui-atom-fill, var(--tone-soft))"],
      ["the corner", "border-radius: var(--radius-atom)"],
      ["the inherited-size arm", "font-size: calc(1em * var(--kui-ty-scale))"],
    ] as const) {
      expect(stripped, `${name} is not declared in the type layer`).toContain(decl);
    }
  });

  it("and no atom's own stylesheet declares any of it a second time", () => {
    for (const atom of ATOMS) {
      const own = sheet(`components/${atom}/${atom}.css`);
      for (const property of ["background-color", "border-radius"]) {
        expect(own, `${atom}.css re-declares ${property} — the promotion has a second author`)
          .not.toMatch(new RegExp(`${property}\\s*:`));
      }
      // The font-size arm is the subtler one: a member re-stating `calc(1em * ...)` would be
      // re-implementing the inherited-size arm rather than reading it.
      expect(own, `${atom}.css re-declares the inherited-size arm`).not.toContain("font-size:");
    }
  });

  it("every atom declares its OWN discount, and no two of them share the token", () => {
    // The atoms deliberately do not share one factor: mono's is a metric correction, the cap's
    // is about symbols drawing full-size in the sans, the badge's is about rank. They may
    // coincide numerically — `--kbd-scale` and `--badge-scale` do today — and they must stay
    // separately correctable, which is exactly what a shared token would take away.
    const factors = ATOMS.map((atom) => {
      const own = sheet(`components/${atom}/${atom}.css`);
      const m = own.match(/--kui-ty-scale:\s*var\((--[\w-]+)\)/);
      expect(m, `${atom}.css states no optical scale of its own`).not.toBeNull();
      return m![1]!;
    });
    expect(new Set(factors).size, `two atoms read one scale token: ${factors.join(", ")}`).toBe(
      factors.length,
    );
  });

  /** Wears the class as a TOKEN. `toContain("kui-atom")` is satisfied by `kui-atom-box`,
   *  which is how this law came to assert neither side of the partition it is named for
   *  (found 2026-08-26): the substring is true of a member and of a non-member alike. */
  const wears = (source: string, cls: string): boolean =>
    new RegExp(`${cls}(?![-\\w])`).test(source);

  it("the one-line box is the type layer's, and only the members that ARE boxes wear it", () => {
    // Code is the deliberate non-member: an inline chip belongs to its sentence and wraps with
    // it. That is why the box is a second class rather than a stand-down — a member opts in,
    // and nothing has to opt out.
    //
    // BOTH SIDES ARE ASSERTED SINCE 2026-08-26, and neither was before. The law read
    // `toContain("kui-atom")` — true of every atom whichever classes it wears — and never
    // named `kui-atom-box` at all, so adding the box to Code's className passed here (code.css
    // still has no `block-size`; the .tsx still contains the substring) and passed everywhere
    // else too: `code.browser.test.tsx` reads no geometry, no `display` and no `white-space`,
    // and Code's own `padding-inline` still wins the (0,1,0) tie on source order. Every inline
    // `<Code>` would have become `display: inline-flex; block-size: 1lh; white-space: nowrap`,
    // destroying the one property code.css spends ten lines arguing for, with the suite green.
    const BOXES: readonly (typeof ATOMS)[number][] = ["kbd", "badge"];

    expect(stripped).toContain("block-size: 1lh");
    expect(sheet("components/code/code.css"), "the chip grew a box").not.toContain("block-size");

    // The partition has to have two sides, or "only the members that ARE boxes" says nothing.
    expect(
      ATOMS.filter((atom) => !BOXES.includes(atom)),
      "every atom is a box — the `only` half of this law has nothing left to forbid, so either " +
        "the family changed on purpose or a non-member was quietly added to BOXES",
    ).not.toEqual([]);

    for (const atom of ATOMS) {
      // `sheet()` on a .tsx deliberately: it strips block comments, so a JSDoc paragraph
      // about the atom family cannot satisfy a law about the className the component ships.
      const source = sheet(`components/${atom}/${atom}.tsx`);
      expect(
        wears(source, "kui-atom"),
        `${atom}.tsx does not wear the shared atom identity`,
      ).toBe(true);
      expect(
        wears(source, "kui-atom-box"),
        BOXES.includes(atom)
          ? `${atom} IS a box and does not wear \`kui-atom-box\` — its height, its centring and ` +
            `its 1.6em floor live in that class and nowhere else`
          : `${atom} wears \`kui-atom-box\` and is not a box — a one-line inline-flex chip stops ` +
            `belonging to its sentence and stops wrapping with it (code.css's own argument)`,
      ).toBe(BOXES.includes(atom));
    }
  });
});

describe("the Firefox half of the smoothing pair, which no Chromium law can read (§15)", () => {
  it("`.kui-theme` declares BOTH smoothing properties, not just the WebKit one", () => {
    // WHY THIS IS A NODE LAW and its sibling in text.browser.test.tsx is not. The mounted law
    // is the standard for an appearance rule and it reads `-webkit-font-smoothing` through a
    // real Theme — but `-moz-osx-font-smoothing` is not a property Chromium exposes to
    // getComputedStyle at all. It resolves to the empty string there, so the browser cannot
    // tell a stylesheet that declares it from one that does not, and a law asserting it in
    // that engine would fail against correct CSS.
    //
    // So the guarantee is split by what each instrument can actually see: the browser proves
    // the value the engine resolves, and this reads the declaration the generator emitted. A
    // rule that set only the WebKit property would leave Firefox on macOS rendering subpixel,
    // half a weight heavier than the ladder was drawn, with the whole browser suite green.
    expect(
      stripped,
      "the WebKit property is missing from type.css",
    ).toContain("-webkit-font-smoothing: antialiased");
    expect(
      stripped,
      "the Firefox property is missing — this is the half no mounted law can catch",
    ).toContain("-moz-osx-font-smoothing: grayscale");
  });
});
