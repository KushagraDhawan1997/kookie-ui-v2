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

import * as Kookie from "@kushagradhawan/kookie-ui-react";
import { Theme, componentAxes } from "@kushagradhawan/kookie-ui-react";

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
  TIER_KEYS,
  type BuilderDoc,
  type BuilderNode,
} from "./model";
import { API } from "../(docs)/components/api.generated";
import { renderNode } from "./render";
import { BuilderApp } from "./builder-app";
import { Layers, LayersFilter } from "./layers";
import { JumpBar } from "./chrome";
import { ReviewPanel } from "./review-panel";
import { Inspector } from "./inspector";
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

/**
 * MATERIAL IS AN AXIS, AND AN AXIS OWES A READER (2026-09-01, Kushagra: "Button supports
 * backdrop, right? Shouldn't it be there?").
 *
 * It was not: Button, Toggle, SegmentedControl and Chip each declare `backdrop` in the package
 * and none of them declared it here, so neither the builder's inspector nor the docs page —
 * whose knobs are DERIVED from this catalog — could ask for it. Every other axis is covered by
 * the entry-exists law above, which passes the moment a component is placeable and says nothing
 * about which of its axes are reachable.
 *
 * `backdrop` alone, deliberately, and not "every declared prop": the catalog omits most props on
 * purpose (`className`, handlers, refs), so a law over all of them would be a law about the
 * omissions. This one is about §10 selectivity — a component that can be asked to express the
 * theme's material, in a tool whose whole job is stating props, with no way to ask.
 *
 * Read off the GENERATED API rather than a list written here, so the day a component gains the
 * prop this law starts asking about it without anyone remembering to.
 */
