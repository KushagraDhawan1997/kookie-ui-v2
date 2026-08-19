/**
 * The editor's laws (2026-08-20) — the store, the command table, the grammar helpers and the
 * review engine. `builder.test.tsx` covers the document's translation into code; this file
 * covers what the EDITOR does to a document, which is now most of the surface.
 *
 * The load-bearing one is the review round-trip: a rule's fix must actually resolve the
 * finding it offers. A lint that suggests a repair which does not repair is worse than one
 * that stays quiet, and nothing but running the fix and re-reviewing can prove it.
 */

import { describe, expect, it, beforeEach } from "vitest";

import { CATALOG, canContain as canContainForTest, sharedProps } from "./catalog";
import {
  COMMANDS,
  chordLabel,
  chordMatches,
  decodeNodes,
  encodeNodes,
  matches,
  type Command,
  type CommandContext,
} from "./commands";
import { CanvasBoundary, CONTEXT_COMMANDS } from "./chrome";
import { MIXED, UNSET, pickOrder, readPick } from "./inspector";
import { defaultDocTheme, findNode, node, updatePropsMany, type BuilderDoc, type BuilderNode } from "./model";
import { canUnwrap, canWrap, insertableInto, insertionTarget, typesThrough } from "./placement";
import { TEMPLATES, templateDoc } from "./templates";
import { serializeDocument } from "./serialize";
import { RULES, reviewDocument } from "./review";
import {
  activeDoc,
  canUndo,
  initialState,
  loadState,
  makeDoc,
  primaryId,
  reducer,
  saveState,
  type EditorState,
} from "./store";

/* ── A memory-backed localStorage, so the persistence laws can run in node ─────────────── */

class MemoryStorage {
  private map = new Map<string, string>();
  getItem = (k: string) => this.map.get(k) ?? null;
  setItem = (k: string, v: string) => void this.map.set(k, v);
  removeItem = (k: string) => void this.map.delete(k);
  clear = () => this.map.clear();
  key = (i: number) => [...this.map.keys()][i] ?? null;
  get length() {
    return this.map.size;
  }
}

beforeEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage();
});

const doc = (...roots: BuilderNode[]) => makeDoc("Test", { theme: makeDoc("x").theme, roots });
const start = (...roots: BuilderNode[]): EditorState => initialState(doc(...roots));

/* ── The store ─────────────────────────────────────────────────────────────────────────── */

