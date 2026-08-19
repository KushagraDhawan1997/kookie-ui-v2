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

import { CATALOG, EXCLUDED, canContain, sanitizeNode } from "./catalog";
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
import { serializeBlock, serializeDocument, themeDiffs, toComponentName } from "./serialize";

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
            node("TextField", { placeholder: "Name", "aria-label": "Name", disabled: true }),
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
                node("Button", { tone: "accent", emphasis: "loud", bordered: true }, { text: "Save" }),
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
    pairing) must still land on the same token, so a wiring change still fails. */
const normalizeGeneratedIds = (html: string): string => {
  const seen = new Map<string, string>();
  return html.replace(/base-ui-[A-Za-z0-9_]+/g, (m) => {
    if (!seen.has(m)) seen.set(m, `base-ui-${seen.size}`);
    return seen.get(m)!;
  });
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
    for (const axis of ["radius", "pointer", "depth", "surfaceLook", "material"]) {
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
