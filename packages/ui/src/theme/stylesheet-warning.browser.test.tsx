/**
 * THE MISSING-STYLESHEET WARNING, BOTH WAYS (2026-09-07).
 *
 * Forgetting the stylesheet import is the only mistake in this package that produces no
 * evidence at all — correct markup, correct props, and a page that looks like nothing. The
 * warning that names it is only worth having if it is silent the rest of the time, so this
 * law asserts both halves, and the SILENT half is the load-bearing one: a warning that fires
 * on every correctly-built app is noise, and noise is how a real warning stops being read.
 *
 * The absent case is produced by reading the sentinel through an element the token cannot
 * reach, rather than by unloading the suite's own stylesheet — a test that tore the CSS out of
 * the page would take every other law in the run down with it.
 */
import { act } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";

import { Theme } from "./theme.tsx";
import { mounted } from "../test/browser.tsx";

afterEach(() => vi.restoreAllMocks());

const warnings = () => {
  const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
  return () => spy.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("stylesheet is missing"));
};

describe("the missing-stylesheet warning", () => {
  it("says nothing when the tokens resolve", () => {
    const read = warnings();
    mounted(<div />, { theme: {} });
    expect(read()).toEqual([]);
  });

  /**
   * The starved case, produced by turning the stylesheets off rather than by inheritance.
   *
   * The first attempt declared the sentinel as an empty value on an ancestor and failed, and
   * the reason is worth keeping: `--control-height-2` is re-declared by every `[data-density]`
   * and `[data-pointer]` scope, and a Theme stamps both — so the token is declared ON the
   * theme's own element and no ancestor can starve it. That makes it a BETTER sentinel than
   * a `:root`-only token (it survives a nested Theme), and it means the only honest way to
   * reach the absent state is the real one: no stylesheets.
   *
   * `disabled` is reversible and scoped to this test, so the rest of the run keeps its CSS.
   */
  it("names the import when no Kookie token resolves", async () => {
    const read = warnings();
    const sheets = [...document.styleSheets];
    for (const sheet of sheets) sheet.disabled = true;
    const host = document.createElement("div");
    document.body.appendChild(host);
    const { createRoot } = await import("react-dom/client");
    const root = createRoot(host);
    try {
      await act(async () => {
        root.render(
          <Theme>
            <div />
          </Theme>,
        );
      });
      const messages = read();
      expect(messages.length).toBe(1);
      expect(messages[0]).toContain('import "@kookie-ui/react/styles.css"');
    } finally {
      await act(async () => root.unmount());
      host.remove();
      for (const sheet of sheets) sheet.disabled = false;
    }
  });
});