describe("the store keeps a document's history to itself", () => {
  it("undo restores the tree AND the selection that made the edit", () => {
    const a = node("Button", {}, { text: "a" });
    let s = start(a);
    s = reducer(s, { type: "select", ids: [a.id] });
    const b = node("Button", {}, { text: "b" });
    s = reducer(s, { type: "edit", roots: [a, b], selection: [b.id] });
    expect(activeDoc(s).roots).toHaveLength(2);
    expect(primaryId(s)).toBe(b.id);

    s = reducer(s, { type: "undo" });
    expect(activeDoc(s).roots).toHaveLength(1);
    // The selection travels with the snapshot: stepping back puts you where the edit was.
    expect(primaryId(s)).toBe(a.id);
    s = reducer(s, { type: "redo" });
    expect(activeDoc(s).roots).toHaveLength(2);
    expect(primaryId(s)).toBe(b.id);
  });

  it("history is per document — undo in one never reaches into another", () => {
    const a = node("Button", {}, { text: "a" });
    let s = start(a);
    s = reducer(s, { type: "edit", roots: [a, node("Button", {}, { text: "b" })] });
    s = reducer(s, { type: "docNew", name: "Second" });
    expect(canUndo(s)).toBe(false); // the new document has its own, empty history
    const before = activeDoc(s).roots.length;
    s = reducer(s, { type: "undo" });
    expect(activeDoc(s).roots).toHaveLength(before);
    // Back in the first document, its own history is intact.
    s = reducer(s, { type: "docSwitch", id: s.docs[0]!.id });
    expect(canUndo(s)).toBe(true);
    s = reducer(s, { type: "undo" });
    expect(activeDoc(s).roots).toHaveLength(1);
  });

  it("an edit that removes a node removes it from the selection too", () => {
    const a = node("Button", {}, { text: "a" });
    const b = node("Button", {}, { text: "b" });
    let s = start(a, b);
    s = reducer(s, { type: "select", ids: [a.id, b.id] });
    expect(s.selection).toHaveLength(2);
    s = reducer(s, { type: "edit", roots: [a] });
    expect(s.selection).toEqual([a.id]);
  });

  it("additive selection toggles, and the last touched id is the primary", () => {
    const a = node("Button", {}, { text: "a" });
    const b = node("Button", {}, { text: "b" });
    let s = start(a, b);
    s = reducer(s, { type: "select", ids: [a.id] });
    s = reducer(s, { type: "select", ids: [b.id], additive: true });
    expect(s.selection).toEqual([a.id, b.id]);
    expect(primaryId(s)).toBe(b.id);
    s = reducer(s, { type: "select", ids: [b.id], additive: true });
    expect(s.selection).toEqual([a.id]);
  });

  it("the last document is never deleted — an editor with no document has nothing to be", () => {
    let s = start(node("Button", {}, { text: "a" }));
    s = reducer(s, { type: "docDelete", id: s.activeId });
    expect(s.docs).toHaveLength(1);
    s = reducer(s, { type: "docNew" });
    s = reducer(s, { type: "docDelete", id: s.activeId });
    expect(s.docs).toHaveLength(1);
  });

  it("a duplicated document shares no node identity with its source", () => {
    const a = node("Card", {}, { children: [node("Button", {}, { text: "a" })] });
    let s = start(a);
    s = reducer(s, { type: "docDuplicate", id: s.activeId });
    const ids = (list: BuilderNode[]): string[] => list.flatMap((n) => [n.id, ...ids(n.children ?? [])]);
    const first = new Set(ids(s.docs[0]!.roots));
    expect(ids(s.docs[1]!.roots).some((id) => first.has(id))).toBe(false);
  });

  it("state survives a save/load round trip, and history deliberately does not", () => {
    const a = node("Card", { size: "3" }, { children: [node("Text", { size: "2" }, { text: "hello" })] });
    let s = start(a);
    s = reducer(s, { type: "edit", roots: [a] });
    s = reducer(s, { type: "docRename", id: s.activeId, name: "Sign in" });
    saveState(s);

    const back = loadState("fallback")!;
    expect(back.docs[0]!.name).toBe("Sign in");
    expect(back.docs[0]!.roots[0]!.type).toBe("Card");
    expect(back.docs[0]!.roots[0]!.children![0]!.text).toBe("hello");
    expect(canUndo(back)).toBe(false);
  });

  it("a v1 single-document store is migrated into the first document", () => {
    localStorage.setItem(
      "kookie-builder-doc-v1",
      JSON.stringify({ theme: {}, roots: [{ id: "x", type: "Card", props: {}, children: [] }] }),
    );
    localStorage.setItem(
      "kookie-builder-blocks-v1",
      JSON.stringify([{ name: "Old block", node: { id: "y", type: "Button", props: {}, text: "hi" } }]),
    );
    const migrated = loadState("Untitled")!;
    expect(migrated.docs).toHaveLength(1);
    expect(migrated.docs[0]!.roots[0]!.type).toBe("Card");
    expect(migrated.blocks[0]!.name).toBe("Old block");
  });

  it("a stored document is sanitized against TODAY's catalog", () => {
    saveState({
      ...start(),
      docs: [
        {
          id: "d1",
          name: "Stale",
          theme: makeDoc("x").theme,
          roots: [
            { id: "a", type: "Widget", props: {} },
            { id: "b", type: "Button", props: { emphasis: "loud", zap: "?" } as never, text: "ok" },
          ],
        },
      ],
      activeId: "d1",
    });
    const back = loadState("Untitled")!;
    expect(back.docs[0]!.roots.map((n) => n.type)).toEqual(["Button"]);
    expect(back.docs[0]!.roots[0]!.props).toEqual({ emphasis: "loud" });
  });

  it("storage denied leaves the editor working from memory", () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(() => saveState(start())).not.toThrow();
    expect(loadState("Untitled")).toBeNull();
  });
});

