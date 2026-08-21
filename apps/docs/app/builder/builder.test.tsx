/**
 * The builder's laws (2026-08-19). Two anchor the whole feature, the rest keep its data
 * honest:
 *
 * 1. COVERAGE — every component the package exports is placeable in the builder, or its
 *    exclusion is written with a reason (the playground law's sentence, one app over: the
 *    builder is a surface whose whole claim is "the system, composable", so a missing entry
 *    is the claim failing quietly).
 *
 * 2. ROUND-TRIP IDENTITY — the exported code, compiled and rendered, is byte-identical to
 *    what the canvas interpreter renders. This is the law that lets the export dialog say
 *    "ready to paste": the code is not a description of the canvas, it IS the canvas. The
 *    comparison uses react-dom/server on both sides, and the canonical document deliberately
 *    exercises every serializer branch — nested layout, text needing JSX escapes, booleans,
 *    numbers, the render={} trigger pattern, a multi-root fragment, and a Theme wrapper that
 *    must state ONLY the axes differing from the system's defaults.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { transformSync } from "esbuild";
import * as React from "react";
import * as reactJsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import * as Kookie from "@kookie-ui/react";
import { Theme, componentAxes } from "@kookie-ui/react";

import { CATALOG, EXCLUDED, SLOT_ACCEPTS, canContain, canSit, gapStepsFor, sanitizeNode, seatVocabularyFor, sizeStepsFor, slotsFor } from "./catalog";
import {
  cloneWithNewIds,
  defaultDocTheme,
  findNode,
  insertNode,
  moveNode,
  moveNodeTo,
  node,
  removeNode,
  type BuilderDoc,
  type BuilderNode,
} from "./model";
import { renderNode } from "./render";
import { BuilderApp, LEFT_REGIONS } from "./builder-app";
import { deriveParams, serializeBlock, serializeDocument, themeDiffs, toComponentName } from "./serialize";

const here = fileURLToPath(new URL(".", import.meta.url));
const packageIndex = join(here, "../../../../packages/ui/src/index.ts");

/** Uppercase value exports — same parse as the playground law, same vacuity guard. */
function exportedComponents(): string[] {
  const names: string[] = [];
  for (const m of readFileSync(packageIndex, "utf8").matchAll(/^export \{([^}]*)\}/gms)) {
    for (const raw of m[1]!.split(",")) {
      const name = raw.trim().replace(/^type .*/, "");
      if (/^[A-Z][A-Za-z]*$/.test(name)) names.push(name);
    }
  }
  return names;
}

describe("coverage: every export is placeable, or its exclusion is written", () => {
  const components = exportedComponents();
  const excluded = new Map(EXCLUDED.map((e) => [e.name, e.why]));

  it("the parse found the surface — an empty export list audits nothing", () => {
    expect(components.length).toBeGreaterThanOrEqual(15);
    expect(components).toContain("Button");
  });

  for (const name of exportedComponents()) {
    it(`${name} is in the catalog or excluded with a reason`, () => {
      if (excluded.has(name)) {
        // The cheapest way to satisfy a coverage law is an entry that says nothing.
        expect(excluded.get(name)!.length, `${name}'s exclusion reason is too short to be a reason`).toBeGreaterThan(40);
        expect(CATALOG[name], `${name} is both excluded and in the catalog — one home`).toBeUndefined();
      } else {
        expect(CATALOG[name], `${name} is exported but the builder cannot place it — add a catalog entry or a written exclusion`).toBeDefined();
      }
    });
  }

  it("the reverse holds: the catalog names only real exports", () => {
    const real = new Set(components);
    for (const type of Object.keys(CATALOG)) {
      expect(real.has(type), `catalog entry "${type}" is not an export of the package`).toBe(true);
    }
    for (const { name } of EXCLUDED) {
      expect(real.has(name), `exclusion "${name}" names nothing the package exports`).toBe(true);
    }
  });
});

