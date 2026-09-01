/**
 * The resolver's laws (§2, §3). These are node tests because the question is what the
 * component *writes*, not what the engine then does with it — and the difference matters:
 * `var(--space-0)` and `0` both compute to `0px` for padding, so only reading the emitted
 * custom property can tell a working token from a broken one.
 */
import { describe, expect, it } from "vitest";

import { raw, walkFiles } from "../test/stylesheets.ts";
import { generatePreview } from "../tokens/preview.ts";
import { space } from "../tokens/config.ts";
import {
  boxProps,
  isMarginProp,
  isPaddingProp,
  marginPropNames,
  paddingPropNames,
  type BoxPropName,
} from "./props.ts";
import { resolveBoxProps } from "./resolve.ts";

describe("a value becomes a custom property, and nothing becomes a rule (§2)", () => {
  it("a bare index resolves through LAYOUT space — the density-aware layer, never the raw palette (§3, §12)", () => {
    expect(resolveBoxProps({ p: "4" }).style).toEqual({ "--kui-p": "var(--layout-space-4)" });
  });

  it("a raw string is passed through untouched, on the same prop", () => {
    expect(resolveBoxProps({ p: "13px" }).style).toEqual({ "--kui-p": "13px" });
  });

  it("an index outside the palette is not silently invented", () => {
    // The palette starts at 1, so `p={0}` — the ordinary way to say no padding — used to emit
    // a reference to a token that does not exist. It rendered 0px anyway, because an unset
    // custom property falls back to the property's initial value, which for padding is 0.
    // Nothing downstream could have caught it; only the emitted value shows the difference.
    expect(resolveBoxProps({ p: 0 }).style).toEqual({ "--kui-p": "0" });
    expect(resolveBoxProps({ p: String(space.length + 1) }).style).toEqual({
      "--kui-p": String(space.length + 1),
    });
  });

  it("only the space-scaled props tokenize; the pass-through ones stay literal", () => {
    expect(resolveBoxProps({ width: "4" }).style).toEqual({ "--kui-w": "4" });
  });

  it("a responsive object emits one var per tier, base included", () => {
    expect(resolveBoxProps({ gap: { initial: "2", md: "6" } }).style).toEqual({
      "--kui-g": "var(--layout-space-2)",
      "--kui-g-md": "var(--layout-space-6)",
    });
  });

  it("structural keywords ride the identical pipe, which is why this is not a spacing mechanism", () => {
    expect(resolveBoxProps({ direction: "column", columns: "repeat(3, 1fr)" }).style).toEqual({
      "--kui-fd": "column",
      "--kui-gtc": "repeat(3, 1fr)",
    });
  });
});