/* ── The command table ─────────────────────────────────────────────────────────────────── */

const key = (k: string, mods: Partial<Record<"metaKey" | "ctrlKey" | "shiftKey" | "altKey", boolean>> = {}) =>
  ({ key: k, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...mods }) as KeyboardEvent;

describe("commands are one table, and the surfaces only render it", () => {
  it("ids and chords are unique — two commands on one key is a coin toss", () => {
    const ids = COMMANDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const chords = COMMANDS.filter((c) => c.chord).map((c) => c.chord!.toLowerCase());
    expect(new Set(chords).size).toBe(chords.length);
  });

  it("every context-menu row names a real command", () => {
    for (const id of CONTEXT_COMMANDS) {
      if (id === "·") continue;
      expect(COMMANDS.some((c) => c.id === id), `the context menu offers "${id}", which is not a command`).toBe(true);
    }
  });

  it("a chord matches its own modifiers and no others", () => {
    // On a non-Apple platform "mod" is Ctrl; the laws run in node, where navigator is absent.
    expect(chordMatches("mod+d", key("d", { ctrlKey: true }))).toBe(true);
    expect(chordMatches("mod+d", key("d", { ctrlKey: true, shiftKey: true }))).toBe(false);
    expect(chordMatches("mod+d", key("d"))).toBe(false);
    // The OTHER modifier must be absent, or ⌘D would fire Ctrl+D's command.
    expect(chordMatches("mod+d", key("d", { ctrlKey: true, metaKey: true }))).toBe(false);
    expect(chordMatches("backspace", key("Backspace"))).toBe(true);
    expect(chordMatches("mod+shift+z", key("z", { ctrlKey: true, shiftKey: true }))).toBe(true);
  });

  it("a chord reads back as something a person can follow", () => {
    expect(chordLabel("mod+shift+z")).toMatch(/z/i);
    expect(chordLabel("backspace")).toBe("⌫");
  });

  it("the palette's matcher wants every word, in any order", () => {
    const cmd: Command = { id: "x", title: "Wrap in Flex", group: "Arrange", keywords: "row group", enabled: () => true, run: () => {} };
    expect(matches(cmd, "wrap flex")).toBe(true);
    expect(matches(cmd, "flex wrap")).toBe(true);
    expect(matches(cmd, "row")).toBe(true);
    expect(matches(cmd, "wrap grid")).toBe(false);
    expect(matches(cmd, "")).toBe(true);
  });

  it("a subtree survives the clipboard as JSON, and foreign text is refused", () => {
    const subtree = node("Card", { size: "2" }, { children: [node("Text", {}, { text: "hi" })] });
    const decoded = decodeNodes(encodeNodes([subtree]));
    expect(decoded).not.toBeNull();
    expect(decoded![0]!.children![0]!.text).toBe("hi");
    expect(decodeNodes("just some text a person copied")).toBeNull();
    expect(decodeNodes(JSON.stringify({ kind: "someone-else/nodes", nodes: [] }))).toBeNull();
  });

  it("every command runs without throwing on an empty document", () => {
    // Enabled-ness is the guard; a command that is enabled must also be safe to run.
    const state = start();
    const ui = new Proxy({}, { get: () => () => {} }) as CommandContext["ui"];
    const ctx: CommandContext = { state, dispatch: () => {}, ui };
    for (const cmd of COMMANDS) {
      if (!cmd.enabled(ctx)) continue;
      expect(() => cmd.run(ctx), `${cmd.id} threw on an empty document`).not.toThrow();
    }
  });
});

/* ── The grammar helpers ───────────────────────────────────────────────────────────────── */

