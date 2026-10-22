/**
 * NO TEXT INFLATION ON iOS (§17, 2026-10-22).
 *
 * Read off the SERVED HTML, because the stylesheet is the place the fix already failed: an app's
 * CSS minifier drops `-webkit-text-size-adjust` whenever its browser list has no iOS Safari, and
 * iPhone Safari reads no other spelling. A browser law cannot stand in for this one either —
 * desktop Chromium does not know the prefixed property, so a client-side mount writes nothing
 * and a law there would be measuring the wrong engine. The server string is what an iPhone gets.
 */
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Theme } from "./theme.tsx";

describe("the outermost Theme turns iOS text inflation off, inline (§17)", () => {
  it("ships the -webkit- spelling Safari reads, at 100%, on the root element", () => {
    const html = renderToStaticMarkup(<Theme>app</Theme>);
    expect(html).toMatch(/style="[^"]*-webkit-text-size-adjust:\s*100%/);
    expect(html).toMatch(/style="[^"]*(?<![-\w])text-size-adjust:\s*100%/);
  });

  it("a caller's own style still applies, and wins where it says the same thing", () => {
    const html = renderToStaticMarkup(<Theme style={{ minHeight: "100dvh" }}>app</Theme>);
    expect(html).toMatch(/min-height:\s*100dvh/);
    expect(html).toMatch(/-webkit-text-size-adjust:\s*100%/);
  });

  it("only the outermost Theme states it — the property inherits, so a nested one owes nothing", () => {
    const html = renderToStaticMarkup(
      <Theme>
        <Theme density="compact">inner</Theme>
      </Theme>,
    );
    expect(html.match(/text-size-adjust/g)?.length, "the rule is stated more than once per spelling").toBe(2);
    const at = html.indexOf('data-density="compact"');
    const tag = html.slice(html.lastIndexOf("<div", at), html.indexOf(">", at));
    expect(tag, "the nested Theme restated it").not.toMatch(/text-size-adjust/);
  });
});