describe("every component that can be asked for the material can be asked here", () => {
  const takesBackdrop = Object.entries(API)
    .filter(([, entry]) => entry.props.some((prop) => prop.name === "backdrop"))
    .map(([name]) => name);

  it("the API was read — an empty list audits nothing", () => {
    expect(takesBackdrop).toContain("Button");
    expect(takesBackdrop.length).toBeGreaterThan(5);
  });

  for (const name of Object.keys(CATALOG)) {
    if (!takesBackdrop.includes(name)) continue;
    it(`${name} declares backdrop`, () => {
      expect(
        (CATALOG[name]!.props as Record<string, unknown>)["backdrop"],
        `${name} takes a backdrop prop and the catalog does not offer it — the axis has no reader`,
      ).toBeDefined();
    });
  }
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
    if (spec === "@kushagradhawan/kookie-ui-react") return Kookie;
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
        new RegExp(`import \\{[^}]*\\b${type}\\b[^}]*\\} from "@kushagradhawan/kookie-ui-react"`),
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

  it("A PART renders in its own seat too — the half this walk was missing", () => {
    /* `placeable` filters `!entry.partOf`, so every law above is blind to exactly the entries
       a user reaches through the "Inside X" group and the right-click insert menu — which is
       most of the catalog. `BreadcrumbEllipsis` shipped 2026-09-01 with `make: () => node(…, {})`
       against a REQUIRED `items` prop, so the one insert the grammar allowed threw
       `Cannot read properties of undefined (reading 'map')` and replaced the canvas with the
       error boundary, while 180 of 180 laws stayed green (ultracode audit, six of six lenses).

       A part cannot be rendered alone — it needs the ancestor whose context it reads — so this
       places each one inside its own root's default tree at the first seat the GRAMMAR allows,
       which is the same question the palette asks. A part with no legal seat in that tree is
       skipped and named, because "nowhere to put it" is a fact about the preset, not a defect. */
    const parts = Object.entries(CATALOG).filter(([, e]) => e.partOf);
    expect(parts.length, "no parts to walk").toBeGreaterThan(15);

    const seatIn = (node: BuilderNode, type: string, chain: string[]): BuilderNode | null => {
      if (canContain(node.type, type, chain)) return node;
      for (const child of node.children ?? []) {
        const found = seatIn(child, type, [...chain, node.type]);
        if (found) return found;
      }
      return null;
    };

    let placed = 0;
    for (const [type, entry] of parts) {
      const root = CATALOG[entry.partOf!];
      if (!root) continue;
      const tree = root.make();
      const seat = seatIn(tree, type, []);
      if (!seat) continue; // no legal seat in the preset — not this law's subject
      seat.children = [...(seat.children ?? []), entry.make()];
      placed += 1;
      const html = renderToStaticMarkup(
        React.createElement(Theme, null, renderNode(tree, {} as never)),
      );
      expect(html.length, `${type} threw or rendered nothing inside ${entry.partOf}`).toBeGreaterThan(20);
    }
    // Vacuity in the other direction: a `seatIn` that always answered null would pass silently.
    expect(placed, "no part found a legal seat — the walk proved nothing").toBeGreaterThan(8);
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
  // The header and the rail went on 2026-09-14/15: the canvas carries its own floating
  // toolbars, and the sidebar switches between Layers and Add itself.
  it("is a Shell, in the reading order an app frame has", () => {
    expect(panes).toEqual(["kui-shell-sidebar", "kui-shell-content", "kui-shell-inspector"]);
  });

  it("names every landmark it draws, each with its own name", () => {
    const labels = [...html.matchAll(/<(?:nav|aside)\b[^>]*\baria-label="([^"]*)"/g)].map((m) => m[1]);
    expect(labels.length, "the sidebar and the inspector are both named").toBeGreaterThanOrEqual(2);
    expect(new Set(labels).size).toBe(labels.length);
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
    for (const pane of ["ShellSidebar", "ShellContent", "ShellInspector"]) {
      expect(source.match(new RegExp(`<${pane}\\b`, "g")), `${pane} is rendered exactly once`).toHaveLength(1);
    }
    const guarded = source.match(/\{\s*!preview\s*\?\s*\(\s*<Shell(?:Sidebar|Content|Inspector)\b/g);
    expect(guarded, "a pane inside a preview guard is a pane preview unmounts").toBeNull();
  });

});

/* ── Layers: the panel is the package's Tree, not a drawing of one ─────────────────────────
   THE SWAP LEFT EVERY LAW GREEN (2026-09-02), which is this repo's own recurring finding:
   nothing in 911 docs laws read the Layers panel at all, so a hand-rolled tree with no
   keyboard, no disclosure and a mis-announced structure and the package's machine were
   indistinguishable to the suite. Each law below was falsified against the panel as it stood
   before the swap — the shapes named in the comments are what that panel actually rendered. */
describe("Layers announces a real tree", () => {
  const tree = node("Stack", {}, {
    children: [
      node("Card", {}, { children: [node("Text", {}, { text: "hello" })] }),
      node("Button", {}, { text: "Go" }),
    ],
  });
  const html = renderToStaticMarkup(
    <Theme>
      <Layers
        roots={[tree]}
        selection={[tree.children![0]!.id]}
        empty={false}
        onClearFilter={() => {}}
        onSelect={() => {}}
        onDragBegin={() => {}}
        onDragFinish={() => {}}
        canRowDrop={() => true}
        onRowDrop={() => {}}
        visible={null}
      />
    </Theme>,
  );
  const rows = [...html.matchAll(/<(\w+)([^>]*\brole="treeitem"[^>]*)>/g)].map((m) => ({
    tag: m[1]!,
    attrs: m[2]!,
  }));

  it("the panel drew rows at all — an empty match audits nothing", () => {
    expect(rows.length).toBe(4);
  });

  /* THE ROW IS THE FOCUSABLE THING. The old panel put a `<Button>` INSIDE a `<Box
     role="treeitem">`, which is the generic-node-between-container-and-item defect the menu's
     ScrollArea viewport was fixed for (2026-08-19): assistive technology is told the item is
     the div, and the thing a keyboard can reach is a child of it. */
  it("every treeitem IS the button, never a box holding one", () => {
    for (const row of rows) expect(row.tag).toBe("button");
    expect(html).not.toMatch(/role="treeitem"[^>]*>\s*<button/);
  });

  /* The old rows carried `aria-level` alone, so a screen reader could say how deep a row was
     and never "3 of 7" — which is the half of the announcement that tells you a branch has
     more in it than the one row you are standing on. */
  it("every row states its whole position, not just its depth", () => {
    for (const row of rows) {
      expect(row.attrs).toMatch(/\baria-level="\d+"/);
      expect(row.attrs).toMatch(/\baria-setsize="\d+"/);
      expect(row.attrs).toMatch(/\baria-posinset="\d+"/);
    }
  });

  /* ONE VOCABULARY FOR SELECTION. The old rows said `aria-selected` on the wrapper AND
     `aria-pressed` on the button inside it — two different things announced about one row,
     and `aria-pressed` means a toggle, which a tree row is not. */
  it("a selected row is selected, and is not also a pressed toggle", () => {
    expect(rows.filter((r) => /aria-selected="true"/.test(r.attrs))).toHaveLength(1);
    expect(html).not.toMatch(/aria-pressed/);
  });

  /* THE INDENT IS DERIVED (§33): one level is one `--kui-ct-icon`, stamped as the level and
     spent by the stylesheet. The old panel multiplied a layout-space step by the depth in a
     `style` prop — a second answer to "how far in does a child sit", picked by hand. */
  it("the indent is the level, not a hand-multiplied space step", () => {
    expect(html).toMatch(/--kui-tree-level:\s*0/);
    expect(html).toMatch(/--kui-tree-level:\s*1/);
    const source = readFileSync(new URL("./layers.tsx", import.meta.url), "utf8");
    expect(source).not.toMatch(/paddingInlineStart/);
    expect(source).not.toMatch(/layout-space/);
  });
});

/* ── The panes' own chrome rows (§27) ──────────────────────────────────────────────────────
   Both laws read the app's real server render and were falsified by putting each row back
   where it was: the filter inside the scroller, and the jump bar as a bare `Flex` with hand
   written padding. */
describe("a pane's chrome is a pane part", () => {
  const html = renderToStaticMarkup(<BuilderApp />);
  /** One pane's markup, from its own class to the next pane's. */
  const pane = (region: string): string => {
    const from = html.indexOf(`kui-shell-${region}`);
    const rest = html.slice(from + 1);
    const next = rest.search(/kui-shell-(?:header|rail|sidebar|content|inspector)\b/);
    return next === -1 ? rest : rest.slice(0, next);
  };
  /** The pane header's OWN opening tag — read as a tag, never as a byte window around it.
      The first spelling of these two laws took `slice(index - 100, …)`, and in the content
      pane that index is 31, so the start went NEGATIVE and JavaScript counted it from the far
      end of the string: the window came back empty and a negative assertion over an empty
      string passes whatever the code does. Caught by its own sabotage pass — floating the
      jump bar changed nothing the law could see. */
  const headerTag = (region: string): string | null =>
    pane(region).match(/<div [^>]*class="[^"]*kui-pane-header[^"]*"[^>]*>/)?.[0] ?? null;

  it("every pane drew a header at all — a null audits nothing", () => {
    expect(headerTag("sidebar")).not.toBeNull();
    expect(headerTag("content")).not.toBeNull();
    expect(headerTag("inspector")).not.toBeNull();
  });

  it("the sidebar's filter row floats over its scroller", () => {
    const sidebar = pane("sidebar");
    expect(headerTag("sidebar")).toMatch(/data-float/);
    expect(
      sidebar.indexOf("kui-pane-header"),
      "the header comes before the scroller it floats over",
    ).toBeLessThan(sidebar.indexOf("kui-shell-scroll"));
    // And the scroller fades, which is what keeps the rows legible as they pass behind it.
    expect(sidebar).toMatch(/data-fade/);
  });

  /* THE INSPECTOR'S PANEL SWITCH IS ITS CHROME ROW (2026-09-02; a SegmentedControl in a
     floating Toolbar since 2026-09-15, where it was a tab bar). Pinned above the scroller, so
     it never scrolls away with the panel it switches. Falsified by moving the switch into the
     scroller. */
  it("the inspector's panel switch is its chrome row, not the first thing in its scroller", () => {
    const inspector = pane("inspector");
    const header = inspector.indexOf("kui-pane-header");
    const control = inspector.indexOf('role="radiogroup"');
    const scroll = inspector.indexOf("kui-shell-scroll");
    expect(header, "the inspector has a pane header").toBeGreaterThan(-1);
    expect(control, "the switch rendered at all").toBeGreaterThan(-1);
    expect(scroll, "the scroller rendered at all").toBeGreaterThan(-1);
    expect(header).toBeLessThan(control);
    expect(control, "the switch is pinned above the scroller, not inside it").toBeLessThan(scroll);
  });

  /* A FLOATING CHROME CONTROL EXPRESSES THE MATERIAL (§10, 2026-09-02, Kushagra: "This text
     field needs backdrop"). The sidebar's filter row floats and the panel scrolls behind it,
     and a field's fill is an ALPHA over the neutral ramp (2026-08-17 — fills composite
     against their LOCAL ground), which here is passing rows rather than the pane: the words
     read straight through the box.

     RENDERED UNDER THE APP'S OWN THEME, and that is the load-bearing half of the fixture. A
     bare render resolves the default `material: "solid"`, so the stamp would read solid
     whether the prop were there or not and the law would pass over a deleted `backdrop`.
     `layout.tsx` wraps the site in `material="regular"`, so these render what the app
     renders — demonstrated rather than asserted: swapping the fixture to `material="solid"`
     fails the law, which is what says the environment is doing work.

     ONE FIELD for both regions since 2026-09-15 (the Add filter is `LayersFilter` with other
     words), so one law covers both. Rendered directly, because reaching the Add region
     through the app would mean a test-only prop for switching regions. Falsified by removing
     the prop. */
  it("the Layers filter states its backdrop", () => {
    const themed = renderToStaticMarkup(
      <Theme material="regular">
        <LayersFilter value="" onChange={() => {}} inputRef={null} />
      </Theme>,
    );
    expect(themed, "the field rendered at all").toContain("Filter layers");
    expect(themed).toMatch(/data-material="(?!solid)/);
  });

});

/* ── The palette is a list of rows ─────────────────────────────────────────────────────────
   Kushagra, with the Layers tree open beside it: "this is the same (the add thing)?" The
   entries were quiet Buttons in a two-column grid — a button is a thing you press to DO
   something and every entry here is a thing you pick out of a list, which is §21's own
   sentence. Since 2026-09-15 the palette is the package's Tree grouped by category, so the
   row family arrives by construction. Read from the SOURCE: the panel needs a live command
   context to render, and a test-only one would be a second builder. Falsified by rendering
   the entries as Buttons. */
describe("the component palette is the row family", () => {
  const source = readFileSync(new URL("./add-panel.tsx", import.meta.url), "utf8");

  it("the palette is the package's Tree, and its entries are tree nodes", () => {
    expect(source).toMatch(/<Tree\b/);
    expect(source).toMatch(/items: TreeNode\[\]/);
  });

  it("no entry is a Button wearing a row's job", () => {
    // The one Button in the file clears the filter, inside the empty state.
    const buttons = source.match(/<Button\b/g) ?? [];
    expect(buttons.length).toBe(1);
    expect(source.slice(source.indexOf("<Button"), source.indexOf("</Button>"))).toContain("onClearQuery");
  });
});


/* ── The property panel's structure (2026-09-02, re-cut 2026-09-15) ───────────────────────
   Kushagra, with Figma's inspector open beside ours: "we dont have a system yet, lets try
   and make a structure and system out of it". The 2026-09-02 passes built a two-column panel
   with names beside their values; the 2026-09-15 iteration took Figma's anatomy instead —
   captions ABOVE controls, two value columns and one action column — and inspector.tsx's
   structure block states it: PANEL, SECTION, ROW, CELL. These laws hold the parts of it a
   string can see. */
describe("the inspector is built from its four parts", () => {
  const node = { id: "n1", type: "TextField", props: { placeholder: "you@company.com" } };
  const html = renderToStaticMarkup(
    <Theme>
      <Inspector
        node={node as never}
        onProp={() => {}}
        onText={() => {}}
        onSlot={() => {}}
        onSelect={() => {}}
        measured={[{ label: "box", value: "748 x 44" }]}
      />
    </Theme>,
  );
  const source = readFileSync(new URL("./inspector.tsx", import.meta.url), "utf8");
  const SECTIONS = ["Content", "Appearance", "State", "Slots"];

  it("the panel rendered its sections at all — an empty match audits nothing", () => {
    for (const title of SECTIONS) expect(html).toContain(">" + title + "<");
  });

  /* ONE GRID FOR THE PANEL, DECLARED ONCE. A grid per section lets every section pick its own
     columns; the rows are subgrids of this one, so every control starts and ends on the same
     lines. A second `columns=` anywhere in the file is how a section takes its columns back. */
  it("the panel is ONE grid, and its columns have one home", () => {
    expect((html.match(/--kui-gtc/g) ?? []).length, "one grid, not one per section").toBe(1);
    expect(html).toContain("--kui-gtc:minmax(0, 1fr) minmax(0, 1fr) var(--control-height-2)");
    expect(source.match(/columns=\{?["`][^"`]*["`]/g) ?? [], "one grid template in the file").toHaveLength(1);
    expect(html, "every row is a subgrid of it").toContain("grid-template-columns:subgrid");
  });

  /* EVERY SEAM SPANS THE PANEL. A section boundary that stops at the value columns reads as a
     line under one control rather than a division of the panel. */
  it("every hairline spans all three columns", () => {
    const seps = [...html.matchAll(/<div class="kui-box" style="([^"]*)"><div[^>]*role="separator"/g)].map(
      (m) => m[1]!,
    );
    expect(seps.length, "the panel drew hairlines").toBeGreaterThanOrEqual(3);
    for (const style of seps) expect(style).toContain("--kui-ga:auto / 1 / auto / -1");
  });

  /* THE RANKS ARE A LADDER, one type step apart: a section title at 2, medium weight, full ink;
     a control's caption at 1, medium ink. Collapsing the two onto one step is how the panel read
     flat before the 2026-09-02 pass. */
  it("a section title stands one type step over the captions under it", () => {
    const step = (text: string) => html.match(new RegExp(`<span data-size="(\\d)"([^>]*)>${text}</span>`));
    const title = step("Content");
    const caption = step("Placeholder");
    expect(title, "a section heads itself").not.toBeNull();
    expect(caption, "a control is captioned").not.toBeNull();
    expect(Number(title![1]) - Number(caption![1])).toBe(1);
    expect(title![2]).toContain('data-weight="medium"');
    expect(title![2]).toContain('data-emphasis="loud"');
  });

  /* EVERY CAPTION IS THE SAME CAPTION. Anchored on the control that FOLLOWS it, so this reads
     only text that really captions a value, and asserts one spelling for all of them. */
  it("every caption in the panel is written the same way", () => {
    const captions = [...html.matchAll(/<span ([^>]*)class="kui-type kui-text"[^>]*>[^<]*<\/span><(?:span|div|button)[^>]*class="kui-control/g)];
    expect(captions.length, "the fixture reached several captioned controls").toBeGreaterThanOrEqual(3);
    expect(new Set(captions.map((m) => m[1]))).toEqual(
      new Set(['data-size="1" data-weight="regular" data-emphasis="medium" ']),
    );
  });

  /* A CAPTION IS A STRING, BY TYPE. A composed label is how a second treatment gets in, and
     prose in a header does not stop the next one. Read from the source, because the type is
     the enforcement and a rendered panel cannot see it. */
  it("a row's and a cell's caption is typed as a string, not a node", () => {
    for (const part of ["Row", "Cell"]) {
      const from = source.indexOf(`export function ${part}({`);
      const props = source.slice(from, source.indexOf(") {", from));
      expect(props, `${part} declares its label`).toMatch(/label\?: string;/);
      expect(props, "and it is not a node").not.toMatch(/label\??: React\.ReactNode/);
    }
  });
});

/* A responsive row keeps its trailing control whether or not it has anything left to add
   (2026-09-02). The `+` used to render only while a tier was unstated, which took the value's
   right edge with it: state every tier and that row reached a line no other row in the
   section reached. Disabled is the honest spelling — the same thing Arrange does with a
   command that is not armed. */
describe("a responsive row's trailing control never leaves", () => {
  const render = (gap: unknown) =>
    renderToStaticMarkup(
      <Theme>
        <Inspector
          node={{ id: "n1", type: "Flex", props: { gap } } as never}
          onProp={() => {}}
          onText={() => {}}
          onSlot={() => {}}
          onSelect={() => {}}
        />
      </Theme>,
    );

  // One + per SECTION since 2026-09-15, offering every breakpoint any prop in it could take.
  const plus = (html: string) =>
    [...html.matchAll(/<button[^>]*aria-label="Add a breakpoint"[^>]*>/g)].map((m) => m[0]);

  it("it is there with tiers left to add, and there when there are none", () => {
    const some = plus(render("3"));
    expect(some.length, "a plain value offers the breakpoints").toBeGreaterThanOrEqual(1);
    expect(some.some((tag) => !/disabled/.test(tag)), "and the control is live").toBe(true);

    const all = Object.fromEntries(TIER_KEYS.map((t) => [t, "3"]));
    const none = plus(render(all));
    expect(none.length, "every tier stated, and the control is still in the row").toBe(some.length);
  });

  it("a stated tier can be taken back from the row itself", () => {
    const html = render({ initial: "3", ...(TIER_KEYS[1] ? { [TIER_KEYS[1]]: "5" } : {}) });
    expect(html, "the tier's own row offers the way out").toContain(
      `Remove the ${TIER_KEYS[1]} breakpoint from gap`,
    );
  });
});

/* ── The builder's empty states are the block (2026-09-02) ────────────────────────────────
   Kushagra, looking at the inspector with nothing selected: *"In builder shell, lets use empty
   state block we have now"*. Four regions in this app can be empty and each said so in one
   quiet line, which is the shape an empty state has before anybody has decided what one is —
   no rank, no arrangement, and in two of them no words at all: a palette filter that matched
   nothing rendered an EMPTY PANE, because every group returns null when its entries are
   filtered out.

   What the block brings is not the words, it is the taxonomy. Nothing yet, nothing matched,
   nothing available — they differ in RANK and in whether there is anything to do, and the
   mistake it exists to prevent is offering "create one" under a filter that returned nothing.
   So these laws hold the split rather than the copy. */
describe("the builder's empty states are the block, and they carry its taxonomy", () => {
  const paint = (ui: React.ReactElement) => renderToStaticMarkup(<Theme>{ui}</Theme>);
  const tree = node("Stack", {}, { children: [node("Button", {}, { text: "Go" })] });

  /* NOTHING MATCHED CARRIES THE WAY OUT, AND IT CLEARS. The one editorial rule the block
     states outright. Read as a real button with a real handler rather than as a string: the
     `×` in the filter field is not this, and a state whose action is absent is the one-line
     version this replaced. */
  it("a filter that matched nothing offers to clear it, and offers nothing else", () => {
    const html = paint(
      <Layers
        roots={[tree]}
        selection={[]}
        empty={false}
        onClearFilter={() => {}}
        onSelect={() => {}}
        onDragBegin={() => {}}
        onDragFinish={() => {}}
        canRowDrop={() => true}
        onRowDrop={() => {}}
        // Nothing survives the filter — the state this law is about.
        visible={new Set<string>()}
      />,
    );
    expect(html, "it is the block").toContain("kb-empty");
    expect(html, "and it says what the filter is").toContain("Nothing here is called that");
    expect(html, "with the one thing to do").toContain("Clear the filter");
    // ONE action. `action` and `secondary` are two slots and a filter state wants one of them.
    expect((html.match(/kui-button/g) ?? []).length, "one action, not two").toBe(1);
    // And it does NOT offer to create something — the mistake the block exists to prevent.
    expect(html.toLowerCase(), "no create under a filter").not.toMatch(/\bnew\b|\badd\b|template/);
  });

  /* NOTHING YET DOES NOT. The same panel, the same component, a different emptiness — and the
     difference is visible in the markup, which is what stops the two collapsing back into one
     string over time. */
  it("an empty canvas says so and offers nothing to clear", () => {
    const html = paint(
      <Layers
        roots={[]}
        selection={[]}
        empty
        onClearFilter={() => {}}
        onSelect={() => {}}
        onDragBegin={() => {}}
        onDragFinish={() => {}}
        canRowDrop={() => true}
        onRowDrop={() => {}}
        visible={null}
      />,
    );
    expect(html, "it is the block").toContain("kb-empty");
    expect(html).toContain("No layers yet");
    expect(html, "there is no filter to clear").not.toContain("Clear the filter");
  });

  /* A CLEAN REVIEW IS AN OUTCOME, NOT AN ABSENCE — which is why it is the only empty state in
     the builder that carries a mark, and why it offers nothing to do. An action here would be
     an action about a state you wanted. */
  it("a clean review carries the mark, and nothing to do about it", () => {
    const html = paint(<ReviewPanel findings={[]} selection={[]} onSelect={() => {}} onFix={() => {}} />);
    expect(html, "it is the block").toContain("kb-empty");
    expect(html, "and the tick reads before the sentence does").toContain("kb-empty-mark");
    expect(html).toContain("Nothing to answer for");
    expect((html.match(/kui-button/g) ?? []).length, "nothing to do").toBe(0);
  });

  /* AND THE ONE THAT IS NOT A MARK. A mark is for a state a reader meets before they know what
     the region is for; three of these four are regions the reader has already used, so the tick
     above must be the only one. Counted across all three, because "only" is the claim. */
  it("the review's tick is the only mark in the builder's empty states", () => {
    const marks = [
      paint(<ReviewPanel findings={[]} selection={[]} onSelect={() => {}} onFix={() => {}} />),
      paint(
        <Layers
          roots={[]}
          selection={[]}
          empty
          onClearFilter={() => {}}
          onSelect={() => {}}
          onDragBegin={() => {}}
          onDragFinish={() => {}}
          canRowDrop={() => true}
          onRowDrop={() => {}}
          visible={null}
        />,
      ),
      paint(
        <Layers
          roots={[tree]}
          selection={[]}
          empty={false}
          onClearFilter={() => {}}
          onSelect={() => {}}
          onDragBegin={() => {}}
          onDragFinish={() => {}}
          canRowDrop={() => true}
          onRowDrop={() => {}}
          visible={new Set<string>()}
        />,
      ),
    ].map((h) => (h.match(/kb-empty-mark/g) ?? []).length);
    expect(marks, "exactly one of the three").toEqual([1, 0, 0]);
  });

  /* NO REGION STILL WRITES ITS OWN. The cheapest way to lose this is not a rewrite, it is the
     next empty region getting one quiet line because that is what the file next to it used to
     do. The law reads the SOURCE of all four files: an empty state is the block, and the
     one-liners it replaced are gone by their own words. */
  it("no builder region hand-writes an empty state any more", () => {
    for (const file of ["builder-app.tsx", "layers.tsx", "review-panel.tsx"]) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      for (const gone of [
        "Click something on the canvas, or pick it in Layers.\n",
        "The canvas is empty.\n",
        "Nothing here is called that.\n",
      ]) {
        expect(source, `${file} still writes an empty state by hand`).not.toContain(gone);
      }
    }
    const app = readFileSync(new URL("./builder-app.tsx", import.meta.url), "utf8");
    expect(app, "and the block is where they come from").toContain('from "../../blocks/empty-state"');
  });
});

/* ── The jump bar is the Breadcrumb (2026-09-02) ──────────────────────────────────────────
   Kushagra, on the path over the canvas: *"Breadcrumb"*. It was quiet Buttons with a `›`
   `Text` hand-placed between them — the exact spelling §39 refused when it dropped
   `BreadcrumbSeparator`: layout wearing a part's name, an N-1 rule kept by hand, and a glyph
   the call site picked. It also announced nothing: no landmark, no list, and `aria-current`
   set to the string `"true"` rather than `"page"`.

   What the app still owns is the TRUNCATION, because §3 forbids the component owning what it
   shows — a document nests as deep as an author builds it, and this bar is one control row at
   the pane's index. */
describe("the jump bar is the Breadcrumb, and the app owns only the truncation", () => {
  /** A chain `depth` deep, and the id of its deepest node. */
  const deep = (depth: number) => {
    const leaf = node("Text", {}, { text: "end" });
    let root: BuilderNode = leaf;
    for (let i = 0; i < depth - 1; i += 1) root = node("Stack", {}, { children: [root] });
    return { root, leafId: leaf.id };
  };
  const paint = (depth: number) => {
    const { root, leafId } = deep(depth);
    return renderToStaticMarkup(
      <Theme>
        <JumpBar roots={[root]} selection={[leafId]} onSelect={() => {}} />
      </Theme>,
    );
  };

  it("it is the component — a landmark, a list, and the system's own chevron", () => {
    const html = paint(3);
    expect(html, "the landmark").toContain('aria-label="Selection path"');
    expect(html, "the list").toContain("kui-breadcrumb-list");
    expect(html, "and its items").toContain("kui-breadcrumb-item");
    // The hand-placed separator, and the one thing that says it is gone.
    expect(html, "no hand-written punctuation").not.toContain("\u203a");
    expect(html, "the chevron is the component's").toContain("kui-breadcrumb-separator");
  });

  /* WHERE YOU ARE IS NOT A LINK, and it is announced. The old bar made every crumb a button
     including the one you are standing on, and wrote `aria-current="true"` — which is a valid
     token meaning "current", but not the one for a place in a path. */
  it("the end of the path is the page, and everything before it is a way back", () => {
    const html = paint(4);
    expect((html.match(/aria-current="page"/g) ?? []).length, "exactly one current place").toBe(1);
    expect(html, "and it is not a link").toContain("kui-breadcrumb-page");
    // The last item in the list is the one carrying it.
    const items = html.split("kui-breadcrumb-item").slice(1);
    expect(items.at(-1), "the current place is at the END of the path").toContain('aria-current="page"');
    expect(items.slice(0, -1).join(""), "and none of the ones before it are").not.toContain("aria-current");
  });

  /* A PLACE REACHED BY CODE IS A BUTTON. A node in this document has no URL, and an anchor
     with no href is not operable — §39 blesses the case in the ellipsis's own item type and
     `render` is how the treatment reaches a different element. */
  it("a crumb is a button carrying the crumb's treatment, never a hrefless anchor", () => {
    const html = paint(3);
    expect(html, "the treatment is on a button").toMatch(/<button[^>]*class="[^"]*kui-breadcrumb-link/);
    expect(html, "and there is no anchor pretending to be one").not.toMatch(
      /<a(?![^>]*href)[^>]*kui-breadcrumb-link/,
    );
  });

  /* THE APP DECIDES WHAT TO HIDE, and both directions are the law: a shallow path must show
     everything, or "it truncates" is satisfied by a bar that always truncates. */
  it("a shallow path shows every level, and a deep one keeps the first and the last two", () => {
    const shallow = paint(4);
    expect((shallow.match(/kui-breadcrumb-item/g) ?? []).length, "four levels, four crumbs").toBe(4);
    expect(shallow, "and nothing is hidden").not.toContain("Levels between");

    const long = paint(8);
    expect((long.match(/kui-breadcrumb-item/g) ?? []).length, "first, last two, and the dots").toBe(3);
    expect(long, "the stretch between is behind the dots").toContain("Levels between");
  });

  /* AND THE DOTS OPEN. `BreadcrumbEllipsis` requires its `items`, so an inert marker is not
     expressible — but a call site can still hand it an EMPTY list, which renders a trigger
     that opens an empty menu. The law reads the source: every level this bar drops goes into
     the list it hands over, so truncating the path never puts a level out of reach. */
  it("every dropped level is handed to the dots", () => {
    const source = readFileSync(new URL("./chrome.tsx", import.meta.url), "utf8");
    expect(source, "the dropped levels are what the ellipsis is given").toMatch(
      /const hiddenItems = dropped\.map\(/,
    );
    expect(source, "and each one goes somewhere").toMatch(/label: n\.type, onClick:/);
  });
});

/* ── The builder speaks the system's own vocabulary (2026-09-03) ──────────────────────────
   Kushagra, on the top bar: *"Please scan for other things too, like not using hugeicons, not
   using size 2 icon button as default, or any button etc etc."* The scan found one shape
   repeated: a control written out BY HAND where the package ships the thing itself. A `⋯`
   character where an icon goes, `aria-pressed` bolted onto a Button where a Toggle exists, a
   count baked into a label where a Badge exists, four hand-painted declarations where a Card
   does. These laws hold each one, so the next hand-written control fails here rather than
   being noticed in a screenshot. */
describe("the builder writes no control the package already ships", () => {
  const FILES = ["builder-app.tsx", "chrome.tsx", "command-palette.tsx", "inspector.tsx", "layers.tsx", "review-panel.tsx"];
  const sources = FILES.map((f) => [f, readFileSync(new URL(`./${f}`, import.meta.url), "utf8")] as const);
  /** The source with its comments stripped — every claim below is about CODE, and this repo's
      own laws have twice fired on their own explaining prose. */
  const code = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  /* A GLYPH IS DRAWN, NOT TYPED. A `⋯` or a `−` as a label is drawn by whatever face the line
     resolved, at that face's weight, beside icons the package draws at `iconStroke` — the
     2026-08-23 two-grids defect in its plainest form. Three of them shipped: the document
     menu, a saved block's menu, and the two zoom steps. */
  it("no character stands in for an icon", () => {
    for (const [file, src] of sources) {
      const found = [...code(src).matchAll(/>\s*([⋯…−–—×✕✓＋]|\+)\s*</g)].map((m) => m[1]);
      expect(found, `${file} types a glyph instead of drawing one`).toEqual([]);
    }
  });

  /* A PALETTE IS A `Command` (§44, 2026-09-04). This app's ⌘K is the forcing case DECISIONS §44
     names by path: it was assembled out of Dialog, TextField, ScrollArea and Row with its own
     keyboard model written longhand — an `active` index, arrow-key branches, an Enter branch and
     a `scrollIntoView` to keep the highlight in view. That is verbatim the list §44 says an app
     must never write twice, and a copy of it drifts the way the hand-painted highlight fill in
     the same file already had.

     BOTH HALVES, because either alone is satisfiable by the defect. Importing the component
     while keeping a private keyboard model is the shape that ships when someone "migrates" a
     palette, and a file with no arrow keys in it might simply have no palette. The comments are
     stripped first — this file's own prose names all four of these, and this repo's laws have
     twice fired on their own explanation. */
  it("the command palette is the package's Command, and keeps no keyboard model of its own", () => {
    const src = sources.find(([f]) => f === "command-palette.tsx");
    expect(src, "the palette source moved — this law is now about nothing").toBeDefined();
    const body = code(src![1]);
    expect(body, "it does not use the package's palette").toMatch(/<CommandContent[\s>]/);
    for (const own of ["ArrowDown", "ArrowUp", "scrollIntoView", 'key === "Enter"']) {
      expect(body, `the palette still drives ${own} itself`).not.toContain(own);
    }
  });

  /* A TOGGLE IS A TOGGLE (§34). `aria-pressed` on a Button plus an emphasis the call site
     computes IS the component, written out longhand — and the component is where the pressed
     state comes from the primitive rather than from a prop nobody validates. */
  it("nothing bolts aria-pressed onto a Button", () => {
    for (const [file, src] of sources) {
      expect(code(src), `${file} hand-writes a toggle`).not.toMatch(/aria-pressed=/);
    }
  });

  /* `aria-current` NAMES A LOCATION IN A SET — a page in a nav, a crumb in a path. It was on
     the Review button meaning "this pane is open", which is `aria-expanded` and which
     `ShellTrigger` publishes already: redundant and wrong at once. The breadcrumb is the one
     place in this app that has a set to be current in, and it says `page`. */
  it("aria-current is only ever a place in a path", () => {
    for (const [file, src] of sources) {
      for (const m of code(src).matchAll(/aria-current=\{?["']?([a-z]*)/g)) {
        expect(m[1], `${file} says aria-current="${m[1]}"`).toBe("page");
      }
    }
  });

  /* A COUNT NEVER CHANGES A CONTROL'S WIDTH. Baked into a visible label it moved every
     control after it each time the document did — Tabs' own measured argument against a
     heavier active label. Since 2026-09-15 Review is an icon segment and the count lives in
     its accessible name, which has no width. */
  it("the review count is in the accessible name, never in visible text", () => {
    const html = renderToStaticMarkup(<BuilderApp />);
    expect(html, "the control is there").toMatch(/aria-label="Review(?:, \d+ findings)?"/);
    const app = readFileSync(new URL("./builder-app.tsx", import.meta.url), "utf8");
    expect(code(app), "no count spliced into a visible label").not.toMatch(/>\s*Review \{/);
  });

  /* THE FENCE (§13). `--shadow-1..5` is reached through the world's chrome roles, and a law
     walks every package stylesheet asserting no rule names one directly. An app is not the
     package, but a hand-painted pane is the same mistake with no law over it — the toast
     stated the seal, a hairline, a corner and `var(--shadow-3)`, which is a Card. */
  it("no app file paints a pane by hand", () => {
    for (const [file, src] of sources) {
      expect(code(src), `${file} reaches past the chrome roles`).not.toMatch(/--shadow-[1-5]/);
      expect(code(src), `${file} paints its own seal`).not.toMatch(/background:\s*"var\(--color-surface\)"/);
    }
  });

  /* ONE HOME FOR A MESSAGE. The toast rendered TWICE — as a `Text` in the header and as the
     `Toast` at the root — so two `aria-live` regions announced the same string, which a screen
     reader reads twice. */
  it("a toast is announced once", () => {
    const app = readFileSync(new URL("./builder-app.tsx", import.meta.url), "utf8");
    expect((code(app).match(/aria-live/g) ?? []).length, "one live region in the app frame").toBe(1);
    expect(code(app), "and the message has one renderer").toMatch(/<Toast message=\{toast\} \/>/);
  });

  /* A DEFAULT RESTATED IS A DEFAULT WITH TWO HOMES, and the one that is not the config drifts.
     `size="2"` on a control is the baseline said again; the builder's own header comment names
     the shape. Type and surface sizes are real choices and stay. */
  it("no control restates the size it would have taken anyway", () => {
    for (const [file, src] of sources) {
      const lines = code(src).split("\n");
      lines.forEach((line, i) => {
        if (!/\bsize="2"/.test(line)) return;
        expect.soft(line.trim(), `${file}:${i + 1} restates the default size`).toMatch(
          // A Toolbar's own default is one step ABOVE the app's (BAND_STEP), so 2 there is a choice.
          /Card|Surface|Dialog|Text|Heading|Code|Kbd|Badge|Chip|CodeBlock|Toolbar/,
        );
      });
    }
  });
});