describe("the grammar is closed over the catalog", () => {
  it("every containment reference names a real entry", () => {
    for (const [type, entry] of Object.entries(CATALOG)) {
      if (typeof entry.children === "object") {
        for (const child of entry.children.only) {
          expect(CATALOG[child], `${type} accepts "${child}", which is not in the catalog`).toBeDefined();
        }
      }
      if (entry.requiresAncestor) {
        expect(CATALOG[entry.requiresAncestor], `${type} requires ancestor "${entry.requiresAncestor}", which is not in the catalog`).toBeDefined();
      }
      if (entry.partOf) {
        expect(CATALOG[entry.partOf], `${type} is part of "${entry.partOf}", which is not in the catalog`).toBeDefined();
      }
    }
  });

  it("every entry's own preset satisfies the grammar it will be edited under", () => {
    const check = (n: BuilderNode, chain: string[]) => {
      const entry = CATALOG[n.type];
      expect(entry, `preset renders "${n.type}", which is not in the catalog`).toBeDefined();
      for (const child of n.children ?? []) {
        if (!CATALOG[n.type]!.renderChild) {
          expect(
            canContain(n.type, child.type, [...chain, n.type]),
            `${n.type}'s preset places a ${child.type} its own grammar refuses`,
          ).toBe(true);
        }
        check(child, [...chain, n.type]);
      }
    };
    for (const entry of Object.values(CATALOG)) {
      // A part's preset is validated from the ancestors it requires, since that is the only
      // place the palette will ever insert it.
      const chain = entry.requiresAncestor ? [entry.requiresAncestor] : [];
      check(entry.make(), chain);
    }
  });

  it("every part is reachable — some parent accepts it or its ancestor exists", () => {
    for (const [type, entry] of Object.entries(CATALOG)) {
      if (!entry.partOf) continue;
      const reachable =
        Boolean(entry.requiresAncestor) ||
        Object.values(CATALOG).some((e) => typeof e.children === "object" && e.children.only.includes(type));
      expect(reachable, `${type} is a part no container accepts — it can never be placed`).toBe(true);
    }
  });
});

/* ── The canonical document: one of everything the serializer can say ─────────────────── */

const canonicalDoc = (): BuilderDoc => ({
  // compact differs from the default; everything else does not — the Theme wrapper must
  // state exactly one axis.
  theme: { ...defaultDocTheme(), density: "compact" },
  roots: [
    node("Card", { size: "2" }, {
      children: [
        node("Stack", { gap: "3" }, {
          children: [
            node("Heading", { size: "6" }, { text: "A {curly} & <angled> title " }),
            node("Text", { size: "2", emphasis: "medium" }, { text: "Plain body copy." }),
            node("TextField", { placeholder: "Name", "aria-label": "Name", disabled: true }, {
              children: [node("Button", { size: "1", emphasis: "quiet" }, { text: "Clear", slot: "trailing" })],
            }),
            node("TextArea", { rows: 4, "aria-label": "Notes" }),
            node("Flex", {
              gap: { initial: "2", md: "4" },
              direction: { initial: "column", md: "row" },
              align: "center",
              justify: "space-between",
            }, {
              children: [
                node("Checkbox", { defaultChecked: true, "aria-label": "Agree" }),
                node("Slider", { defaultValue: 35, "aria-label": "Amount" }),
                node("Button", { tone: "accent", emphasis: "loud", bordered: true }, {
                  text: "Save",
                  children: [node("Spinner", {}, { slot: "leading" })],
                }),
              ],
            }),
            node("Separator"),
            node("Progress", { value: 60, "aria-label": "Progress" }),
          ],
        }),
      ],
    }),
    node("Box", { p: "4", container: true }, {
      children: [node("Text", { size: "2" }, { text: "A measurable region." })],
    }),
    CATALOG.Menu!.make(),
    CATALOG.Select!.make(),
    CATALOG.Tabs!.make(),
    CATALOG.AlertDialog!.make(),
  ],
});

/** The law's own rendering of a document — deliberately a SECOND implementation of the
    wrapper rules (Theme for the diffs, fragment for many roots), so the serializer and this
    file must AGREE rather than one quoting the other. */
const expectedElement = (doc: BuilderDoc): React.ReactElement => {
  const roots = doc.roots.map((r) => renderNode(r, "export"));
  const inner = roots.length === 1 ? roots[0]! : React.createElement(React.Fragment, null, ...roots);
  const diffs = Object.fromEntries(themeDiffs(doc));
  return Object.keys(diffs).length ? React.createElement(Theme, diffs, inner) : inner;
};

/** React's useId salts are positional and documented-unstable; the two renders sit at
    different module depths, so the salts differ while every real byte agrees. Each distinct
    id maps to its order of first appearance — cross-references (aria wiring, the -hidden-input
    pairing) must still land on the same token, so a wiring change still fails.

    BOTH spellings are normalized: Base UI's own `base-ui-…` ids and React's raw `_R_…_`,
    which a field's slot uses for `aria-describedby`. Missing the second one is what the
    slot work turned up — the two renders agreed byte for byte except the salt. */
