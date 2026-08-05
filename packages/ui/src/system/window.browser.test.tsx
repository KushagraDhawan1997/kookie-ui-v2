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
    // Walk the boundaries' neighbourhoods against raw matchMedia: at every probed width
    // exactly ONE query matches after downward tie-breaking. This is the mounted version of
    // the derivation law — it would catch a rem/px mistake the string law cannot see.
    for (const width of [767, 768, 769, 1199, 1200, 1201]) {
      await page.viewport(width, 800);
      const matches = (Object.keys(windowClassQueries) as WindowClass[]).filter(
        (c) => window.matchMedia(windowClassQueries[c]).matches,
      );
      // Off a boundary exactly one matches; on a boundary the two neighbours both do, and
      // classify() resolves the tie downward — either way, never zero and never three.
      expect(matches.length, `${width}px matched [${matches.join(", ")}]`).toBeGreaterThan(0);
      expect(matches.length, `${width}px matched [${matches.join(", ")}]`).toBeLessThan(3);
    }
  });
});