describe("`bleed` — the one named value on the space scale (§3, §10, 2026-08-20)", () => {
  const BLEED = "calc(-1 * var(--kui-sf-p, 0px))";

  it("a margin prop resolves it against the enclosing surface's own padding hook", () => {
    // The fallback is the load-bearing half and is asserted as part of the string: outside any
    // surface the declaration must compute a real zero rather than go invalid at
    // computed-value time and reset the margin to its initial value.
    expect(resolveBoxProps({ mt: "bleed" }).style).toEqual({ "--kui-mt": BLEED });
  });

  it("every margin spelling takes it — which is the reason it is a value and not a prop", () => {
    // A picture across the top of a card is `mt="bleed" mx="bleed"`. Nothing here was designed
    // for bleeding: the per-side rows already existed, so the sides question answers itself.
    for (const name of marginPropNames) {
      const { var: stem } = boxProps[name];
      expect(
        resolveBoxProps({ [name]: "bleed" } as Record<string, string>).style,
        `${name} does not take bleed`,
      ).toEqual({ [`--kui-${stem}`]: BLEED });
    }
  });

  it("and every tier, because it rides the margin rows' own responsive machinery", () => {
    expect(resolveBoxProps({ mx: { initial: "bleed", md: "4" } }).style).toEqual({
      "--kui-mx": BLEED,
      "--kui-mx-md": "var(--layout-space-4)",
    });
  });

  it("a padding prop resolves it to the same hook, positive (2026-08-29)", () => {
    // The margin half bleeds a box OUT to the pane's edge; this half hands the pane's own
    // inset BACK to the content inside it — `<Tabs mx="bleed">` then `px="bleed"` on the
    // panel. One keyword because it is one mechanism seen from its two halves, and the same
    // explicit fallback because outside any surface both must compute an honest zero. The
    // law that stood here asserted the pass-through — "padding rejects a negative length",
    // true of the calc this row never gets — and it failed on the fix, as a law encoding a
    // superseded decision should.
    expect(resolveBoxProps({ p: "bleed" }).style).toEqual({ "--kui-p": "var(--kui-sf-p, 0px)" });
  });

  it("every padding spelling takes it, and every tier", () => {
    for (const name of paddingPropNames) {
      const { var: stem } = boxProps[name];
      expect(
        resolveBoxProps({ [name]: "bleed" } as Record<string, string>).style,
        `${name} does not take bleed`,
      ).toEqual({ [`--kui-${stem}`]: "var(--kui-sf-p, 0px)" });
    }
    expect(resolveBoxProps({ px: { initial: "bleed", md: "4" } }).style).toEqual({
      "--kui-px": "var(--kui-sf-p, 0px)",
      "--kui-px-md": "var(--layout-space-4)",
    });
  });

  it("a prop with no relation to the pane's inset passes the word through, where CSS rejects it visibly", () => {
    // A gap is a distance BETWEEN children and a width is the box's own — neither cancels nor
    // restores a surface's padding, so a resolved number there would be a value nobody chose.
    expect(resolveBoxProps({ gap: "bleed" }).style).toEqual({ "--kui-g": "bleed" });
    expect(resolveBoxProps({ width: "bleed" }).style).toEqual({ "--kui-w": "bleed" });
  });

  it("the type's padding list and the table's padding rows are the same set", () => {
    // The margin law below, one family over — a padding row added to the table and forgotten
    // in the list would accept `"bleed"` at the type level and emit it as a raw keyword.
    const fromTable = (Object.keys(boxProps) as BoxPropName[]).filter((name) =>
      isPaddingProp(boxProps[name]),
    );
    expect([...fromTable].sort()).toEqual([...paddingPropNames].sort());
    expect(fromTable.length).toBeGreaterThan(0);
  });

  it("the type's margin list and the table's margin rows are the same set", () => {
    // The list is written out so the TYPE can name it, which is the only reason it is a second
    // home. A margin row added to the table and forgotten here would accept `"bleed"` at the
    // type level and emit it as a raw keyword — a no-op nobody would see.
    const fromTable = (Object.keys(boxProps) as BoxPropName[]).filter((name) =>
      isMarginProp(boxProps[name]),
    );
    expect([...fromTable].sort()).toEqual([...marginPropNames].sort());
    // …and the predicate must actually be selecting something narrower than the whole table.
    expect(fromTable.length).toBeGreaterThan(0);
    expect(fromTable.length).toBeLessThan(Object.keys(boxProps).length);
  });
});

describe("the boundary between props and the DOM (§3)", () => {
  it("anything the table does not name reaches the element untouched", () => {
    const { style, rest } = resolveBoxProps({ p: "4", id: "probe", onClick: undefined });
    expect(style).toEqual({ "--kui-p": "var(--layout-space-4)" });
    expect(rest).toEqual({ id: "probe", onClick: undefined });
  });

  it("a conditional prop that resolved to nothing emits no declaration", () => {
    // The type admits undefined on purpose: `p={cond ? "4" : undefined}` is how a conditional
    // prop is written, and a type that refused it would send people to the escape hatch.
    expect(resolveBoxProps({ p: undefined, gap: undefined }).style).toEqual({});
  });
});

describe("no row emits a shorthand into a space another row also feeds (§2, requirement 3)", () => {
  // props.ts has carried the words "Never a shorthand" since 2026-08-02, when padding was
  // found emitting `padding:` in front of its own longhands. Nothing enforced it, and two
  // rows went on violating it: `inset` and `overflow` both shipped as dead no-ops, because a
  // shorthand followed by a longhand whose var is unset does not degrade — the longhand is
  // invalid at computed-value time and resets the property to its INITIAL value, beating the
  // shorthand that preceded it.
  //
  // A shorthand is legal only where no other row feeds any longhand it would swallow, which is
  // why `grid-area` stays: nothing else writes grid-row-start.
  const EXPANDS: Record<string, string[]> = {
    inset: ["top", "right", "bottom", "left"],
    overflow: ["overflow-x", "overflow-y"],
    padding: ["padding-block-start", "padding-block-end", "padding-inline-start", "padding-inline-end"],
    margin: ["margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end"],
    gap: ["row-gap", "column-gap"],
    "grid-area": ["grid-row-start", "grid-row-end", "grid-column-start", "grid-column-end"],
    flex: ["flex-grow", "flex-shrink", "flex-basis"],
  };

  it("holds for every row in the table", () => {
    const fedBy = new Map<string, string[]>();
    for (const [name, def] of Object.entries(boxProps)) {
      for (const prop of def.css) (fedBy.get(prop) ?? fedBy.set(prop, []).get(prop)!).push(name);
    }
    for (const [prop, names] of fedBy) {
      const swallowed = EXPANDS[prop];
      if (!swallowed) continue;
      const collisions = swallowed.filter((longhand) => fedBy.has(longhand));
      expect(
        collisions,
        `${names.join("/")} emits the shorthand \`${prop}\`, which would be reset by ${collisions.join(", ")}`,
      ).toEqual([]);
    }
  });

  it("and the two that were broken now feed their longhands through the precedence chain", () => {
    expect(boxProps.inset.css).toEqual(["top", "right", "bottom", "left"]);
    expect(boxProps.overflow.css).toEqual(["overflow-x", "overflow-y"]);
    for (const [shorthand, longhands] of [
      [boxProps.inset, [boxProps.top, boxProps.right, boxProps.bottom, boxProps.left]],
      [boxProps.overflow, [boxProps.overflowX, boxProps.overflowY]],
    ] as const) {
      for (const longhand of longhands) expect(longhand.precedence).toBeGreaterThan(shorthand.precedence);
    }
  });
});