const normalizeGeneratedIds = (html: string): string => {
  // ONE COUNTER PER FAMILY. A shared counter made the two renders disagree the day the
  // interpreter became a memoized component: an extra component layer shifts React's
  // positional salts, and with one counter a difference in either family renumbered the
  // other. Per-family numbering keeps every cross-reference checkable (aria-describedby
  // rides `_R_…`, the hidden-input pairing rides `base-ui-…`) while staying blind to the
  // salts themselves, which React documents as unstable.
  const counters = new Map<string, Map<string, string>>();
  const token = (m: string, prefix: string) => {
    const seen = counters.get(prefix) ?? new Map<string, string>();
    counters.set(prefix, seen);
    if (!seen.has(m)) seen.set(m, `${prefix}${seen.size}`);
    return seen.get(m)!;
  };
  return html
    .replace(/base-ui-[A-Za-z0-9_]+/g, (m) => token(m, "base-ui-"))
    .replace(/_R_[A-Za-z0-9]*_/g, (m) => token(m, "_rid"));
};

/** Compile the exported module and hand back its component. */
const compileExport = (code: string): React.ComponentType => {
  const js = transformSync(code, { loader: "tsx", format: "cjs", jsx: "automatic" }).code;
  const require = (spec: string) => {
    if (spec === "@kookie-ui/react") return Kookie;
    if (spec === "react") return React;
    if (spec === "react/jsx-runtime") return { Fragment: React.Fragment, jsx: reactJsx.jsx, jsxs: reactJsx.jsxs };
    throw new Error(`the exported code imports "${spec}" — it may only need React and the package`);
  };
  const module = { exports: {} as Record<string, unknown> };
  new Function("require", "module", "exports", js)(require, module, module.exports);
  const exported = Object.values(module.exports).find((v) => typeof v === "function");
  if (!exported) throw new Error("the compiled export module exports no component");
  return exported as React.ComponentType;
};

describe("round-trip identity: the exported code IS the canvas", () => {
  it("compiled export renders byte-identical to the interpreter", () => {
    const doc = canonicalDoc();
    const code = serializeDocument(doc);
    const Exported = compileExport(code);
    const fromCode = normalizeGeneratedIds(renderToStaticMarkup(React.createElement(Exported)));
    const fromTree = normalizeGeneratedIds(renderToStaticMarkup(expectedElement(doc)));
    expect(fromCode.length).toBeGreaterThan(500); // vacuity: an empty render matching an empty render proves nothing
    expect(fromCode).toBe(fromTree);
  });

  it("the Theme wrapper states exactly the axes that differ from the defaults", () => {
    const code = serializeDocument(canonicalDoc());
    expect(code).toContain('<Theme density="compact">');
    // Restating a default would pin today's default forever.
    for (const axis of ["radius", "pointer", "depth", "material"]) {
      expect(code, `the export restates the default ${axis}`).not.toContain(`${axis}=`);
    }
    const untouched: BuilderDoc = { theme: defaultDocTheme(), roots: [node("Button", {}, { text: "Hi" })] };
    expect(serializeDocument(untouched)).not.toContain("<Theme");
  });

  it("canvas mode stamps the selection hook; export mode is clean — the instrument works", () => {
    const doc: BuilderDoc = { theme: defaultDocTheme(), roots: [node("Button", {}, { text: "Hi" })] };
    const canvas = renderToStaticMarkup(React.createElement(React.Fragment, null, doc.roots.map((r) => renderNode(r, "canvas"))));
    expect(canvas).toContain("data-b-id");
    expect(renderToStaticMarkup(expectedElement(doc))).not.toContain("data-b-id");
  });

  it("a block's CONTENT is parameterized and its axes are not", () => {
    const block = node("Card", { size: "3" }, {
      children: [
        node("Stack", { gap: "2" }, {
          children: [
            node("Heading", { size: "6" }, { text: "Media card" }),
            node("Text", { size: "2", emphasis: "medium" }, { text: "A description." }),
            node("Text", { size: "1" }, { text: "Meta" }),
          ],
        }),
      ],
    });
    const params = deriveParams(block);
    expect(params.map((p) => p.prop)).toEqual(["title", "body", "body2"]);
    const code = serializeBlock("media card", block, params);
    // Content arrives as props with the captured text as defaults…
    expect(code).toContain('title = "Media card"');
    expect(code).toContain("{title}");
    expect(code).toContain("{body}");
    // …and every axis the author chose is still stated, not handed back.
    expect(code).toContain('size="3"');
    expect(code).toContain('emphasis="medium"');
    expect(code).not.toContain("size = ");
    // It compiles, and rendering it with no arguments gives the captured document back.
    const Exported = compileExport(code);
    expect(normalizeGeneratedIds(renderToStaticMarkup(React.createElement(Exported)))).toBe(
      normalizeGeneratedIds(renderToStaticMarkup(renderNode(block, "export"))),
    );
  });

  it("a block with no text at all exports as a plain component", () => {
    const block = node("Card", { size: "2" }, { children: [node("Separator")] });
    const code = serializeBlock("rule card", block, deriveParams(block));
    expect(code).toContain("export function RuleCard()");
  });

  it("a saved block exports as a named component", () => {
    const block = CATALOG.Card!.make();
    const code = serializeBlock("media card", block);
    expect(code).toContain("export function MediaCard()");
    const Exported = compileExport(code);
    expect(normalizeGeneratedIds(renderToStaticMarkup(React.createElement(Exported)))).toBe(
      normalizeGeneratedIds(renderToStaticMarkup(renderNode(block, "export"))),
    );
    expect(toComponentName("2 up gallery")).toBe("Block2UpGallery");
  });
});

