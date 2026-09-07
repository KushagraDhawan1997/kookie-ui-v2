/**
 * THE DRIFT LAW. `dist/data.json` is a snapshot of facts that live somewhere else, so the one
 * thing that can go wrong with it is that it stops agreeing with them. This re-runs the
 * derivation and compares, which is `tokens.css`'s own drift check one package over: a
 * snapshot built from an older registry fails here rather than answering a client with a
 * component that no longer exists.
 *
 * It re-derives rather than spot-checking a few fields on purpose. A law that asserted "Button
 * is in there" would pass over a snapshot that had lost forty components.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { buildData } from "../scripts/build-data.ts";
import { data, legalValues, refusalsFor, resolveComponent } from "./data.ts";

const fresh = await buildData();
const shipped = data();

describe("the snapshot agrees with its sources", () => {
  it("carries the same facts a fresh derivation produces", () => {
    expect(JSON.parse(JSON.stringify(shipped))).toEqual(JSON.parse(JSON.stringify(fresh)));
  });

  it("is derived from homes that exist, and names every one of them", () => {
    // A source path that has moved makes every fact downstream of it unverifiable, and the
    // provenance line the tools print would then cite a file nobody can open. THE PATH IS
    // OPENED, not pattern-matched: the first spelling asserted the string began with `apps/`
    // or `packages/`, which a renamed file satisfies exactly as well as a real one — pointing
    // every `Source:` line at `components/registry-MOVED.ts` left all thirteen laws green.
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
    for (const relative of Object.values(shipped.sources)) {
      expect(relative, `${relative} is named as a source`).toMatch(/^(apps|packages)\//);
      expect(existsSync(path.join(root, relative)), `${relative} exists`).toBe(true);
    }
  });
});

describe("what the snapshot must contain to be usable", () => {
  it("has a markdown twin for every component, and no orphan twins", () => {
    const slugs = shipped.components.map((row) => row.slug).sort();
    expect(Object.keys(shipped.markdown).sort()).toEqual(slugs);
  });

  it("resolves a name, a part and a slug to the same entry", () => {
    expect(resolveComponent("Menu")).toMatchObject({ row: { name: "Menu" } });
    expect(resolveComponent("MenuItem")).toMatchObject({ row: { name: "Menu" } });
    expect(resolveComponent("alert-dialog")).toMatchObject({ row: { name: "AlertDialog" } });
    expect(resolveComponent("BUTTON")).toMatchObject({ row: { name: "Button" } });
  });

  it("answers a miss with candidates rather than nothing", () => {
    const answer = resolveComponent("Toast");
    expect("candidates" in answer && answer.candidates.length).toBeGreaterThan(0);
  });
});

describe("the refusals reach a symbol", () => {
  it("gives a control the reflex refusals and the spacing row", () => {
    const props = refusalsFor("Button").map((row) => row.prop);
    expect(props).toEqual(expect.arrayContaining(["variant", "asChild", "m", "mt", "color"]));
  });

  it("does NOT refuse the margin row on the four layouts that own it", () => {
    // `refused.ts` states this exception; a snapshot that flattened every component onto one
    // refusal set would make `<Box m="4">` — the escape every other refusal names — an error.
    for (const layout of ["Box", "Flex", "Stack", "Grid"]) {
      expect(refusalsFor(layout).map((row) => row.prop), layout).not.toContain("m");
    }
  });

  it("carries the component's own refusals beside the universal ones", () => {
    // Button's registry entry refuses `variant` with a different sentence from `refused.ts`'s.
    // Whichever wins, the prop must be refused.
    expect(refusalsFor("Button").map((row) => row.prop)).toContain("variant");
    // TextField refuses `emphasis`, which no universal set mentions.
    expect(refusalsFor("TextField").map((row) => row.prop)).toContain("emphasis");
  });

  it("does not let a refusal written about a part reach a part that declares the prop", () => {
    // §27 gave `backdrop` to the five shell PANELS on the day it refused it on ShellContent
    // alone, and the registry writes that as one refusal on the Shell entry. Read across every
    // symbol the entry names, it said the opposite of the decision. The generated API is the
    // type the compiler enforces, so a part that declares the prop takes it.
    expect(refusalsFor("ShellSidebar").map((row) => row.prop)).not.toContain("backdrop");
    expect(refusalsFor("ShellContent").map((row) => row.prop)).toContain("backdrop");
    // The same shape one component over, and this one ships in the alert's own example.
    expect(refusalsFor("AlertDialogTrigger").map((row) => row.prop)).not.toContain("render");
    expect(refusalsFor("AlertDialogCancel").map((row) => row.prop)).toContain("render");
  });

  it("names an escape in every sentence it will print", () => {
    for (const [symbol, rows] of Object.entries(shipped.refusalSets)) {
      for (const row of rows) {
        expect(row.why.length, `${symbol}.${row.prop}`).toBeGreaterThan(40);
      }
    }
  });
});

describe("the closed unions", () => {
  it("closes an axis-typed prop against the package's own axis", () => {
    expect(legalValues("Button", "size")).toEqual(["1", "2", "3", "4"]);
    expect(legalValues("Button", "emphasis")).toEqual(["loud", "medium", "quiet"]);
    expect(legalValues("Text", "weight")).toEqual(["regular", "medium", "semibold"]);
    expect(legalValues("Button", "tone")).toContain("destructive");
  });

  it("closes an inline union the API printed verbatim", () => {
    expect(legalValues("Flex", "display")).toEqual(["flex", "inline-flex"]);
  });

  it("closes a layout prop the API does not repeat, through the scale it resolves on", () => {
    // `m` arrives from the shared layout table, so the generated API never lists it. The scale
    // in `props.ts` is what says the value is closed, and `bleed` is a legal margin.
    expect(legalValues("Box", "m")).toContain("bleed");
    expect(legalValues("Box", "m")).toContain("12");
    expect(legalValues("Box", "m")).not.toContain("13");
  });

  it("records every named type it does NOT close, so a new axis cannot slip in open", () => {
    // `typeAxis` maps the names the generated API prints onto the axis holding their values,
    // and it is the one authored table in this package. Nothing forces it to stay complete:
    // add an axis, print its type on a prop, and `legalValues` quietly returns `undefined` —
    // the union stops being checked and every law above still passes, because they each name
    // the axis they test. So the RESIDUE is pinned instead. A named type that is neither
    // mapped nor recorded here fails, which is the day someone must decide which it is.
    const OPEN_ON_PURPOSE = [
      // A node, not a value: `render` takes an element, and there is nothing to close.
      "RenderElement",
      // Closed unions in the package that this server does not close, because `typeAxis` only
      // reaches axes and these are per-component vocabularies. `check_usage` therefore says
      // nothing about a wrong value on these five props; recorded rather than left to be
      // discovered from a tool result that stayed silent.
      "AttachmentState",
      "ComposerStatus",
      "ShellPaneTarget",
      "ShellPresentation",
      "TextFieldType",
    ];
    const named = new Set<string>();
    for (const entry of Object.values(shipped.api)) {
      for (const prop of entry.props) {
        const type = prop.type.trim();
        if (/^[A-Z][A-Za-z0-9]*$/.test(type) && !shipped.typeAxis[type]) named.add(type);
      }
    }
    expect([...named].sort()).toEqual([...OPEN_ON_PURPOSE].sort());
    // And the other direction: a mapping that points at an axis the package no longer has
    // would close a prop against nothing.
    for (const [type, axis] of Object.entries(shipped.typeAxis)) {
      expect(shipped.axes[axis], `${type} -> ${axis}`).toBeDefined();
    }
  });

  it("leaves an open prop open", () => {
    expect(legalValues("Button", "className")).toBeUndefined();
    expect(legalValues("Button", "onClick")).toBeUndefined();
  });
});
