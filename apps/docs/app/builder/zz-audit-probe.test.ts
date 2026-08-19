import { describe, expect, it } from "vitest";
import { node, type BuilderNode } from "./model";
import { RULES, reviewDocument } from "./review";
import { makeDoc } from "./store";
import { normalizeSeats } from "./catalog";

const asDoc = (roots: BuilderNode[]) => ({ theme: makeDoc("x").theme, roots });

describe("AUDIT PROBES", () => {
  it("A: one-figure names the wrong node when a tab panel is involved", () => {
    const deploy = node("Button", { emphasis: "loud" }, { text: "Deploy" });
    const publish = node("Button", { emphasis: "loud" }, { text: "Publish" });
    const roots = [
      node("Stack", { gap: "6" }, {
        children: [
          node("Tabs", { defaultValue: "a" }, {
            children: [
              node("TabsList", { "aria-label": "S" }, { children: [node("TabsTab", { value: "a" }, { text: "One" })] }),
              node("TabsPanel", { value: "a" }, { children: [deploy] }),
            ],
          }),
          publish,
        ],
      }),
    ];
    const f = reviewDocument(asDoc(roots)).filter((x) => x.rule === "one-figure");
    console.log("one-figure flagged:", f.map((x) => x.message));
    console.log("deploy id", deploy.id, "publish id", publish.id);
    console.log("flagged node ids", f.map((x) => x.nodeId));
  });

  it("B: deleting the orphan-part breaker keeps the round-trip law green", () => {
    // Reproduce the shipped law's reverse direction with orphan-part removed from breakers.
    const pair = (gap: string) =>
      node("Stack", { gap }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] });
    const breakers: Record<string, BuilderNode[]> = {
      "one-figure": [node("Card", { size: "3" }, { children: [node("Button", { emphasis: "loud" }, { text: "A" }), node("Button", { emphasis: "loud" }, { text: "B" })] })],
      "size-1-retired": [node("Text", { size: "1" }, { text: "small" })],
      "empty-container": [node("Stack", { gap: "3" }, { children: [] })],
      "single-child-layout": [node("Stack", {}, { children: [node("Text", {}, { text: "one" })] })],
      "flat-rhythm": [node("Stack", { gap: "3" }, { children: [pair("3"), pair("3")] })],
      "heading-space": [node("Stack", { gap: "5" }, { children: [node("Text", { size: "2" }, { text: "Above" }), node("Heading", { size: "6" }, { text: "N" }), node("Text", { size: "2", emphasis: "medium" }, { text: "W." })] })],
      "mixed-control-sizes": [node("Flex", { gap: "3" }, { children: [node("Button", { size: "2" }, { text: "a" }), node("Button", { size: "2" }, { text: "b" }), node("Button", { size: "4" }, { text: "c" })] })],
      "control-scale": [node("Card", { size: "4" }, { children: [node("Button", { size: "1" }, { text: "Save" })] })],
      eyebrow: [node("Stack", { gap: "2" }, { children: [node("Text", { size: "2", emphasis: "medium" }, { text: "PREFERENCES" }), node("Heading", { size: "6" }, { text: "N" })] })],
      "zero-width-container": [node("Flex", { gap: "3" }, { children: [node("Box", { container: true }, { children: [node("Text", {}, { text: "a" })] }), node("Text", {}, { text: "b" })] })],
      // "orphan-part" DELETED
    };
    const missed: string[] = [];
    for (const rule of RULES) {
      const offersFix = Object.values(breakers).some((roots) =>
        reviewDocument(asDoc(roots)).some((f) => f.rule === rule.id && f.fix),
      );
      const hasOwnFix = ["orphan-part"].includes(rule.id);
      if (!offersFix && hasOwnFix) missed.push(rule.id);
      if (offersFix) expect(breakers[rule.id]).toBeDefined(); // the shipped assertion
    }
    console.log("rules with a real fix that the reverse loop never asks about:", missed);
    // and the third loop only walks Object.entries(breakers), so orphan-part is never round-tripped
    expect(Object.keys(breakers)).not.toContain("orphan-part");
    console.log("fixing.size would be", Object.keys(breakers).length, "> 6 -> still green");
  });

  it("C: normalizeSeats allocation on the untouched path", () => {
    const mk = (depth: number): BuilderNode =>
      depth === 0
        ? node("Text", {}, { text: "leaf" })
        : node("Stack", { gap: "3" }, { children: [mk(depth - 1), mk(depth - 1)] });
    const roots = [mk(6)];
    const out = normalizeSeats(roots);
    expect(out).toBe(roots);
    // count how many arrays dedupeSeats allocates: one per list visited
    let lists = 0;
    const count = (l: BuilderNode[]) => { lists++; for (const n of l) if (n.children) count(n.children); };
    count(roots);
    console.log("lists walked (= throwaway arrays allocated per edit):", lists);
  });
});