describe("the runtime touches no ambient global (§13, audit 2026-08-08)", () => {
  it("`process` is read in exactly ONE file, and that file is the DEV constant's home", () => {
    /**
     * The original defect: `process.env.NODE_ENV` on Box's RENDER path was the package's only
     * reference to `process`, and it survived tsdown into dist — so a browser-native ESM
     * consumer (no bundler to define it) threw `ReferenceError: process is not defined` on
     * every Box, Flex, Grid and Stack.
     *
     * THE FIRST SPELLING OF THIS LAW PINNED A DEFECT (2026-08-31 performance pass). It accepted
     * any read within 200 characters of a `typeof process` guard — and that guard is precisely
     * what stops a bundler folding the expression: `typeof process === "undefined" || <folded
     * false>` is TRUE at runtime wherever the global is absent, which is Vite, Rollup, Parcel
     * and bare ESM. So the form the law called safe was the one shipping a ResizeObserver per
     * Card, Surface and Dialog into production, and the law agreed with the code because both
     * were written from the same premise. It asserts CONTAINMENT now: one home, so the spelling
     * has one place to be wrong and one place to be fixed.
     */
    const offenders: string[] = [];
    for (const file of walkFiles(".", ".ts").concat(walkFiles(".", ".tsx"))) {
      if (file.includes(".test.") || file === "system/dev.ts") continue;
      const code = raw(file)
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/\/\/[^\n]*/g, " ");
      for (const match of code.matchAll(/process\s*\.\s*env|typeof\s+process/g)) {
        offenders.push(`${file}:${code.slice(0, match.index).split("\n").length}`);
      }
    }
    expect(offenders, "`process` is read outside system/dev.ts").toEqual([]);

    /**
     * AND THE HOME MUST STILL ANSWER ALL THREE ENVIRONMENTS. A containment law alone is
     * satisfied by any expression in that one file, the folded-wrong one included — so the
     * shape is asserted too. The read sits inside a `try`, which is what lets a bundler's
     * substituted literal decide without ever consulting the global, and the `catch` is what
     * makes a realm with no `process` land on DEVELOPMENT rather than throwing (Box's own
     * 2026-08-08 scar: the browser suite is that realm, and a DEV that answers false there
     * makes every dev-warning law in the package silently measure nothing).
     */
    // Comments STRIPPED: the home explains at length why a `typeof process` guard is wrong, and
    // a law that greps its own documentation fires on the explanation (two existing laws in this
    // repo learned the same thing, LOG 2026-08-05).
    const home = raw("system/dev.ts");
    const homeCode = home.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
    expect(
      home,
      "the read must be the exact token sequence every bundler's define matches",
    ).toContain("env = process.env.NODE_ENV;");
    expect(home, "the read must sit inside a try, or a bare realm throws").toMatch(
      /try\s*\{\s*env = process\.env\.NODE_ENV;\s*\}\s*catch/,
    );
    expect(
      homeCode,
      "a `typeof process` guard is what stops the fold — it must not come back",
    ).not.toContain("typeof process");
    expect(home, "DEV must fall to development when nothing substituted the read").toContain(
      'export const DEV = env !== "production";',
    );
  });
});

describe("the package preview measures what it claims to measure (§2, audit 2026-08-08)", () => {
  it("every responsive rig on the page sits in an opted-in container", () => {
    // The defect: `kuiBox` bypasses the React component (the runner cannot parse JSX), so
    // when containment went opt-in the generated page kept no query container at all — the
    // "responsive mechanism, live" section rendered ONE column at every width while its own
    // caption printed a tier. Verbatim the symptom §2 records as closed in 2026-08-02,
    // reintroduced on the one surface the reversal did not open. The page is gitignored and
    // unpublished, which is exactly why nothing else would ever have caught it.
    const html = generatePreview();
    const rigs = html.split('<div class="rig">').slice(1);
    expect(rigs.length, "the responsive section vanished").toBeGreaterThanOrEqual(2);
    for (const [i, rig] of rigs.entries()) {
      expect(rig.slice(0, rig.indexOf("</div>")), `rig ${i + 1} has no query container`).toContain(
        "data-container",
      );
    }
  });
});
