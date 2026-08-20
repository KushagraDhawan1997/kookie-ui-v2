/**
 * Window size class laws (§18) — the derivation side. The mounted behaviour (what class a
 * real viewport resolves to, and that resize moves it) lives in window.browser.test.tsx;
 * these pin what must be true of the CONFIG and the derived queries, where the mistakes
 * that survive a browser test would live.
 */
import { describe, expect, it } from "vitest";

import { narrowMedia, windowClass } from "../tokens/config.ts";
import { generateTokens } from "../tokens/generate.ts";
import { windowClassQueries } from "./window.ts";

// Imported and generated ONCE, at module scope (2026-08-20). This law used to `await
// import()` the generator inside its own body, which put the transform AND the ~4s run inside
// its 5s timeout — measured at 4.05s on an idle machine, so it answered here and TIMED OUT on
// a loaded runner, which is what CI reported. The generator is pure; the cost belongs in the
// collection phase, where the runner accounts for it rather than failing a law for it.
const css = generateTokens();

describe("window size classes: three, derived from two numbers (§18)", () => {
  it("the narrow boundary IS the narrow type band's number — one word, one moment", () => {
    // Not "the same value" — the same DERIVATION: narrowMedia is built from
    // windowClass.narrowMax in config.ts, so this law fails only if someone breaks the
    // derivation apart, which is exactly the drift it exists to forbid.
    expect(narrowMedia).toBe(`(max-width: ${windowClass.narrowMax})`);
    expect(windowClassQueries.narrow).toBe(narrowMedia);
  });

  it("the queries are exhaustive and disjoint by construction — both spell the same two numbers", () => {
    // regular is "not narrow, not wide" spelled with the identical boundary strings, so a
    // threshold correction cannot open a gap or an overlap between classes.
    expect(windowClassQueries.regular).toBe(
      `(min-width: ${windowClass.narrowMax}) and (max-width: ${windowClass.regularMax})`,
    );
    expect(windowClassQueries.wide).toBe(`(min-width: ${windowClass.regularMax})`);
  });

  it("the boundaries are ordered, in rem, and width-only — never a device fact", () => {
    const rem = (v: string) => {
      const m = v.match(/^([\d.]+)rem$/);
      if (!m) throw new Error(`${v} is not a rem length`);
      return parseFloat(m[1]!);
    };
    expect(rem(windowClass.narrowMax)).toBeLessThan(rem(windowClass.regularMax));
    for (const q of Object.values(windowClassQueries)) {
      expect(q).not.toContain("pointer");
      expect(q).not.toContain("device");
      expect(q).not.toContain("height");
    }
  });

  it("no token answers the window class — a class picks a shell, never a value (§18)", () => {
    // The one viewport signal must not become a styling axis by the back door: no emitted
    // declaration block keys on a window class. If this ever fails, someone taught tokens
    // to read the window, which is §16's rejected "width as a signal for geometry".
    expect(css).not.toContain("data-window");
    expect(css).not.toContain(windowClassQueries.regular);
    expect(css).not.toContain(`(min-width: ${windowClass.regularMax})`);
  });
});