describe("wrapping and unwrapping ask the grammar both ways", () => {
  it("a wrapper must be legal where the node stands AND accept the node", () => {
    const button = node("Button", {}, { text: "ok" });
    const card = node("Card", {}, { children: [button] });
    expect(canWrap([card], [button.id], "Stack")).toBe(true);
    // A menu row cannot be wrapped in a Stack: the panel refuses a Stack outright.
    const item = node("MenuItem", {}, { text: "Action" });
    const content = node("MenuContent", {}, { children: [item] });
    expect(canWrap([content], [item.id], "Stack")).toBe(false);
  });

  it("several nodes may only be wrapped together when they are siblings", () => {
    const a = node("Button", {}, { text: "a" });
    const b = node("Button", {}, { text: "b" });
    const outer = node("Card", {}, { children: [a, node("Card", {}, { children: [b] })] });
    expect(canWrap([outer], [a.id, b.id], "Flex")).toBe(false);
  });

  it("unwrap refuses when the children could not stand where the container stands", () => {
    const item = node("MenuItem", {}, { text: "Action" });
    const group = node("MenuGroup", {}, { children: [item] });
    const content = node("MenuContent", {}, { children: [group] });
    expect(canUnwrap([content], group.id)).toBe(true); // MenuContent accepts items directly
    const stack = node("Stack", {}, { children: [node("MenuItem", {}, { text: "x" })] });
    expect(canUnwrap([stack], stack.id)).toBe(false); // a row cannot stand at the root
  });

  it("insertion lands beside the selection's branch, not at the container's end", () => {
    const first = node("Button", {}, { text: "1" });
    const second = node("Button", {}, { text: "2" });
    const stack = node("Stack", {}, { children: [first, second] });
    const target = insertionTarget([stack], first.id, "Button");
    expect(target).toEqual({ parentId: stack.id, index: 1 });
  });

  it("what a right-click may insert is what the node can actually hold", () => {
    const card = node("Card", { size: "3" }, { children: [] });
    const inCard = insertableInto([card], card.id);
    expect(inCard).toContain("Separator");
    expect(inCard).toContain("Button");
    // Compound parts belong to their own root; a Card must never offer one, because the
    // canvas would then render an orphan that Base UI throws on.
    expect(inCard).not.toContain("MenuItem");
    expect(inCard).not.toContain("SelectItem");
    expect(inCard).not.toContain("SegmentedItem");

    // And inside a compound, the part is what the list LEADS with.
    const content = node("MenuContent", {}, { children: [] });
    const menu = node("Menu", {}, { children: [content] });
    const inMenu = insertableInto([menu], content.id);
    expect(inMenu).toContain("MenuItem");
    expect(CATALOG[inMenu[0]!]!.partOf).toBeTruthy();
    // Every entry, in both lists, must survive the grammar independently — this is the
    // assertion that fails if the filter is ever loosened to "everything in the catalog".
    for (const [subject, list] of [
      [card, inCard],
      [content, inMenu],
    ] as const) {
      const roots = subject === card ? [card] : [menu];
      for (const type of list) {
        expect(canContainForTest(subject.type, type, typesThrough(roots, subject.id))).toBe(true);
      }
    }
  });

  it("nothing is insertable into nothing", () => {
    expect(insertableInto([node("Card", {}, { children: [] })], null)).toEqual([]);
    expect(insertableInto([], "gone")).toEqual([]);
  });
});

/* ── The multi-selection write ─────────────────────────────────────────────────────────── */

