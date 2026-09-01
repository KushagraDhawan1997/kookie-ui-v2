/**
 * The way back out of a component's page (2026-09-01).
 *
 * RENDERED, not read. The claim is not "the file exists" — it is that the control appears on
 * a component's own page and NOWHERE else, which is a decision about a regex over the
 * pathname and is exactly the sort of thing a source law agrees with while being wrong. The
 * failure it guards is a dead control: a way back on the page you would go back to.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const { DocsBack } = await import("./docs-back");

const at = (path: string) => {
  pathname = path;
  return renderToStaticMarkup(<DocsBack />);
};

beforeEach(() => {
  pathname = "/";
});

describe("the back control appears where there is somewhere to go back to", () => {
  it("a component's own page draws it, and it points at the index", () => {
    const out = at("/components/button");
    expect(out).toContain('aria-label="Back to components"');
    expect(out).toContain('href="/components"');
  });

  it("the index itself draws NOTHING — a way back to the page you are on is a dead control", () => {
    expect(at("/components")).toBe("");
  });

  it("and no other route draws it", () => {
    // Named rather than counted: each of these is a real shape the regex has to reject —
    // a chapter, the front door, and a route that merely STARTS with the same segment.
    for (const path of ["/", "/foundations/colour", "/patterns/forms", "/components/button/api"]) {
      expect(at(path), `${path} grew a back control`).toBe("");
    }
  });
});
