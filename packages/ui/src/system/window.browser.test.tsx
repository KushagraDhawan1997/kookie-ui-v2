/**
 * useWindowClass, mounted (§18). The viewport is resized for real, per the narrow band's
 * standard: matchMedia is the mechanism, and a law that stubs the mechanism it is testing
 * proves nothing.
 */
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { VIEWPORT as WIDE } from "../test/viewport.ts";

import { render } from "../test/browser.tsx";
import { useWindowClass, windowClassQueries, type WindowClass } from "./window.ts";



function Probe() {
  const wc = useWindowClass();
  return <output>{wc ?? "null"}</output>;
}

async function at(width: number): Promise<string> {
  await page.viewport(width, 800);
  return render(<Probe />).textContent ?? "";
}

afterEach(async () => {
  await page.viewport(WIDE.width, WIDE.height);
});

describe("the window class answers the window, live (§18)", () => {
  it("resolves each class at a width inside it — a phone, a rail, a desktop", async () => {
    expect(await at(375)).toBe("narrow");
    expect(await at(900)).toBe("regular");
    expect(await at(1280)).toBe("wide");
  });

  it("boundaries land downward — exactly 48rem is narrow, exactly 75rem is regular", async () => {
    // The same direction the narrow type band's inclusive max-width resolves, which is what
    // makes the shared 48rem one moment rather than two: at that exact width, display type
    // shrinks AND the app is narrow — never one without the other.
    expect(await at(768)).toBe("narrow");
    expect(await at(1200)).toBe("regular");
  });

  it("a mounted consumer follows a resize without remounting", async () => {
    await page.viewport(WIDE.width, WIDE.height);
    const el = render(<Probe />);
    expect(el.textContent).toBe("wide");
    await page.viewport(375, 800);
    // matchMedia change events dispatch async of the resize; poll the mounted output.
    await expect.poll(() => el.textContent).toBe("narrow");
    await page.viewport(WIDE.width, WIDE.height);
    await expect.poll(() => el.textContent).toBe("wide");
  });

  it("the classes cover every width once — no gap, no double answer", async () => {
    /**
     * REWRITTEN 2026-08-26: the first spelling could not fail, and its own comment said why
     * it should have been able to.
     *
     * It walked these six widths and asserted only `length > 0 && length < 3`. Given the
     * query SHAPE the node law pins verbatim — narrow `(max-width: A)`, regular `(min-width:
     * A) and (max-width: B)`, wide `(min-width: B)` — the three ranges always cover the line,
     * so zero matches is unreachable for any A and B; and three matches needs A === B === the
     * width, which `window.test.ts`'s ordering law already forbids. Both bounds were
     * tautologies. Measured, not argued: widening `regular` to `(min-width: 0px)` — a 768px
     * overlap with `narrow`, the exact thing the title forbids — passed all six widths.
     *
     * The comment also claimed the law "would catch a rem/px mistake the string law cannot
     * see", and it would not: `narrowMax: "48px"` passed too. What actually caught that was
     * `window.test.ts`'s `rem()` parser. Asserting the EXACT membership makes the claim true
     * — `48px` now fails here at 768, because the boundary stops being a boundary.
     *
     * A boundary width matching TWO classes is the design, not a defect: both ends are
     * inclusive, and `classify()` asks the smaller first (the sibling law above reads that
     * downward tie-break through a mounted consumer). What the queries owe is that OFF a
     * boundary exactly one answers, ON a boundary exactly the two NEIGHBOURS do, and no
     * width is ever unanswered.
     */
    const expected: Record<number, WindowClass[]> = {
      767: ["narrow"],
      768: ["narrow", "regular"],
      769: ["regular"],
      1199: ["regular"],
      1200: ["regular", "wide"],
      1201: ["wide"],
    };
    for (const [probe, want] of Object.entries(expected)) {
      const width = Number(probe);
      await page.viewport(width, 800);
      const matches = (Object.keys(windowClassQueries) as WindowClass[]).filter(
        (c) => window.matchMedia(windowClassQueries[c]).matches,
      );
      expect(
        matches,
        `${width}px must be answered by exactly [${want.join(", ")}] — it matched ` +
          `[${matches.join(", ")}]`,
      ).toEqual(want);
    }
  });
});