describe("the export speaks tokens only, and refuses everything else", () => {
  it("no raw style, no pixel, no hex crosses the boundary", () => {
    const code = serializeDocument(canonicalDoc());
    expect(code).not.toMatch(/style=/);
    expect(code).not.toMatch(/\d+px/);
    expect(code).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    // Every stated distance is a step the space scale owns.
    for (const m of code.matchAll(/(?:gap|p|px|py)="(\d+)"/g)) {
      expect(componentAxes.space, `"${m[1]}" is not a layout-space step`).toContain(m[1]!);
    }
  });

  it("the export SAYS what the document states — agreement alone is not fidelity", () => {
    // Earned by its own sabotage pass: effectiveProps is one home shared by the serializer
    // and the interpreter, so a prop dropped THERE changes both sides identically and the
    // round-trip law stays green. This law pins the export to the document itself: one
    // statement of every prop kind must surface in the code.
    const code = serializeDocument(canonicalDoc());
    for (const stated of [
      'gap="3"',
      "rows={4}",
      "defaultChecked",
      'tone="destructive"',
      'placeholder="Name"',
      "disabled",
      'value="one"',
      // The responsive statements, exactly as the package spells them: tiers in resolution
      // order, initial first. A dropped or reordered tier is a different design.
      'gap={{ initial: "2", md: "4" }}',
      'direction={{ initial: "column", md: "row" }}',
      "container",
      // A seat is a PROP holding one element — the package's own spelling.
      'leading={<Spinner />}',
      'trailing={<Button size="1" emphasis="quiet">Clear</Button>}',
    ]) {
      expect(code, `the document states ${stated} and the export lost it`).toContain(stated);
    }
  });

  it("an unknown component throws rather than exporting", () => {
    const doc: BuilderDoc = { theme: defaultDocTheme(), roots: [node("Widget", {}, { text: "?" })] };
    expect(() => serializeDocument(doc)).toThrow(/not in the builder catalog/);
  });

  it("a prop outside the catalog throws rather than widening the export", () => {
    const hostile = node("Button", {}, { text: "Hi" });
    hostile.props.style = "color: red";
    const doc: BuilderDoc = { theme: defaultDocTheme(), roots: [hostile] };
    expect(() => serializeDocument(doc)).toThrow(/not a prop the builder knows/);
  });

  it("an unknown tier throws rather than exporting a value the resolver would ignore", () => {
    const doc: BuilderDoc = {
      theme: defaultDocTheme(),
      roots: [node("Stack", { gap: { initial: "2", xl: "6" } as never }, { children: [] })],
    };
    expect(() => serializeDocument(doc)).toThrow(/not a tier/);
  });

  it("a per-tier value on a non-responsive prop throws — an axis is not a breakpoint", () => {
    const doc: BuilderDoc = {
      theme: defaultDocTheme(),
      roots: [node("Button", { size: { initial: "2", md: "3" } }, { text: "Hi" })],
    };
    expect(() => serializeDocument(doc)).toThrow(/not a responsive prop/);
  });

  it("a one-tier object collapses to the plain spelling; an empty one to absence", () => {
    // { initial } alone states nothing a string does not, so only one spelling may exist —
    // the false-boolean rule, one value shape over.
    const doc: BuilderDoc = {
      theme: defaultDocTheme(),
      roots: [node("Stack", { gap: { initial: "2" } }, { children: [] }), node("Stack", { gap: {} }, { children: [] })],
    };
    const code = serializeDocument(doc);
    expect(code).toContain('gap="2"');
    expect(code).not.toContain("initial");
    expect(code).toContain("<Stack />");
  });

  it("tiers emit in resolution order however the document states them", () => {
    const doc: BuilderDoc = {
      theme: defaultDocTheme(),
      roots: [node("Stack", { gap: { lg: "8", initial: "2", sm: "4" } }, { children: [] })],
    };
    expect(serializeDocument(doc)).toContain('gap={{ initial: "2", sm: "4", lg: "8" }}');
  });

  it("a trigger with nothing to render throws rather than exporting a dead control", () => {
    const doc: BuilderDoc = {
      theme: defaultDocTheme(),
      roots: [node("Menu", {}, { children: [node("MenuTrigger", {}, { children: [] })] })],
    };
    expect(() => serializeDocument(doc)).toThrow(/no child to pass through render/);
  });
});

