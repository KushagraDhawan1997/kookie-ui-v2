/**
 * The row family's identity has ONE home (§21, audit 2026-09-02).
 *
 * `rowProps` promoted on its third consumer and shipped with no law: nothing asserted that the
 * three consumers resolve one identity, and — unlike `glyphs.ts`, whose sentence `rows.ts`
 * explicitly cites — nothing forbade a fourth from re-spelling it inline, which is the exact
 * drift the promotion was made to end. Menu wrote it, Select copied it, Command was the third;
 * the fourth is the one this file exists for.
 */
import { describe, expect, it } from "vitest";

import { rowProps } from "./rows.ts";
import { raw, walkFiles } from "../test/stylesheets.ts";

describe("one home for the row family's identity (§21)", () => {
  it("it resolves the same identity for every consumer", () => {
    // The identity is the class list and the three stamps. A consumer differs only in its part
    // name and, for the one meaning a row may carry, its tone.
    const menu = rowProps("2", "kui-menu-item");
    const select = rowProps("2", "kui-select-item");
    expect(menu.className.replace("kui-menu-item", "X")).toBe(select.className.replace("kui-select-item", "X"));
    for (const key of ["data-size", "data-emphasis", "data-tone"] as const) {
      expect(menu[key], `${key} differs between consumers`).toBe(select[key]);
    }
    expect(menu["data-emphasis"], "a row is quiet by stamp — emphasis is refused").toBe("quiet");
  });

  it("the one meaning a row may carry reaches the stamp, and nothing else does", () => {
    expect(rowProps("2", "kui-menu-item", { tone: "destructive" })["data-tone"]).toBe("destructive");
    expect(rowProps("2", "kui-menu-item")["data-tone"]).toBe("neutral");
  });

  it("a caller's className is appended, never replaced", () => {
    expect(rowProps("3", "kui-command-item", { className: "mine" }).className).toBe(
      "kui-control kui-row kui-command-item mine",
    );
  });

  it("NO component re-spells the identity inline — the fourth consumer imports it", () => {
    /* The promotion's whole point, made structural. A file that writes the class pair and the
       quiet stamp by hand has re-created the two-homes problem the promotion ended, and the
       two copies that existed before it had already drifted in shape (menu's took a tone
       parameter, select's did not) even while agreeing in output.

       Falsified by pasting the old inline spelling back into any component. */
    const sources = walkFiles("components", ".tsx").filter((f) => !f.includes("test"));
    expect(sources.length, "the walk found no component sources").toBeGreaterThan(20);

    /* FOUR SITES PREDATE THE PROMOTION and are named rather than silently permitted. They are
       the ones `rowProps` was extracted FROM the neighbourhood of, not by it: Row is the
       family's own standalone member, the tree's two rows and the shell's nav row were written
       before there was one home to import. Each is owed a conversion, and the value of naming
       them is that the law still fails on a FIFTH — a new component re-spelling the identity is
       exactly the drift the promotion ended, and it is the thing that would otherwise slip in
       unnoticed. This list may only ever get shorter: an entry that no longer matches fails
       below, which is how `recipes.test.ts` keeps its own exemptions from going stale. */
    const OWED = ["components/row/row.tsx", "components/shell/shell.tsx", "components/tree/tree.tsx"];
    const inline = (file: string) => {
      const body = raw(file).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
      return /["`]kui-control kui-row/.test(body);
    };
    const offenders = sources.filter((file) => inline(file) && !OWED.includes(file));
    expect(offenders, "these re-spell the row identity instead of importing rowProps").toEqual([]);

    // AND EVERY NAMED SITE MUST STILL BE EARNING ITS PLACE. A stale entry is a hole with a
    // comment on it (the 2026-08-26 finding against refraction.tsx's dead exemption).
    for (const file of OWED) {
      expect(inline(file), `${file} no longer re-spells the identity — delete it from OWED`).toBe(true);
    }
  });
});