describe("one knob over several nodes is one edit, and only where it means one thing", () => {
  it("a knob is offered only when the schema MATCHES, not when the name does", () => {
    // Button and Card both take `size` as the same axis, so one picker can write both.
    const both = sharedProps(["Button", "Card"]);
    expect(both.size).toBeDefined();
    expect(both.size!.kind).toBe("axis");

    // Every offered schema must be identical on every type — this is the assertion that
    // fails if the filter is ever loosened to "same name".
    for (const [name, schema] of Object.entries(both)) {
      for (const type of ["Button", "Card"]) {
        expect(CATALOG[type]!.props[name]).toBeDefined();
        expect(CATALOG[type]!.props[name]!.kind).toBe(schema.kind);
      }
    }

    // The negative case, and it is a REAL one in this catalog: `size` on a Button is the
    // control ladder (1-4) and `size` on a Text is the type ladder (1-9). One name, two
    // ladders — offering one picker over a Button and a Text would let a pick of "7" land
    // on a control that refuses it. The schemas differ, so the knob is not offered.
    expect((CATALOG.Button!.props.size as { axis: string }).axis).toBe("size");
    expect((CATALOG.Text!.props.size as { axis: string }).axis).toBe("typeSize");
    expect(sharedProps(["Button", "Text"]).size).toBeUndefined();
    // …and the two type-family members DO share theirs, so this is not just "nothing works".
    expect(sharedProps(["Text", "Heading"]).size).toBeDefined();

    // A type that is not in the catalog poisons the whole answer rather than being skipped:
    // a knob offered over four nodes when one of them was not understood is a knob that
    // writes somewhere nobody looked.
    expect(sharedProps(["Button", "Widget"])).toEqual({});
    expect(sharedProps([])).toEqual({});
  });

  it("a prop only one of them has is not shared", () => {
    // Button has `bordered`; Text does not.
    expect(CATALOG.Button!.props.bordered).toBeDefined();
    expect(CATALOG.Text!.props.bordered).toBeUndefined();
    expect(sharedProps(["Button", "Text"]).bordered).toBeUndefined();
  });

  it("the write reaches every named node and nothing else, in one pass", () => {
    const a = node("Button", {}, { text: "a" });
    const b = node("Button", {}, { text: "b" });
    const c = node("Button", { size: "1" }, { text: "c" });
    const roots = [node("Stack", {}, { children: [a, b] }), c];
    const next = updatePropsMany(roots, [a.id, b.id], { size: "3" });
    expect(findNode(next, a.id)!.props.size).toBe("3");
    expect(findNode(next, b.id)!.props.size).toBe("3");
    expect(findNode(next, c.id)!.props.size).toBe("1"); // untouched
    // Untouched branches keep their identity, which is what the interpreter's memo reads.
    expect(next[1]).toBe(roots[1]);
  });

  it("it lands as ONE history entry — five nodes, one undo", () => {
    const a = node("Button", {}, { text: "a" });
    const b = node("Button", {}, { text: "b" });
    let s = start(node("Stack", {}, { children: [a, b] }));
    s = reducer(s, { type: "select", ids: [a.id, b.id] });
    s = reducer(s, {
      type: "edit",
      roots: updatePropsMany(activeDoc(s).roots, [a.id, b.id], { size: "4" }),
    });
    expect(findNode(activeDoc(s).roots, a.id)!.props.size).toBe("4");
    expect(findNode(activeDoc(s).roots, b.id)!.props.size).toBe("4");
    s = reducer(s, { type: "undo" });
    expect(findNode(activeDoc(s).roots, a.id)!.props.size).toBeUndefined();
    expect(findNode(activeDoc(s).roots, b.id)!.props.size).toBeUndefined();
    expect(canUndo(s)).toBe(false); // there was exactly one entry to take back
  });

  it("undefined removes the prop rather than writing an undefined into the export", () => {
    const a = node("Button", { size: "3", emphasis: "loud" }, { text: "a" });
    const next = updatePropsMany([a], [a.id], { size: undefined });
    expect("size" in findNode(next, a.id)!.props).toBe(false);
    expect(findNode(next, a.id)!.props.emphasis).toBe("loud");
  });

  it("every value a shared axis offers is one every selected type accepts", () => {
    // The whole safety claim of the gesture: the picker's list comes from ONE schema, so it
    // must be a list every member answers. Checked against the real catalog, over every
    // pair of types that share an axis prop.
    const types = Object.keys(CATALOG);
    let pairsChecked = 0;
    for (const a of types) {
      for (const b of types) {
        if (a >= b) continue;
        const shared = sharedProps([a, b]);
        for (const [name, schema] of Object.entries(shared)) {
          if (schema.kind !== "axis") continue;
          pairsChecked++;
          const other = CATALOG[b]!.props[name]!;
          expect(other.kind).toBe("axis");
          expect((other as { axis: string }).axis).toBe(schema.axis);
        }
      }
    }
    expect(pairsChecked).toBeGreaterThan(0); // a walk that checked nothing is not a law
  });
});

/* ── The picker's own vocabulary ───────────────────────────────────────────────────────── */