describe("resize walks a designed index — it cannot state a length", () => {
  it("a type resizes exactly when it owns a size vocabulary, and the steps ARE the package's", () => {
    for (const [type, entry] of Object.entries(CATALOG)) {
      const schema = entry.props.size;
      const steps = sizeStepsFor(type);
      if (schema?.kind === "axis") {
        expect(steps, `${type} states a size axis but offers no resize steps`).toEqual(
          componentAxes[schema.axis],
        );
      } else {
        // No vocabulary means no handle. The canvas shows a grip only where one writes
        // something, so this is the assertion behind "a node the system cannot resize
        // shows none" — the lie the old always-on handles told.
        expect(steps, `${type} has no size prop yet offers resize steps`).toBeNull();
      }
    }
    // The gesture must reach real components, or the law above passes by covering nothing.
    expect(sizeStepsFor("Button")).toEqual(componentAxes.size);
    expect(sizeStepsFor("Stack")).toBeNull();
  });

  it("every rung the drag can land on survives the export's own refusals", () => {
    // The point of stepping an index rather than a width: whatever the pointer does, the
    // document can only hold values the export already permits. Asserted by writing each
    // rung and running the boundary's own checks over the result.
    for (const [type, entry] of Object.entries(CATALOG)) {
      const steps = sizeStepsFor(type);
      if (!steps || entry.partOf || entry.requiresAncestor) continue;
      for (const step of steps) {
        const doc: BuilderDoc = {
          theme: defaultDocTheme(),
          roots: [{ ...entry.make(), props: { ...entry.make().props, size: step } }],
        };
        const code = serializeDocument(doc);
        expect(code, `${type} at size ${step} lost the rung`).toContain(`size="${step}"`);
        expect(code, `${type} at size ${step} leaked a length`).not.toMatch(/\d+px/);
        expect(code, `${type} at size ${step} leaked a style`).not.toMatch(/style=/);
      }
    }
  });
});

describe("every catalog entry survives the round trip it was added for", () => {
  /**
   * The gap the other walks leave (2026-08-21). Coverage proves an export is IN the catalog;
   * the grammar proves it can be PLACED; resize proves its rungs survive. Nothing proved the
   * plainest thing: that the node an entry's own `make()` produces serializes to code naming
   * the component, and renders to markup. An entry can satisfy every existing law and still
   * be a palette square that throws or exports nothing, which is precisely the state a new
   * entry is in before anyone opens the builder.
   *
   * Found while verifying Link by hand, which is the signal that the check belonged here
   * rather than in one component's session.
   */
  const placeable = Object.entries(CATALOG).filter(
    ([, entry]) => !entry.partOf && !entry.requiresAncestor,
  );

  it("found entries to walk", () => {
    // Vacuity: every assertion below loops this list, so a filter that excluded everything
    // would turn the whole block green.
    expect(placeable.length).toBeGreaterThan(15);
  });

  it("the default node exports code that names its own component", () => {
    for (const [type, entry] of placeable) {
      const doc: BuilderDoc = { theme: defaultDocTheme(), roots: [entry.make()] };
      const code = serializeDocument(doc);
      expect(code, `${type} exported nothing that names it`).toContain(`<${type}`);
      expect(code, `${type} is missing from the import line`).toMatch(
        new RegExp(`import \\{[^}]*\\b${type}\\b[^}]*\\} from "@kookie-ui/react"`),
      );
    }
  });

  it("the default node renders, and renders something", () => {
    for (const [type, entry] of placeable) {
      const html = renderToStaticMarkup(
        React.createElement(Theme, null, renderNode(entry.make(), {} as never)),
      );
      expect(html.length, `${type} rendered nothing`).toBeGreaterThan(20);
    }
  });
});

