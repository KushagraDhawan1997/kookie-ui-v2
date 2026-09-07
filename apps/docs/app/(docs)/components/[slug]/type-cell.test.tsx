/**
 * The legal values reach a READER, not just the artifact (2026-09-07, §47).
 *
 * `api.test.ts` proves the generated tables carry each axis's own values in its own order, and
 * `propType` is the one home that turns them into a type cell. Neither says the cell is ever
 * rendered: with both call sites reverted to `prop.type` — the alias this work exists to
 * replace — the whole docs suite stayed green. A law one indirection short of the thing that
 * can be wrong is this repo's most-recorded defect, and it was here in the change that fixed
 * the fact it was guarding.
 *
 * TWO READERS, ONE ARM EACH, and neither of them names a value: the expectation is
 * `propType()`'s own answer, so what is asserted is that the page and the twin go THROUGH the
 * one home rather than around it. That the answer is the package's own axis is the other law's
 * claim, and the two compose.
 */
import { describe, expect, it, vi } from "vitest";

import { renderToStaticMarkup } from "react-dom/server";

import { API } from "../api.generated";
import { markdownFor } from "../../markdown";
import { propType } from "../prop-description";

/* The page places `<Example>`, an async server component `renderToStaticMarkup` cannot mount.
   Everything else on the page is awaited by the page itself; the specimen has its own laws.
   The REST of the module is kept: `markdownFor` reads an example's source out of the same
   file, so a bare factory would hand the twin arm an `undefined` and fail it for a reason that
   has nothing to do with what it is asking. */
vi.mock("../../example", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../example")>()),
  Example: () => null,
}));

const { default: ComponentPage } = await import("./page");

/** The subject, chosen by the one property that makes this law able to fail: a prop whose
    alias and whose values are DIFFERENT strings. A `boolean` prop renders identically either
    way, so a fixture built on one would pass with `propType` deleted from both files. */
const subject = () => {
  const prop = API.Button!.props.find((candidate) => candidate.name === "size");
  expect(prop, "Button has no `size` prop to read").toBeDefined();
  expect(prop!.values, "`Button.size` resolved no values; this law would assert the alias").toBeDefined();
  expect(propType(prop!), "the alias and the values render the same string").not.toBe(prop!.type);
  return prop!;
};

describe("both tables print the values, through the one home", () => {
  it("the page's type cell does", async () => {
    const prop = subject();
    const markup = renderToStaticMarkup(
      await ComponentPage({ params: Promise.resolve({ slug: "button" }) }),
    );
    // The quotes `propType` writes come back as entities out of a React render, so the markup
    // is decoded rather than the expectation loosened — a substring check against a spelling
    // with the quotes stripped would pass on `1 | 2 | 3`, which is not what the package says.
    const rendered = markup.replace(/&quot;/g, '"');
    expect(rendered, "the page rendered no props table").toContain("What it does");
    expect(rendered).toContain(propType(prop));
  }, 60_000);

  it("the twin's type cell does", () => {
    const prop = subject();
    const twin = markdownFor("/components/button");
    expect(twin, "there is no twin for /components/button").not.toBeNull();
    // The twin escapes a pipe, because an unescaped one shifts every cell after it.
    expect(twin!).toContain(propType(prop).replace(/\|/g, "\\|"));
  });
});