describe("a closed picker is closed at the edge that reads it, not only where it offers", () => {
  it("reports a value from its list, the explicit unset, or nothing at all", () => {
    const sizes = ["1", "2", "3", "4"];
    expect(readPick("3", sizes, true)).toEqual({ value: "3" });
    expect(readPick(UNSET, sizes, true)).toEqual({ value: undefined });
    // The measured defect: resolving a mixed reading takes the Mixed row out of the live
    // control's items, and Base UI answers a value that has left its items with a reset —
    // the string "null", which without this went on to be written onto every selected node.
    expect(readPick("null", sizes, true)).toBeNull();
    expect(readPick(MIXED, sizes, true)).toBeNull();
    expect(readPick("7", sizes, true)).toBeNull();
    expect(readPick("", sizes, true)).toBeNull();
    // A picker with no unset row must not report one either.
    expect(readPick(UNSET, sizes, false)).toBeNull();
  });

  it("puts its sentinels first, which an object keyed by numbers cannot", () => {
    const rows = pickOrder(["1", "2", "3", "4"], { mixed: true, optional: true });
    expect(rows.map(([v]) => v)).toEqual([MIXED, UNSET, "1", "2", "3", "4"]);
    // The shape the bug had: the same rows through a Record sort the numbers to the front,
    // so this is what the ordering must NOT be — read from the language, not restated.
    expect(Object.keys(Object.fromEntries(rows))).toEqual(["1", "2", "3", "4", MIXED, UNSET]);
    // No mixed reading, no Mixed row.
    expect(pickOrder(["1", "2"], { optional: true }).map(([v]) => v)).toEqual([UNSET, "1", "2"]);
    expect(pickOrder(["a", "b"]).map(([v]) => v)).toEqual(["a", "b"]);
    // Labels travel with the value, and only where one was given.
    expect(pickOrder(["a"], { labels: { a: "Alpha" } })).toEqual([["a", "Alpha"]]);
    expect(pickOrder(["a"], { labels: { b: "Beta" } })).toEqual([["a", "a"]]);
  });
});

/* ── The canvas boundary ───────────────────────────────────────────────────────────────── */

describe("a broken canvas never takes the document with it", () => {
  /** The boundary as a plain object: React is not needed to prove its reset CONTRACT, and
      the alternative — reconstructing the condition in the law — is the mistake this repo
      keeps writing down. `componentDidUpdate` here is the shipped method. */
  const boundary = (tree: unknown) => {
    const b = new CanvasBoundary({ children: null, onRecover: () => {}, canRecover: false, tree });
    const seen: Array<{ error: Error | null }> = [];
    // Standing in for React's own setState, which is all the method calls.
    (b as unknown as { setState: (s: { error: Error | null }) => void }).setState = (s) =>
      void seen.push(s);
    return { b, seen };
  };

  it("catches, and holds its failure while the tree it failed on is unchanged", () => {
    const err = new Error("MenuRootContext is missing");
    expect(CanvasBoundary.getDerivedStateFromError(err)).toEqual({ error: err });

    const tree = [node("Card", {}, { children: [] })];
    const { b, seen } = boundary(tree);
    b.state = { error: err };
    b.componentDidUpdate({ tree });
    expect(seen).toEqual([]);
  });

  it("clears on ANY new tree, not just a new document", () => {
    const { b, seen } = boundary([node("Card", {}, { children: [] })]);
    b.state = { error: new Error("boom") };
    // The same document, edited: the person deleted the offending node in Layers, which
    // draws from the model and keeps working. Keying the reset on the document id left the
    // boundary holding a failure over a tree that no longer contained it.
    b.componentDidUpdate({ tree: [node("Card", {}, { children: [] })] });
    expect(seen).toEqual([{ error: null }]);
  });

  it("does not clear a state it never had", () => {
    const { b, seen } = boundary([]);
    b.state = { error: null };
    b.componentDidUpdate({ tree: [node("Card", {}, { children: [] })] });
    expect(seen).toEqual([]);
  });
});

/* ── The review engine ─────────────────────────────────────────────────────────────────── */

const asDoc = (roots: BuilderNode[]) => ({ theme: makeDoc("x").theme, roots });