describe("gap bands walk the space scale", () => {
  it("a layout offers gap steps; everything else offers none", () => {
    for (const [type, entry] of Object.entries(CATALOG)) {
      const schema = entry.props.gap;
      const steps = gapStepsFor(type);
      if (schema?.kind === "axis") expect(steps, `${type} states a gap but offers no steps`).toEqual(componentAxes[schema.axis]);
      else expect(steps, `${type} has no gap yet offers steps`).toBeNull();
    }
    // Vacuity guard: the bands must reach the layouts they exist for.
    for (const type of ["Stack", "Flex", "Grid"]) expect(gapStepsFor(type)).toEqual(componentAxes.space);
    expect(gapStepsFor("Button")).toBeNull();
  });

  it("every step the band can land on is a real layout-space token", () => {
    for (const step of gapStepsFor("Stack")!) {
      const code = serializeDocument({
        theme: defaultDocTheme(),
        roots: [node("Stack", { gap: step }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] })],
      });
      expect(code).toContain(`gap="${step}"`);
      // The export law's own check, applied to the values this gesture can produce.
      expect(componentAxes.space, `"${step}" is not a layout-space step`).toContain(step);
      expect(code).not.toMatch(/\d+px/);
    }
  });
});

describe("the seat vocabulary — what a node may say about the space it sits in", () => {
  it("the parent's layout picks the prop, and a column offers nothing", () => {
    expect(seatVocabularyFor("Box", "row")?.prop).toBe("flexGrow");
    expect(seatVocabularyFor("Box", "grid")?.prop).toBe("gridArea");
    // A column's children already stretch across it — that IS the system's full-width
    // idiom (showcase.tsx: "the layout does it, the button has no opinion about how wide
    // it is"), so there is nothing to write and no handle to show.
    expect(seatVocabularyFor("Box", "column")).toBeNull();
    expect(seatVocabularyFor("Box", null)).toBeNull();
  });

  it("only a layout primitive has a seat to speak about", () => {
    // §3 keeps layout props off components, and wrapping does not rescue the flex case:
    // measured, a flexGrow Box grows while the Button inside it keeps hugging. A control
    // therefore gets no side handle rather than one that writes a prop it cannot take.
    for (const type of ["Button", "Card", "Text", "TextField", "Checkbox"]) {
      expect(seatVocabularyFor(type, "row"), `${type} is not a layout primitive`).toBeNull();
      expect(seatVocabularyFor(type, "grid"), `${type} is not a layout primitive`).toBeNull();
    }
    for (const type of ["Box", "Flex", "Grid", "Stack"]) {
      expect(seatVocabularyFor(type, "row"), `${type} should carry flexGrow`).not.toBeNull();
      expect(seatVocabularyFor(type, "grid"), `${type} should carry gridArea`).not.toBeNull();
    }
  });

  it("a span states the COLUMN track — a bare `span n` sets the row and does nothing", () => {
    // Measured on a real 3-column grid: `grid-area: span 2` leaves the child at one column
    // (195px), because the shorthand's first slot is the row. `auto / span 2` spans (397px).
    // Pinned because the wrong form looks tidier and fails silently.
    const spans = seatVocabularyFor("Box", "grid")!.values;
    expect(spans.length).toBeGreaterThan(1);
    for (const v of spans) {
      expect(v, `"${v}" would set the grid ROW, not the column`).toMatch(/^auto \/ span \d+$/);
    }
  });

  it("every seat value the drag can land on survives the export's refusals", () => {
    for (const layout of ["row", "grid"] as const) {
      const seat = seatVocabularyFor("Box", layout)!;
      for (const value of seat.values) {
        const doc: BuilderDoc = {
          theme: defaultDocTheme(),
          roots: [node("Box", { p: "4", [seat.prop]: value }, { children: [] })],
        };
        const code = serializeDocument(doc);
        expect(code).toContain(`${seat.prop}="${value}"`);
        expect(code, `${seat.prop}=${value} leaked a length`).not.toMatch(/\d+px/);
        expect(code, `${seat.prop}=${value} leaked a style`).not.toMatch(/style=/);
      }
    }
  });
});

describe("slots are seats, not children", () => {
  it("every type a slot accepts is a real catalog entry", () => {
    for (const type of SLOT_ACCEPTS) {
      expect(CATALOG[type], `a slot accepts "${type}", which is not in the catalog`).toBeDefined();
    }
  });

  it("only entries that declare slots can seat anything", () => {
    expect(slotsFor("Button")).toContain("leading");
    expect(slotsFor("Card")).toHaveLength(0);
    expect(canSit("Button", "Spinner")).toBe(true);
    expect(canSit("Card", "Spinner")).toBe(false);
    // A surface in a control's seat is refused: a slot holds an adornment, not a pane.
    expect(canSit("Button", "Card")).toBe(false);
  });

  it("a seated child never lands in the flow children of the export", () => {
    const seated = node("Button", {}, {
      text: "Save",
      children: [node("Spinner", {}, { slot: "leading" })],
    });
    const doc: BuilderDoc = { theme: defaultDocTheme(), roots: [seated] };
    const code = serializeDocument(doc);
    // The Spinner is in the tag, and the button's own text is still its only content.
    expect(code).toContain("leading={<Spinner />}");
    expect(code).toMatch(/<Button leading=\{<Spinner \/>\}>Save<\/Button>/);
  });
});

