import { describe, expect, it } from "vitest";

import { BUILDER_TOOL_NAMES, builderTools, validate, type BuilderAgentEnv } from "./agent";
import { canvasChildren, canvasNode, defaultDocTheme, type BuilderDoc, type BuilderNode } from "./model";

/** An editor with nothing on its canvas, recording every write. */
const editor = () => {
  let doc: BuilderDoc = { theme: defaultDocTheme(), roots: [{ ...canvasNode([]), props: { gap: "5" } }] };
  const writes: BuilderNode[][] = [];
  const env: BuilderAgentEnv = {
    doc: () => doc,
    name: () => "Sign in",
    write: (roots) => {
      writes.push(roots);
      doc = { ...doc, roots };
    },
  };
  const tool = (name: string) => builderTools(env).find((t) => t.name === name)!;
  return { env, writes, tool, doc: () => doc };
};

const SCREEN = [
  {
    type: "Card",
    props: { size: "3" },
    children: [
      { type: "Heading", props: { size: "6" }, text: "Sign in" },
      { type: "Button", props: { emphasis: "loud" }, text: "Continue" },
    ],
  },
];

describe("an agent builds through the builder's tools (2026-11-03)", () => {
  it("a legal screen is written as ONE edit, on the canvas, and the canvas keeps its own props", async () => {
    const e = editor();
    const answer = await e.tool(BUILDER_TOOL_NAMES.write).execute({ nodes: SCREEN });
    expect(answer).toMatch(/^Written/);
    expect(e.writes).toHaveLength(1);
    expect(canvasChildren(e.doc()).map((n) => n.type)).toEqual(["Card"]);
    expect(e.doc().roots[0]!.props).toEqual({ gap: "5" });
    // Every node gets an editor id, so the canvas can select it.
    expect(canvasChildren(e.doc())[0]!.children!.every((n) => n.id !== "")).toBe(true);
  });

  it("refuses, naming the node, and leaves the canvas as it was", async () => {
    const e = editor();
    const answer = await e.tool(BUILDER_TOOL_NAMES.write).execute({
      nodes: [
        { type: "Blink" },
        { type: "Button", props: { emphasis: "shouting", color: "red" }, text: "Go" },
      ],
    });
    expect(answer).toMatch(/^Nothing changed/);
    expect(answer).toContain("nodes.0 (Blink): not a builder component");
    expect(answer).toContain('"shouting" is not a value of Button.emphasis');
    expect(answer).toContain('Button has no prop "color"');
    expect(e.writes).toHaveLength(0);
  });

  it("refuses what the grammar refuses: text on a container, a card inside a card", () => {
    const result = validate([{ type: "Card", text: "words", children: [{ type: "Card" }] }]);
    expect("errors" in result && result.errors.join("\n")).toMatch(/takes no text/);
    expect("errors" in result && result.errors.join("\n")).toMatch(/cannot hold a Card/);
  });

  it("read hands back the same shape write takes, with the review's findings", async () => {
    const e = editor();
    await e.tool(BUILDER_TOOL_NAMES.write).execute({ nodes: SCREEN });
    const answer = await e.tool(BUILDER_TOOL_NAMES.read).execute({});
    expect(answer).toContain("Screen: Sign in");
    expect(answer).toContain('"type": "Card"');
    expect(answer).not.toContain('"id"');
    expect(answer).toMatch(/Review: /);
  });

  it("the catalog lists components, and one component's legal values", async () => {
    const e = editor();
    const list = await e.tool(BUILDER_TOOL_NAMES.catalog).execute({});
    expect(list).toContain("- Card (");
    const button = await e.tool(BUILDER_TOOL_NAMES.catalog).execute({ name: "button" });
    expect(button).toMatch(/emphasis: .*loud/);
  });

  it("only the write says it writes", () => {
    const tools = builderTools(editor().env);
    expect(tools.filter((t) => !t.annotations.readOnlyHint).map((t) => t.name)).toEqual([BUILDER_TOOL_NAMES.write]);
  });

  it("a slotted node round-trips: what read gives back, write takes (audit)", async () => {
    const e = editor();
    const withSlot = [{ type: "Button", text: "Saving", children: [{ type: "Spinner", slot: "leading" }] }];
    expect(await e.tool(BUILDER_TOOL_NAMES.write).execute({ nodes: withSlot })).toMatch(/^Written/);
    const read = await e.tool(BUILDER_TOOL_NAMES.read).execute({});
    const nodes = JSON.parse(read.slice(read.indexOf("["), read.lastIndexOf("]") + 1));
    expect(await e.tool(BUILDER_TOOL_NAMES.write).execute({ nodes })).toMatch(/^Written/);
  });

  it("a seat holds one node of the kinds it accepts (audit)", () => {
    const twice = validate([{ type: "Button", text: "Go", children: [{ type: "Spinner", slot: "leading" }, { type: "Kbd", slot: "leading", text: "K" }] }]);
    expect("errors" in twice && twice.errors.join("\n")).toMatch(/already holds a node/);
    const card = validate([{ type: "Button", text: "Go", children: [{ type: "Card", slot: "trailing" }] }]);
    expect("errors" in card && card.errors.join("\n")).toMatch(/cannot sit/);
  });

  it("Object.prototype's names are not components or props, and nothing throws (audit)", async () => {
    const e = editor();
    for (const nodes of [
      [{ type: "constructor", props: { a: "1" } }],
      [{ type: "toString", children: [{ type: "Text" }] }],
      [{ type: "Card", props: { hasOwnProperty: "x" } }],
      [{ type: "Text", text: 42 }],
    ]) {
      expect(await e.tool(BUILDER_TOOL_NAMES.write).execute({ nodes })).toMatch(/^Nothing changed/);
    }
    expect(e.writes).toHaveLength(0);
  });

  it("a part that renders its one child refuses a second (audit)", () => {
    const result = validate([
      { type: "Menu", children: [{ type: "MenuTrigger", children: [{ type: "Button", text: "A" }, { type: "Button", text: "B" }] }] },
    ]);
    expect("errors" in result && result.errors.join("\n")).toMatch(/exactly one child/);
  });

  it("a tree too deep is refused, not a stack overflow (audit)", () => {
    let node: Record<string, unknown> = { type: "Text", text: "deep" };
    for (let i = 0; i < 200; i++) node = { type: "Stack", children: [node] };
    const result = validate([node]);
    expect("errors" in result && result.errors.join("\n")).toMatch(/deeper than/);
  });
});