describe("review reads the house style off the document", () => {
  it("every rule is written to be read: a real sentence, a unique id", () => {
    const ids = RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const rule of RULES) {
      expect(rule.why.length, `${rule.id}'s reason is too short to be a reason`).toBeGreaterThan(60);
      expect(rule.title.length).toBeGreaterThan(4);
    }
  });

  it("two loud actions on one surface is one finding; one is none", () => {
    const loud = () => node("Button", { emphasis: "loud" }, { text: "Save" });
    const one = node("Card", {}, { children: [loud()] });
    expect(reviewDocument(asDoc([one])).filter((f) => f.rule.includes("focal"))).toHaveLength(0);
    const two = node("Card", {}, { children: [loud(), loud()] });
    expect(reviewDocument(asDoc([two])).filter((f) => f.rule.includes("focal"))).toHaveLength(1);
  });

  it("an alert's loud Action is legal by anatomy and never flagged", () => {
    const alert = node("AlertDialogContent", {}, {
      children: [
        node("AlertDialogTitle", {}, { text: "Delete?" }),
        node("Button", { emphasis: "loud" }, { text: "Delete" }),
        node("Button", { emphasis: "loud" }, { text: "Also loud" }),
      ],
    });
    expect(reviewDocument(asDoc([alert])).filter((f) => f.rule.includes("focal"))).toHaveLength(0);
  });

  it("a control with no accessible name is an ERROR, not a suggestion", () => {
    const findings = reviewDocument(asDoc([node("Checkbox", {})]));
    const name = findings.find((f) => f.rule.includes("name"));
    expect(name?.severity).toBe("error");
    expect(reviewDocument(asDoc([node("Checkbox", { "aria-label": "Agree" })]))).toHaveLength(0);
  });

  it("errors sort above warnings", () => {
    const findings = reviewDocument(
      asDoc([node("Stack", {}, { children: [] }), node("Checkbox", {})]),
    );
    expect(findings[0]!.severity).toBe("error");
  });

  it("EVERY fix actually resolves the finding it offers", () => {
    // The load-bearing law. A rule is built its own breaking document, the fix runs, and the
    // finding must be GONE — a repair that does not repair is worse than no repair at all.
    const breakers: Record<string, BuilderNode[]> = {
      "one-figure": [
        node("Card", {}, {
          children: [node("Button", { emphasis: "loud" }, { text: "A" }), node("Button", { emphasis: "loud" }, { text: "B" })],
        }),
      ],
      "size-1-retired": [node("Text", { size: "1" }, { text: "small" })],
      "empty-container": [node("Stack", {}, { children: [] })],
      "single-child-layout": [node("Stack", {}, { children: [node("Text", {}, { text: "one" })] })],
      "flat-rhythm": [
        node("Stack", { gap: "3" }, { children: [node("Stack", { gap: "3" }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] })] }),
      ],
      "mixed-control-sizes": [
        node("Flex", {}, {
          children: [
            node("Button", { size: "2" }, { text: "a" }),
            node("Button", { size: "1" }, { text: "b" }),
          ],
        }),
      ],
      "heading-ladder": [node("Heading", { size: "3" }, { text: "Title" })],
      "orphan-part": [node("DialogTitle", {}, { text: "Stranded" })],
    };

    for (const [ruleId, roots] of Object.entries(breakers)) {
      const rule = RULES.find((r) => r.id === ruleId)!;
      const before = reviewDocument(asDoc(roots)).filter((f) => f.rule === rule.title);
      expect(before.length, `${ruleId} did not fire on a document built to break it`).toBeGreaterThan(0);
      const finding = before[0]!;
      expect(finding.fix, `${ruleId} offers no fix`).toBeDefined();
      const repaired = finding.fix!.apply(roots);
      const after = reviewDocument(asDoc(repaired)).filter((f) => f.id === finding.id);
      expect(after, `${ruleId}'s fix left its own finding standing`).toHaveLength(0);
    }
  });

  it("a document composed to the brief raises nothing at all", () => {
    // The vacuity guard from the other side: rules that fire on everything are noise.
    const clean = node("Card", { size: "3" }, {
      children: [
        node("Stack", { gap: "5" }, {
          children: [
            node("Stack", { gap: "2" }, {
              children: [
                node("Heading", { size: "6" }, { text: "Rename project" }),
                node("Text", { size: "2", emphasis: "medium" }, { text: "Everyone with access will see it." }),
              ],
            }),
            node("TextField", { "aria-label": "Project name" }),
            node("Flex", { gap: "3" }, {
              children: [
                node("Button", { emphasis: "quiet" }, { text: "Cancel" }),
                node("Button", { emphasis: "loud" }, { text: "Save" }),
              ],
            }),
          ],
        }),
      ],
    });
    expect(reviewDocument(asDoc([clean]))).toEqual([]);
  });

  it("every rule the catalog can express is reachable — no rule is dead code", () => {
    // A rule nobody can trigger is a rule nobody maintains.
    for (const rule of RULES) {
      expect(typeof rule.run).toBe("function");
    }
    expect(RULES.length).toBeGreaterThanOrEqual(8);
    expect(Object.keys(CATALOG).length).toBeGreaterThan(20);
  });
});