describe("the inspector derives — no restated axis list", () => {
  const catalogSource = readFileSync(join(here, "catalog.ts"), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");

  it("axis props reach through componentAxes; the Theme entry through themeAxes", () => {
    expect(catalogSource).toContain("componentAxes");
    expect(catalogSource).toContain("themeAxes[axis]");
  });

  it("no axis value LIST is restated in the catalog", () => {
    // A preset choosing one value is a call site; a bracketed run of them is a copied axis
    // list — the drift componentAxes was exported to end. (MenuItem's ["destructive"] is a
    // designed union of ONE, which no multi-value pattern here matches.)
    const collapsed = catalogSource.replace(/\s+/g, " ");
    for (const forbidden of [
      '["loud"',
      '["1", "2"',
      '["neutral"',
      '["solid", "thin"',
      '["regular", "medium"',
      '["compact"',
      '["none", "small"',
    ]) {
      expect(collapsed, `catalog restates an axis list starting ${forbidden}`).not.toContain(forbidden);
    }
  });
});

describe("stored documents load as the part of them the system still speaks", () => {
  it("unknown types drop, unknown props strip, the rest survives", () => {
    const stored = node("Stack", { gap: "3", zap: "?" }, {
      children: [node("Widget", {}, { text: "gone" }), node("Button", { emphasis: "medium" }, { text: "stays" })],
    });
    const clean = sanitizeNode(stored)!;
    expect(clean.props).toEqual({ gap: "3" });
    expect(clean.children!.map((c) => c.type)).toEqual(["Button"]);
    expect(sanitizeNode(node("Widget"))).toBeNull();
  });
});

describe("tree surgery holds its own invariants", () => {
  it("a clone is the same shape with entirely fresh identity", () => {
    const original = CATALOG.Dialog!.make();
    const copy = cloneWithNewIds(original);
    const ids = (n: BuilderNode): string[] => [n.id, ...(n.children ?? []).flatMap(ids)];
    expect(new Set([...ids(original), ...ids(copy)]).size).toBe(ids(original).length * 2);
    expect(serializeBlock("x", copy)).toBe(serializeBlock("x", original));
  });

  it("a same-parent move speaks PRE-move indices — what a pointer computed in place", () => {
    // Drag-to-move measures the gap among the CURRENT siblings, moving node included. A
    // later target therefore names a position that shifts one left once the node leaves;
    // without the adjustment every downward drag landed one past where the line drew.
    const [a, b, c] = [node("Button", {}, { text: "a" }), node("Button", {}, { text: "b" }), node("Button", {}, { text: "c" })];
    const stack = node("Stack", {}, { children: [a, b, c] });
    const order = (roots: BuilderNode[]) => findNode(roots, stack.id)!.children!.map((n) => n.text);
    expect(order(moveNodeTo([stack], a.id, stack.id, 2))).toEqual(["b", "a", "c"]);
    expect(order(moveNodeTo([stack], a.id, stack.id, 3))).toEqual(["b", "c", "a"]);
    expect(order(moveNodeTo([stack], c.id, stack.id, 0))).toEqual(["c", "a", "b"]);
    // The gaps on either side of the node itself are the same place: no-ops.
    expect(order(moveNodeTo([stack], b.id, stack.id, 1))).toEqual(["a", "b", "c"]);
    expect(order(moveNodeTo([stack], b.id, stack.id, 2))).toEqual(["a", "b", "c"]);
    // A cross-parent move takes the stated index verbatim — nothing shifted there.
    const other = node("Stack", {}, { children: [node("Button", {}, { text: "x" })] });
    const roots = moveNodeTo([stack, other], a.id, other.id, 0);
    expect(findNode(roots, other.id)!.children!.map((n) => n.text)).toEqual(["a", "x"]);
  });

  it("a node cannot be moved into its own subtree", () => {
    const stack = node("Stack", {}, { children: [node("Flex", {}, { children: [] })] });
    const roots = [stack];
    expect(moveNodeTo(roots, stack.id, stack.children![0]!.id)).toBe(roots);
  });

  it("insert, move and remove agree with find", () => {
    const a = node("Button", {}, { text: "a" });
    const b = node("Button", {}, { text: "b" });
    let roots = insertNode([], null, a);
    roots = insertNode(roots, null, b);
    roots = moveNode(roots, b.id, -1);
    expect(roots.map((n) => n.id)).toEqual([b.id, a.id]);
    roots = removeNode(roots, b.id);
    expect(findNode(roots, b.id)).toBeNull();
    expect(findNode(roots, a.id)).not.toBeNull();
  });
});

/**
 * THE FRAME IS THE SYSTEM'S (§27, 2026-08-20).
 *
 * The builder shipped its own app frame — a `100dvh` flex column holding three fixed-width
 * boxes and four Separators — for the ordinary reason: it was written before the system had
 * one. That is the same argument the docs refused a docs framework with, and it does not get
 * weaker for the parts that are "just editor chrome". So the frame is `Shell` now, and these
 * hold it there.
 *
 * The instrument is a real server render of the whole app. `renderToStaticMarkup` gives the
 * first-paint DOM, which is the one that matters here: Shell resolves an untouched pane's
 * resting state in CSS precisely so it is right before any script runs, and a law that mounted
 * and settled would be reading the second answer.
 */
describe("the editor's own frame (§27)", () => {
  const html = renderToStaticMarkup(<BuilderApp />);
  /** The landmark tags in document order, with the pane class each carries. */
  const panes = [...html.matchAll(/<(?:header|nav|main|aside)\b[^>]*\bclass="([^"]*kui-shell-pane[^"]*)"[^>]*>/g)].map(
    (m) => m[1]!.split(/\s+/).find((c) => c.startsWith("kui-shell-") && c !== "kui-shell-pane"),
  );

  // Falsified by swapping the rail and the sidebar in the source — the law reads the real
  // document order, not the presence of five names. (Against the pre-port app the question
  // does not arise: that file mentions `Shell` nowhere, so `panes` is empty.)
  it("is a Shell, in the reading order an app frame has", () => {
    expect(panes).toEqual([
      "kui-shell-header",
      "kui-shell-rail",
      "kui-shell-sidebar",
      "kui-shell-content",
      "kui-shell-inspector",
    ]);
  });

  it("names both nav landmarks — two of them on one page is a page with two anonymous navs", () => {
    const labels = [...html.matchAll(/<nav\b[^>]*\baria-label="([^"]*)"/g)].map((m) => m[1]);
    expect(labels).toHaveLength(2);
    expect(new Set(labels).size).toBe(2);
  });

  /**
   * The port's whole behavioural claim, and the reason it is worth a law: preview used to
   * UNMOUNT the side panes with `{!preview ? … : null}`, so the mode threw away the panel's
   * scroll position and its React state along with its pixels. A pane is the Shell's to
   * close now — `display: none`, state intact — and re-wrapping one in that guard would take
   * the behaviour back without changing anything a rendered law can see, since preview is
   * this component's own state and no static render can reach it.
   *
   * So this one reads the SOURCE, for the reason the `finding.fix` law reads it: what can go
   * wrong lives at a call site no node test can mount. Falsified by restoring the guard
   * around any one pane.
   */
  it("preview closes the panes; it does not unmount them", () => {
    const source = readFileSync(new URL("./builder-app.tsx", import.meta.url), "utf8");
    for (const pane of ["ShellRail", "ShellSidebar", "ShellContent", "ShellInspector"]) {
      expect(source.match(new RegExp(`<${pane}\\b`, "g")), `${pane} is rendered exactly once`).toHaveLength(1);
    }
    const guarded = source.match(/\{\s*!preview\s*\?\s*\(\s*<Shell(?:Rail|Sidebar|Content|Inspector)\b/g);
    expect(guarded, "a pane inside a preview guard is a pane preview unmounts").toBeNull();
  });

  /**
   * ONE LIST BEHIND THE RAIL AND THE PANEL. A square that picks a region the sidebar cannot
   * show is the doc-code drift rule inside a single file, and the two halves are held by
   * different mechanisms: the squares DERIVE from the list (here), and the panel switch is
   * narrowed to `never` (a third region with no panel fails `tsc`, checked by adding one).
   */
  it("the rail offers exactly the regions the sidebar has panels for", () => {
    const squares = [...html.matchAll(/<button\b[^>]*\bkui-shell-rail-item[^>]*>/g)].map((m) => m[0]);
    expect(squares).toHaveLength(LEFT_REGIONS.length);
    for (const region of LEFT_REGIONS) {
      expect(squares.some((s) => s.includes(`aria-label="${region.label}"`))).toBe(true);
    }
    expect(squares.filter((s) => s.includes('aria-current="page"'))).toHaveLength(1);
  });
});