describe("a document's appearance is its own", () => {
  it("a new document INHERITS — it does not pin the canvas to a mode", () => {
    // themeDefaults.appearance is `light`; taking it would stop the canvas following the
    // site's toggle, which is the regression this law exists for.
    expect(defaultDocTheme().appearance).toBe("inherit");
  });

  it("`inherit` exports nothing; a chosen appearance exports", () => {
    const base: BuilderDoc = { theme: defaultDocTheme(), roots: [node("Button", {}, { text: "ok" })] };
    expect(serializeDocument(base)).not.toContain("appearance");
    const dark: BuilderDoc = { ...base, theme: { ...base.theme, appearance: "dark" } };
    expect(serializeDocument(dark)).toContain('<Theme appearance="dark">');
  });
});

/* ── Templates ─────────────────────────────────────────────────────────────────────────── */

describe("a template is the brief demonstrated, not decoration", () => {
  it("every template raises NOTHING in review", () => {
    // The property that makes templates worth shipping: this editor can check its own house
    // style, so the screens it hands you must hold to it. If the brief's rules change, these
    // fail here until the templates follow.
    for (const template of TEMPLATES) {
      const findings = reviewDocument(templateDoc(template));
      expect(
        findings.map((f) => `${f.rule}: ${f.message}`),
        `${template.name} does not hold to the house style it is meant to demonstrate`,
      ).toEqual([]);
    }
  });

  it("every template serializes to code without throwing", () => {
    for (const template of TEMPLATES) {
      expect(() => serializeDocument(templateDoc(template)), `${template.name} cannot be exported`).not.toThrow();
    }
  });

  it("every template's blurb is a real sentence, and its ids are stable", () => {
    for (const template of TEMPLATES) {
      expect(template.blurb.length, `${template.name}'s blurb says nothing`).toBeGreaterThan(20);
      const once = templateDoc(template);
      const twice = templateDoc(template);
      expect(JSON.stringify(once.roots)).toBe(JSON.stringify(twice.roots));
    }
  });

  it("templates speak the grammar — every node is placeable where it stands", () => {
    const check = (list: BuilderNode[], parentType: string | null, chain: string[]) => {
      for (const n of list) {
        expect(CATALOG[n.type], `a template places "${n.type}", which is not in the catalog`).toBeDefined();
        if (parentType) {
          expect(
            canContainForTest(parentType, n.type, chain),
            `a template places a ${n.type} inside a ${parentType}, which the grammar refuses`,
          ).toBe(true);
        }
        check(n.children ?? [], n.type, [...chain, n.type]);
      }
    };
    for (const template of TEMPLATES) check(templateDoc(template).roots, null, []);
  });
});

/* One shared fixture check: the ids the laws lean on are the model's, not invented here. */
describe("the fixtures speak the real model", () => {
  it("node() ids are unique and findable", () => {
    const a = node("Button", {}, { text: "a" });
    const b = node("Button", {}, { text: "b" });
    expect(a.id).not.toBe(b.id);
    expect(findNode([node("Card", {}, { children: [a] })], a.id)).toBe(a);
  });
});
