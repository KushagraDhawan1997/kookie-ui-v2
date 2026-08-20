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

import { CATALOG, canContain as canContainForTest, normalizeSeats, sanitizeNode, sharedProps } from "./catalog";
import {
  COMMANDS,
  allCommands,
  armed,
  chordLabel,
  chordMatches,
  decodeNodes,
  encodeNodes,
  matches,
  type Command,
  type CommandContext,
} from "./commands";
import { CanvasBoundary, CONTEXT_COMMANDS } from "./chrome";
import { box, dropSpot, rowsOf } from "./geometry";
import { MIXED, UNSET, pickOrder, readPick } from "./inspector";
import {
  defaultDocTheme,
  findNode,
  flowChildren,
  matchingIds,
  moveNodeTo,
  node,
  unwrapNode,
  updatePropsMany,
  type BuilderDoc,
  type BuilderNode,
} from "./model";
import {
  canAccept,
  canUnwrap,
  canWrap,
  insertableInto,
  insertionTarget,
  placeNodes,
  typesThrough,
} from "./placement";
import { TEMPLATES, templateDoc } from "./templates";
import { starterDoc } from "./builder-app";
import { serializeDocument } from "./serialize";
import { RULES, legalValue, reviewDocument } from "./review";
import {
  activeDoc,
  canRedo,
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

  it("typing a sentence is ONE undo, not one per character", () => {
    // Measured before this: the inspector's content field committed a history-pushing edit
    // per keystroke. A two-line description cost 120 presses to take back, and ~200
    // characters silently evicted every earlier snapshot — the card you built before you
    // started typing included, because the stack is capped.
    const t = node("Text", {}, { text: "" });
    let s = start(t);
    for (const word of ["H", "He", "Hel", "Hell", "Hello"]) {
      s = reducer(s, {
        type: "edit",
        roots: [{ ...t, text: word }],
        coalesce: `text:${t.id}`,
      });
    }
    expect(findNode(activeDoc(s).roots, t.id)!.text).toBe("Hello");
    s = reducer(s, { type: "undo" });
    expect(findNode(activeDoc(s).roots, t.id)!.text).toBe("");
    expect(canUndo(s)).toBe(false);
  });

  it("a run ends where the gesture does — another field, and a selection in between", () => {
    const a = node("Text", {}, { text: "" });
    const b = node("Text", {}, { text: "" });
    const type = (s: EditorState, n: BuilderNode, roots: BuilderNode[]) =>
      reducer(s, { type: "edit", roots, coalesce: `text:${n.id}` });

    // A different node ends the run.
    let s = start(a, b);
    s = type(s, a, [{ ...a, text: "x" }, b]);
    s = type(s, a, [{ ...a, text: "xy" }, b]);
    s = type(s, b, [{ ...a, text: "xy" }, { ...b, text: "z" }]);
    expect(s.histories[s.activeId]!.past).toHaveLength(2);

    // And so does a SELECTION between keystrokes, with the key otherwise unchanged — which
    // is the only arrangement that tests it: clicking away and coming back is a second
    // sentence, so it gets a second entry.
    let t = start(a);
    t = type(t, a, [{ ...a, text: "x" }]);
    t = reducer(t, { type: "select", ids: [a.id] });
    t = type(t, a, [{ ...a, text: "xy" }]);
    expect(t.histories[t.activeId]!.past).toHaveLength(2);

    // …and an UNKEYED edit never rides anything, however many arrive in a row.
    let u = start(a);
    for (let i = 0; i < 3; i++) u = reducer(u, { type: "edit", roots: [{ ...a, text: String(i) }] });
    expect(u.histories[u.activeId]!.past).toHaveLength(3);
  });

  it("leaving the document ends the run too — undo may not reach across the trip", () => {
    // The key lives per document, so without ending the run here, typing, switching away,
    // switching back and typing again would extend a snapshot taken before the trip: one
    // undo reaching across a gap the person spent somewhere else.
    const t = node("Text", {}, { text: "" });
    let s = start(t);
    s = reducer(s, { type: "edit", roots: [{ ...t, text: "a" }], coalesce: "k" });
    const first = s.docs[0]!.id;
    s = reducer(s, { type: "docNew", name: "Elsewhere" });
    s = reducer(s, { type: "docSwitch", id: first });
    s = reducer(s, { type: "edit", roots: [{ ...t, text: "ab" }], coalesce: "k" });
    expect(s.histories[first]!.past).toHaveLength(2);
  });

  it("an undo interrupts a run — the next keystroke does not resume it", () => {
    // The first spelling of this law asked whether a coalesced edit clears redo, and could
    // not fail: an undo rebuilds the history without a key, so the ONLY state that reaches
    // the riding branch already has an empty future. What is reachable, and worth holding,
    // is that stepping back mid-sentence starts a new entry rather than silently extending
    // the one you just undid past.
    const t = node("Text", {}, { text: "" });
    let s = start(t);
    s = reducer(s, { type: "edit", roots: [{ ...t, text: "a" }], coalesce: "k" });
    s = reducer(s, { type: "edit", roots: [{ ...t, text: "ab" }], coalesce: "k" });
    expect(s.histories[s.activeId]!.past).toHaveLength(1);
    s = reducer(s, { type: "undo" });
    expect(canRedo(s)).toBe(true);
    s = reducer(s, { type: "edit", roots: [{ ...t, text: "z" }], coalesce: "k" });
    expect(canRedo(s)).toBe(false);
    expect(s.histories[s.activeId]!.past).toHaveLength(1);
    s = reducer(s, { type: "undo" });
    expect(findNode(activeDoc(s).roots, t.id)!.text).toBe("");
  });

  it("a block saved under a name it already has REPLACES it", () => {
    // Blocks were write-only: save and place, with no way back in, so a typo in a saved card
    // meant rebuilding it. The way back is opening it as a document — which only works if
    // saving it again under the same name updates the block instead of leaving two of them
    // with one name and no way to tell them apart.
    const first = node("Card", { size: "2" }, { children: [node("Text", {}, { text: "one" })] });
    let s = start();
    s = reducer(s, { type: "blockSave", block: { name: "Media card", node: first } });
    expect(s.blocks).toHaveLength(1);
    const edited = node("Card", { size: "3" }, { children: [node("Text", {}, { text: "two" })] });
    s = reducer(s, { type: "blockSave", block: { name: "Media card", node: edited } });
    expect(s.blocks).toHaveLength(1);
    expect(s.blocks[0]!.node.props.size).toBe("3");
    // A different name is a different block.
    s = reducer(s, { type: "blockSave", block: { name: "Other", node: first } });
    expect(s.blocks.map((b) => b.name)).toEqual(["Media card", "Other"]);
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
    // `toMatch(/z/i)` alone passes for the identity function, so the modifiers are named too.
    const label = chordLabel("mod+shift+z");
    expect(label).toMatch(/z/i);
    expect(label).not.toBe("mod+shift+z");
    expect(label.toLowerCase()).not.toContain("mod");
    expect(chordLabel("backspace")).toBe("⌫");
    expect(chordLabel("mod+alt+arrowup")).toMatch(/↑/);
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

  it("nothing that can EDIT the document is armed in preview", () => {
    // Preview is the screen, not the editor: it renders with no stamps, so there is no ring
    // and no visible selection, while the selection itself is still live. Measured before
    // this: with a canvas checkbox focused — Base UI draws one as a <button>, which the
    // typing guard does not see — Backspace deleted the selected node silently.
    //
    // The keyboard lets `global` through, so `global` must mean "cannot edit". Run each one
    // against a real document and watch for a dispatch that changes it.
    const a = node("Button", {}, { text: "a" });
    let s = start(node("Stack", { gap: "3" }, { children: [a] }));
    s = reducer(s, { type: "select", ids: [a.id] });
    const ui = () => new Proxy({}, { get: () => () => {} }) as CommandContext["ui"];

    /* The law used to walk `COMMANDS.filter(c => c.global)` — the commands the KEYBOARD lets
       through — and it certified the very bypass it was written to prevent, two lines from
       the end, by asserting the palette is global. The palette lists the same table and did
       not ask about preview at all: measured in a production build, preview on and every
       editor pane gone, it offered 66 editing commands and "Delete" removed a node.

       So the subject is `armed`, the one gate every surface now passes through, and the walk
       is over EVERY command rather than the flagged ones. A command reachable in preview must
       not be able to edit; the flag is how that is spelled, not what is being asked. */
    let reachable = 0;
    for (const cmd of allCommands({ state: s, dispatch: () => {}, ui: ui(), preview: true })) {
      let touched = false;
      const ctx: CommandContext = {
        state: s,
        dispatch: (action) => {
          if (action.type !== "select") touched = true;
        },
        ui: ui(),
        preview: true,
      };
      if (!armed(cmd, ctx)) continue;
      reachable += 1;
      cmd.run(ctx);
      expect(touched, `"${cmd.id}" is reachable in preview — and it edits`).toBe(false);
    }
    // …and something IS reachable, or the walk proves nothing.
    expect(reachable).toBeGreaterThan(0);
    // The two that MUST be reachable: you have to be able to leave preview, and the palette
    // is how everything else is reached.
    expect(COMMANDS.find((c) => c.id === "preview")!.global).toBe(true);
    expect(COMMANDS.find((c) => c.id === "palette")!.global).toBe(true);

    // The other half, which the flag-shaped law could not state: OUT of preview the same
    // commands are offered, so the gate stands down rather than being a permanent ban.
    const editing = allCommands({ state: s, dispatch: () => {}, ui: ui(), preview: false }).filter((c) =>
      armed(c, { state: s, dispatch: () => {}, ui: ui(), preview: false }),
    );
    expect(editing.length).toBeGreaterThan(reachable);
    expect(editing.some((c) => c.id === "delete")).toBe(true);
  });

  it("a command the browser delivers as its own event says so, and is never global", () => {
    const viaEvent = COMMANDS.filter((c) => c.viaEvent);
    expect(viaEvent.map((c) => c.id).sort()).toEqual(["copy", "cut", "paste"]);
    for (const cmd of viaEvent) {
      // The flag exists to stop the key handler cancelling a keydown. With no chord there is
      // nothing to cancel, so the flag would be documentation of nothing.
      expect(cmd.chord, `${cmd.id} is marked viaEvent and has no chord`).toBeTruthy();
      // Global would put it back in the handler's path in preview, which is the same defect
      // one door over.
      expect(cmd.global).toBeUndefined();
    }
  });

  it("every command runs without throwing on an empty document", () => {
    // Enabled-ness is the guard; a command that is enabled must also be safe to run.
    const state = start();
    const ui = new Proxy({}, { get: () => () => {} }) as CommandContext["ui"];
    const ctx: CommandContext = { state, dispatch: () => {}, ui, preview: false };
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

  it("several nodes land in the order they were copied", () => {
    // The defect this replaces: both paste paths recomputed the target against a selection
    // whose index never moved, so each node pushed the previous one down and A,B,C pasted
    // back as C,B,A. Two files, one loop, no law.
    const target = node("Button", {}, { text: "T" });
    const stack = node("Stack", {}, { children: [target] });
    const clip = ["X", "Y", "Z"].map((t) => node("Button", {}, { text: t }));
    const { roots, placed } = placeNodes([stack], target.id, clip);
    expect(findNode(roots, stack.id)!.children!.map((c) => c.text)).toEqual(["T", "X", "Y", "Z"]);
    expect(placed).toHaveLength(3);
    // Fresh identities, so pasting twice does not alias.
    expect(placed.some((id) => clip.some((c) => c.id === id))).toBe(false);
  });

  it("appending keeps its order too, and the anchor is not re-read as a container", () => {
    // With nothing selected the target is the root with no index — appending, which must
    // still come out in order.
    const { roots } = placeNodes([], null, ["A", "B"].map((t) => node("Button", {}, { text: t })));
    expect(roots.map((r) => r.text)).toEqual(["A", "B"]);
    // And the anchor-advance spelling would put the Text INSIDE the Card, because
    // `insertionTarget` asks whether the anchor itself accepts the type.
    const anchor = node("Text", {}, { text: "anchor" });
    const out = placeNodes([anchor], anchor.id, [
      node("Card", { size: "3" }, { children: [] }),
      node("Text", {}, { text: "beside" }),
    ]);
    expect(out.roots.map((r) => r.type)).toEqual(["Text", "Card", "Text"]);
  });

  it("nodes that land in DIFFERENT parents each keep their own order", () => {
    // A panel refuses a Card, so `insertionTarget` walks up and the Card lands at the root —
    // the designed fallback. The two rows still go into the panel, and in order. This is the
    // case a single running index cannot serve, which is why the offsets are per parent.
    const content = node("MenuContent", {}, { children: [] });
    const menu = node("Menu", {}, { children: [content] });
    const { roots, placed } = placeNodes([menu], content.id, [
      node("MenuItem", {}, { text: "one" }),
      node("Card", { size: "3" }, { children: [] }),
      node("MenuItem", {}, { text: "two" }),
    ]);
    expect(placed).toHaveLength(3);
    expect(findNode(roots, content.id)!.children!.map((c) => c.text)).toEqual(["one", "two"]);
    expect(roots.map((r) => r.type)).toEqual(["Menu", "Card"]);
  });

  it("a parent that hands its child to `render` holds exactly one", () => {
    // The grammar answers per child and says nothing about how many, which was a hole for
    // the four entries whose child becomes a primitive's `render` element: both the
    // interpreter and the serializer take flowChildren[0], so a second child was in the
    // tree, in Layers and in storage, and drawn and exported nowhere.
    const button = node("Button", { emphasis: "medium" }, { text: "Actions" });
    const trigger = node("MenuTrigger", {}, { children: [button] });
    const menu = node("Menu", {}, { children: [trigger, node("MenuContent", {}, { children: [] })] });

    expect(CATALOG.MenuTrigger!.renderChild).toBe(true);
    // The grammar still says a Button MAY sit there — that is the type question, unchanged.
    expect(canContainForTest("MenuTrigger", "Button", ["Menu", "MenuTrigger"])).toBe(true);
    // …and the room question says the seat is taken.
    expect(canAccept([menu], trigger.id, "Button")).toBe(false);
    expect(insertableInto([menu], trigger.id)).toEqual([]);
    // Empty, it accepts one.
    const empty = node("MenuTrigger", {}, { children: [] });
    expect(canAccept([node("Menu", {}, { children: [empty] })], empty.id, "Button")).toBe(true);
    // An ordinary container is unaffected — the gate is about `render`, not about arity.
    const card = node("Card", { size: "3" }, { children: [node("Text", {}, { text: "a" })] });
    expect(canAccept([card], card.id, "Text")).toBe(true);
  });

  it("the Layers filter keeps a match AND the path to it", () => {
    const save = node("Button", {}, { text: "Save changes" });
    const inner = node("Flex", { gap: "3" }, { children: [save, node("Button", {}, { text: "Cancel" })] });
    const card = node("Card", { size: "3" }, { children: [inner] });
    const other = node("Card", { size: "3" }, { children: [node("Text", {}, { text: "elsewhere" })] });
    const roots = [card, other];

    // A match with its path cut off is a match nobody can place, so the ancestors stay.
    const hit = matchingIds(roots, "save")!;
    expect(hit.has(save.id)).toBe(true);
    expect(hit.has(inner.id)).toBe(true);
    expect(hit.has(card.id)).toBe(true);
    // …and nothing else does.
    expect(hit.has(other.id)).toBe(false);

    // Type names match too, and every word must appear, in any order.
    expect(matchingIds(roots, "button")!.has(save.id)).toBe(true);
    expect(matchingIds(roots, "changes save")!.has(save.id)).toBe(true);
    expect(matchingIds(roots, "save cancel")!.has(save.id)).toBe(false);
    expect(matchingIds(roots, "zzz")!.size).toBe(0);

    // An empty query is NO FILTER, which is the opposite answer to "nothing matched" — and a
    // Set cannot tell them apart, so it is null.
    expect(matchingIds(roots, "")).toBeNull();
    expect(matchingIds(roots, "   ")).toBeNull();
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

/* ── Seats that come loose ─────────────────────────────────────────────────────────────── */

describe("a seat is a fact about the PARENT, and the tree is held to that", () => {
  /** A Spinner sitting in a Button's leading seat — the shape the inspector creates. */
  const seated = () => {
    const spinner = { ...node("Spinner", {}), slot: "leading" as const };
    const button = node("Button", {}, { text: "Go", children: [spinner] });
    const stack = node("Stack", { gap: "3" }, { children: [button] });
    return { spinner, button, stack };
  };

  it("a node dragged out of its seat stops claiming it — measured, this was a GHOST", () => {
    const { spinner, stack } = seated();
    // The defect: `slot` rides on the node, so a move hands the new parent a child still
    // claiming a seat that parent does not offer. `flowChildren` filters it out, and that is
    // what BOTH the interpreter and the serializer walk — in the tree, in Layers, in
    // storage, drawn and exported nowhere.
    const moved = moveNodeTo([stack], spinner.id, stack.id, 1);
    expect(findNode(moved, spinner.id)!.slot).toBe("leading"); // the raw move still carries it
    let s = start(...moved);
    s = reducer(s, { type: "edit", roots: moved });
    const landed = findNode(activeDoc(s).roots, spinner.id)!;
    expect(landed.slot).toBeUndefined();
    // The consequence the law is really about: it is drawn, and it is exported.
    expect(flowChildren(findNode(activeDoc(s).roots, stack.id)!).map((c) => c.type)).toEqual([
      "Button",
      "Spinner",
    ]);
    const code = serializeDocument({ theme: defaultDocTheme(), roots: activeDoc(s).roots });
    expect(code).toContain("<Spinner");
  });

  it("unwrapping the control it sat in frees the seat too", () => {
    const { spinner, button, stack } = seated();
    let s = start(stack);
    s = reducer(s, { type: "edit", roots: unwrapNode([stack], button.id) });
    expect(findNode(activeDoc(s).roots, spinner.id)!.slot).toBeUndefined();
  });

  it("an unused import is impossible: what the export NAMES, the export uses", () => {
    // The half of the ghost that reached the reader: `collectTypes` walked `children` while
    // the emitter walked `flowChildren`, so the module imported Spinner and never used it —
    // code the export dialog called ready to paste and that fails lint on arrival.
    const { spinner, stack } = seated();
    let s = start(...moveNodeTo([stack], spinner.id, stack.id, 1));
    s = reducer(s, { type: "edit", roots: activeDoc(s).roots });
    const code = serializeDocument({ theme: defaultDocTheme(), roots: activeDoc(s).roots });
    const imported = /import \{([^}]*)\} from "@kookie-ui\/react"/.exec(code)![1]!;
    for (const name of imported.split(",").map((x) => x.trim())) {
      expect(code.includes(`<${name}`)).toBe(true);
    }
  });

  it("one child per seat — the second joins the flow rather than vanishing", () => {
    const a = { ...node("Spinner", {}), slot: "leading" as const };
    const b = { ...node("Kbd", {}, { text: "K" }), slot: "leading" as const };
    const button = node("Button", {}, { text: "Go", children: [a, b] });
    let s = start(button);
    s = reducer(s, { type: "edit", roots: [button] });
    const kids = findNode(activeDoc(s).roots, button.id)!.children!;
    expect(kids.filter((c) => c.slot === "leading")).toHaveLength(1);
    expect(kids.find((c) => c.id === a.id)!.slot).toBe("leading");
    expect(kids.find((c) => c.id === b.id)!.slot).toBeUndefined();
  });

  it("a legal seat is left alone, and untouched branches keep their IDENTITY", () => {
    const { spinner, button, stack } = seated();
    const other = node("Card", { size: "3" }, { children: [node("Text", {}, { text: "x" })] });
    const roots = [stack, other];
    const out = normalizeSeats(roots);
    expect(out).toBe(roots); // nothing was wrong, so nothing was rebuilt
    expect(findNode(out, spinner.id)!.slot).toBe("leading");
    expect(findNode(out, button.id)!.children).toHaveLength(1);
    // …and when something IS wrong, only that branch is rebuilt.
    const broken = [{ ...stack, children: [{ ...spinner }] }, other];
    const fixed = normalizeSeats(broken);
    expect(fixed).not.toBe(broken);
    expect(fixed[1]).toBe(other);
  });

  it("storage repairs a seat it can no longer justify", () => {
    // The guard this replaces read `CATALOG[n.type]`, which the two lines above it have
    // already proven truthy — a tautology wearing a real check's comment.
    const loose = sanitizeNode({ id: "x", type: "Text", props: {}, slot: "leading", text: "hi" } as never);
    expect(loose!.slot).toBeUndefined();
    // Seated under something that DOES offer the seat, it survives.
    const ok = sanitizeNode({ id: "x", type: "Text", props: {}, slot: "leading", text: "hi" } as never, "Button");
    expect(ok!.slot).toBe("leading");
    // A Card offers no seat at all; a field's seat refuses a Card.
    expect(sanitizeNode({ id: "y", type: "Text", props: {}, slot: "leading" } as never, "Card")!.slot).toBeUndefined();
    expect(sanitizeNode({ id: "z", type: "Card", props: {}, slot: "leading" } as never, "TextField")!.slot).toBeUndefined();
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

/* ── The drop scan's arithmetic ────────────────────────────────────────────────────────── */

describe("one measurement serves all four layouts", () => {
  const container = box(0, 0, 300, 200);

  it("a column drops on Y, and every position between its children is reachable", () => {
    const kids = [box(0, 0, 300, 40), box(0, 50, 300, 40), box(0, 100, 300, 40)];
    const at = (y: number) => dropSpot(kids, container, 150, y)!;
    expect(at(5).index).toBe(0);
    expect(at(35).index).toBe(1);
    expect(at(55).index).toBe(1);
    expect(at(135).index).toBe(3);
    // …and the line is drawn across the container, because that is the gutter it is in.
    expect(at(45).orientation).toBe("horizontal");
    expect(at(45).line.w).toBe(300);
  });

  it("a row drops on X, with the line only as tall as the row", () => {
    const kids = [box(0, 0, 80, 40), box(100, 0, 80, 40), box(200, 0, 80, 40)];
    const at = (x: number) => dropSpot(kids, container, x, 20)!;
    expect(at(10).index).toBe(0);
    expect(at(50).index).toBe(1);
    expect(at(150).index).toBe(2);
    expect(at(270).index).toBe(3);
    expect(at(90).orientation).toBe("vertical");
    expect(at(90).line.h).toBe(40);
    expect(at(90).line.w).toBe(2);
  });

  it("a GRID row is reachable BETWEEN its cells — the position that could not be dropped on", () => {
    // The defect: the scan asked the container's `display` and measured everything that was
    // not a flex row on Y alone. Two cells of one grid row share a vertical midpoint, so the
    // scan stepped over BOTH at once — index went 0 → 2 and position 1 did not exist —
    // while the line drew a full-width bar claiming to be between two rows.
    const kids = [
      box(0, 0, 90, 60),
      box(105, 0, 90, 60),
      box(210, 0, 90, 60),
      box(0, 75, 90, 60),
      box(105, 75, 90, 60),
      box(210, 75, 90, 60),
    ];
    const at = (x: number, y: number) => dropSpot(kids, container, x, y)!;
    expect(rowsOf(kids)).toEqual([
      [0, 1, 2],
      [3, 4, 5],
    ]);
    // Every position in the first row, including the two that were unreachable.
    expect([at(10, 30).index, at(95, 30).index, at(200, 30).index, at(295, 30).index]).toEqual([0, 1, 2, 3]);
    // The second row continues the document order rather than restarting.
    expect([at(10, 100).index, at(95, 100).index, at(295, 100).index]).toEqual([3, 4, 6]);
    // Inside a row the line is vertical and one row tall; between rows it spans the box.
    expect(at(95, 30).orientation).toBe("vertical");
    expect(at(95, 30).line.h).toBe(60);
    expect(at(150, 68).orientation).toBe("horizontal");
    expect(at(150, 68).line.w).toBe(300);
  });

  it("a WRAPPED row is the same shape, and the wrap boundary is visible to it", () => {
    // The mirror of the grid case: the old scan called this "flex row" and measured X alone,
    // so the wrap boundary did not exist and the last item of line one and the first of line
    // two were compared on an axis they do not share.
    const kids = [box(0, 0, 140, 40), box(150, 0, 140, 40), box(0, 50, 140, 40)];
    const at = (x: number, y: number) => dropSpot(kids, container, x, y)!;
    expect(rowsOf(kids)).toEqual([[0, 1], [2]]);
    expect(at(280, 20).index).toBe(2); // after both of line one
    expect(at(10, 70).index).toBe(2); // before the wrapped item
    expect(at(130, 60).index).toBe(3); // after it
  });

  it("the LAST line of a wrap holds one item and is still a ROW — the container flows, not the row", () => {
    // Mine, one commit old and found by dragging: the rule "a row holding ONE item is decided
    // on Y" was written for a Stack, where every row holds one, and it also fires on the last
    // line of a wrap. Measured in the browser — six cards wrapping to two lines, hovering the
    // LEFT half of the only item on line two — it read the pointer's half on Y, and because
    // the pointer sat below that item's middle it inserted AFTER the item the pointer was
    // pointing at the front of. The question is what the CONTAINER flows, and only a container
    // whose every row holds one item is a column.
    const kids = [box(0, 0, 140, 40), box(150, 0, 140, 40), box(0, 50, 140, 40)];
    const at = (x: number, y: number) => dropSpot(kids, container, x, y)!;
    // x=70 is the wrapped item's horizontal middle, y=70 its vertical one. Every point here
    // is on the far side of the Y midpoint from the X one, so the two readings disagree.
    expect(at(10, 80).index).toBe(2); // left half, low: BEFORE it
    expect(at(130, 60).index).toBe(3); // right half, high: after it
    // …and the line follows the same axis: beside the item, not a bar through a gutter the
    // pointer is not in.
    expect(at(10, 80).orientation).toBe("vertical");
    expect(at(10, 80).line.h).toBe(40);
    // The Stack reading survives: there, every row really does hold one item.
    const stacked = [box(0, 0, 300, 40), box(0, 50, 300, 40)];
    expect(dropSpot(stacked, container, 10, 30)!.index).toBe(1);
    expect(dropSpot(stacked, container, 10, 30)!.orientation).toBe("horizontal");
  });

  it("the line goes where the drop goes — the half no law was reading", () => {
    // The five laws above asserted orientation, width and height, and never a POSITION. That
    // is the half of "the indicator lied about it" that shipped a regression: deriving the
    // gutter from the pointer's ROW puts the line through the middle of the item the pointer
    // is over whenever that row holds one item, which is every row of a Stack. Measured
    // before the repair: hovering the lower half of the first of three stacked items gave
    // index 1 and drew the line at y=19 — above the pointer, through item zero — while the
    // drop landed at 45. Two different drops drew the same line.
    const kids = [box(0, 0, 300, 40), box(0, 50, 300, 40), box(0, 100, 300, 40)];
    const container = box(0, 0, 300, 200);
    const at = (y: number) => dropSpot(kids, container, 150, y)!;

    // For every pointer position, the line sits between the two items the INDEX names.
    for (const y of [5, 15, 25, 35, 45, 55, 95, 105, 135, 150]) {
      const s = at(y);
      const prev = s.index > 0 ? kids[s.index - 1] : undefined;
      const next = s.index < kids.length ? kids[s.index] : undefined;
      const lo = prev ? prev.bottom : -Infinity;
      const hi = next ? next.top : Infinity;
      expect(s.line.y + 1, `at y=${y} the line is not in the gutter index ${s.index} names`).toBeGreaterThanOrEqual(lo - 4);
      expect(s.line.y + 1).toBeLessThanOrEqual(hi + 4);
    }
    // …and two DIFFERENT drops never draw the same line.
    expect(at(15).line.y).not.toBe(at(35).line.y);
    expect(at(15).index).toBe(0);
    expect(at(35).index).toBe(1);

    // A row of several: the vertical line sits between the two cells its index names.
    const row = [box(0, 0, 90, 60), box(105, 0, 90, 60), box(210, 0, 90, 60)];
    const mid = dropSpot(row, container, 95, 30)!;
    expect(mid.index).toBe(1);
    expect(mid.line.x + 1).toBeGreaterThanOrEqual(row[0]!.right);
    expect(mid.line.x + 1).toBeLessThanOrEqual(row[1]!.left);
  });

  it("a row of UNEQUAL heights ends where the ROW ends, not where its last child does", () => {
    // The half the repair above still got wrong, and its law could not see because every box
    // in it was the same height. A row holds a tall card and a short button; the button is
    // last in document order and, being centred, its bottom edge sits 33px above the card's.
    // Dropping below the whole row lands after both — correct — but the line was drawn from
    // the last DOCUMENT neighbour, so it cut through the middle of the card that is still
    // below it. Measured in a production build: pointer at y=210 under a row spanning
    // 106–204, line drawn at 173.
    //
    // The comment justifying it said the two neighbours "always straddle a row boundary".
    // They straddle it in document order; they do not bound it in pixels. A row's extent is
    // the union of its children, so the gutter is read off the ROWS the index falls between.
    const tall = box(0, 106, 300, 98);
    const short = box(0, 139, 300, 32);
    const container = box(0, 94, 300, 122);
    const below = dropSpot([tall, short], container, 150, 210)!;
    expect(below.index).toBe(2);
    expect(below.orientation).toBe("horizontal");
    expect(below.line.y + 1).toBeGreaterThanOrEqual(tall.bottom);

    // The same in the other direction: a row whose FIRST child is the short one.
    const above = dropSpot([short, tall], container, 150, 100)!;
    expect(above.index).toBe(0);
    expect(above.line.y + 1).toBeLessThanOrEqual(tall.top);

    // …and between two rows of unequal heights, the line is in the real gutter.
    const rowA = [box(0, 0, 140, 80), box(150, 30, 140, 20)];
    const rowB = [box(0, 100, 140, 40)];
    const between = dropSpot([...rowA, ...rowB], box(0, 0, 300, 200), 150, 90)!;
    expect(between.index).toBe(2);
    expect(between.line.y + 1).toBeGreaterThanOrEqual(80);
    expect(between.line.y + 1).toBeLessThanOrEqual(100);
  });

  it("the gap bands and the drop scan group rows the SAME way, because it is one function", () => {
    // `measureBands` carried its own copy of the grouping, comment and all, and the copies
    // had drifted: one filtered zero-size boxes and required two children, the other did
    // neither. A fix to either could not reach the other, and only one of them had laws.
    const kids = [box(0, 0, 90, 60), box(105, 0, 90, 60), box(0, 75, 90, 60)];
    expect(rowsOf(kids)).toEqual([[0, 1], [2]]);
    // A DOMRect satisfies Box structurally, which is what lets one function serve both.
    const asRects = kids.map((k) => ({ ...k }));
    expect(rowsOf(asRects)).toEqual(rowsOf(kids));
  });

  it("nothing to measure is no answer at all, not index zero", () => {
    expect(dropSpot([], container, 10, 10)).toBeNull();
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

  it("a finding names its RULE, not its title — one fact, one home", () => {
    // `rule` used to hold the title, so a renamed rule silently kept its old finding-id
    // prefix and the panel had two names for one thing.
    const f = reviewDocument(asDoc([node("Text", { size: "1" }, { text: "x" })]))[0]!;
    const rule = RULES.find((r) => r.id === f.rule)!;
    expect(rule).toBeDefined();
    expect(f.title).toBe(rule.title);
    expect(f.id.startsWith(`${rule.id}:`)).toBe(true);
    expect(f.severity).toBe(rule.severity);
    expect(f.why).toBe(rule.why);
  });

  it("the figure budget is the SCREEN, and a layer is its own screen", () => {
    const loud = (t: string) => node("Button", { emphasis: "loud" }, { text: t });
    const card = (t: string) => node("Card", { size: "3" }, { children: [loud(t)] });
    const figures = (roots: BuilderNode[]) => reviewDocument(asDoc(roots)).filter((f) => f.rule === "one-figure");

    // Three plan cards, three loud buttons, one screen. The pane-scoped reading called this
    // clean, which is the playground's own plan-picker shape passing a rule it violates.
    expect(figures([node("Stack", { gap: "6" }, { children: [card("A"), card("B"), card("C")] })])).toHaveLength(2);

    // A nested Card does not reset the budget either.
    expect(figures([node("Card", { size: "3" }, { children: [loud("outer"), card("inner")] })])).toHaveLength(1);

    // A dialog IS its own screen: its loud action does not compete with the page behind it.
    expect(
      figures([
        node("Stack", { gap: "6" }, {
          children: [loud("page"), node("DialogContent", {}, { children: [loud("dialog")] })],
        }),
      ]),
    ).toHaveLength(0);

    // Two tab panels are never on screen together.
    expect(
      figures([
        node("Tabs", { defaultValue: "a" }, {
          children: [
            node("TabsPanel", { value: "a" }, { children: [loud("deploy")] }),
            node("TabsPanel", { value: "b" }, { children: [loud("save")] }),
          ],
        }),
      ]),
    ).toHaveLength(0);
    // WHICH node is flagged, not just how many. The sort that decides "the first keeps the
    // budget" ran `all.indexOf` over spread COPIES, so it answered -1 every time and did
    // nothing — document order survived by accident on the plain path and not on the tab
    // path, where the always-visible buttons are prepended. The rule flagged the EARLIER
    // button and offered to demote the wrong one; five existing cases all passed, because
    // every one of them counted findings and none of them read an id.
    const deploy = loud("Deploy");
    const publish = loud("Publish");
    const tabbed = figures([
      node("Stack", { gap: "6" }, {
        children: [
          node("Tabs", { defaultValue: "a" }, {
            children: [
              node("TabsList", { "aria-label": "S" }, { children: [node("TabsTab", { value: "a" }, { text: "A" })] }),
              node("TabsPanel", { value: "a" }, { children: [deploy] }),
            ],
          }),
          publish,
        ],
      }),
    ]);
    expect(tabbed).toHaveLength(1);
    expect(tabbed[0]!.nodeId, "the FIRST in document order keeps the budget").toBe(publish.id);

    // …and on the plain path too, which is where it was right by accident.
    const first = loud("first");
    const second = loud("second");
    const plain = figures([node("Card", { size: "3" }, { children: [first, second] })]);
    expect(plain[0]!.nodeId).toBe(second.id);

    // …but two in ONE panel are.
    expect(
      figures([
        node("Tabs", { defaultValue: "a" }, {
          children: [node("TabsPanel", { value: "a" }, { children: [loud("one"), loud("two")] })],
        }),
      ]),
    ).toHaveLength(1);
  });

  it("the house intervals are not a fault — a between against a between never competes", () => {
    const rhythm = (roots: BuilderNode[]) => reviewDocument(asDoc(roots)).filter((f) => f.rule === "flat-rhythm");
    const pair = (gap: string) =>
      node("Stack", { gap }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] });

    // The brief's own intervals: section 6 holding groups at 5, each holding pairs at 3.
    // The first reading flagged the 5-in-6 as one step apart; those are two BETWEEN
    // distances, and the rule is about a within against a between.
    const groups = node("Stack", { gap: "5" }, { children: [pair("3"), pair("3")] });
    expect(rhythm([node("Stack", { gap: "6" }, { children: [groups, pair("3")] })])).toHaveLength(0);

    // A leaf group at the SAME gap as the rhythm around it is the real fault.
    expect(rhythm([node("Stack", { gap: "3" }, { children: [pair("3"), pair("3")] })])).toHaveLength(2);
    // One step is still not two.
    expect(rhythm([node("Stack", { gap: "4" }, { children: [pair("3")] })])).toHaveLength(1);
    // A row inside a column is not measured against it, in either direction.
    expect(
      rhythm([node("Stack", { gap: "3" }, { children: [node("Flex", { gap: "3" }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] })] })]),
    ).toHaveLength(0);
  });

  it("a control with no accessible name is an ERROR, and the inspector can answer it", () => {
    const findings = reviewDocument(asDoc([node("Checkbox", {})]));
    const name = findings.find((f) => f.rule === "accessible-name");
    expect(name?.severity).toBe("error");
    expect(reviewDocument(asDoc([node("Checkbox", { "aria-label": "Agree" })]))).toHaveLength(0);

    // The half that made this rule unanswerable: an error whose remedy the panel does not
    // offer is an error nobody can clear. Every type it can flag must expose `aria-label`.
    const flaggable = ["Checkbox", "Switch", "Radio", "RadioGroup", "Slider", "Progress", "TextField", "TextArea", "SegmentedControl", "TabsList", "Button"];
    for (const type of flaggable) {
      expect(CATALOG[type]!.props["aria-label"], `${type} can be flagged for a name it cannot be given`).toBeDefined();
    }
    // And an icon-only Button — the case §4 ships on purpose — clears with one.
    expect(reviewDocument(asDoc([node("Button", { "aria-label": "Search" })])).filter((f) => f.rule === "accessible-name")).toHaveLength(0);
  });

  it("a part outside its compound is caught for EVERY part, not the four strict ones", () => {
    const orphans = (t: string) =>
      reviewDocument(asDoc([node("Stack", { gap: "3" }, { children: [node(t, { value: "x" }, { text: "Stray" }), node("Text", {}, { text: "b" })] })])).filter(
        (f) => f.rule === "orphan-part",
      );
    // `requiresAncestor` covers four entries; `partOf` covers the rest, and the rule was
    // keyed on the first — so a SegmentedItem outside its control was silent.
    expect(orphans("SegmentedItem")).toHaveLength(1);
    expect(orphans("MenuItem")).toHaveLength(1);
    expect(orphans("Radio")).toHaveLength(1);
    // Seated properly, silence.
    expect(
      reviewDocument(
        asDoc([node("SegmentedControl", { defaultValue: "x", "aria-label": "View" }, { children: [node("SegmentedItem", { value: "x" }, { text: "X" })] })]),
      ).filter((f) => f.rule === "orphan-part"),
    ).toHaveLength(0);
  });

  it("an empty compound is an error where an empty layout is a warning", () => {
    const of = (roots: BuilderNode[], id: string) => reviewDocument(asDoc(roots)).filter((f) => f.rule === id);
    expect(of([node("Stack", { gap: "3" }, { children: [] })], "empty-container")[0]!.severity).toBe("warning");
    const group = node("RadioGroup", { defaultValue: "a", "aria-label": "Pick" }, { children: [] });
    expect(of([group], "empty-compound")[0]!.severity).toBe("error");
  });

  it("errors sort above warnings", () => {
    const findings = reviewDocument(
      asDoc([node("Stack", {}, { children: [] }), node("Checkbox", {})]),
    );
    expect(findings[0]!.severity).toBe("error");
  });

  it("EVERY fix resolves its finding, and RAISES NOTHING NEW", () => {
    // The load-bearing law, in both directions. Asking only whether the finding went is one
    // indirection short: a fix can silence its own rule while making the document worse —
    // measured, before the rewrite, on a row of controls at 2/4/2 where the repair produced
    // 2/4/4 and then went quiet.
    const pair = (gap: string) =>
      node("Stack", { gap }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] });
    const breakers: Record<string, BuilderNode[]> = {
      "one-figure": [
        node("Card", { size: "3" }, {
          children: [node("Button", { emphasis: "loud" }, { text: "A" }), node("Button", { emphasis: "loud" }, { text: "B" })],
        }),
      ],
      "size-1-retired": [node("Text", { size: "1" }, { text: "small" })],
      "empty-container": [node("Stack", { gap: "3" }, { children: [] })],
      "single-child-layout": [node("Stack", {}, { children: [node("Text", {}, { text: "one" })] })],
      "flat-rhythm": [node("Stack", { gap: "3" }, { children: [pair("3"), pair("3")] })],
      "heading-space": [
        node("Stack", { gap: "5" }, {
          children: [
            node("Text", { size: "2" }, { text: "Above" }),
            node("Heading", { size: "6" }, { text: "Notifications" }),
            node("Text", { size: "2", emphasis: "medium" }, { text: "What reaches you." }),
          ],
        }),
      ],
      "mixed-control-sizes": [
        node("Flex", { gap: "3" }, {
          children: [
            node("Button", { size: "2" }, { text: "a" }),
            node("Button", { size: "2" }, { text: "b" }),
            node("Button", { size: "4" }, { text: "c" }),
          ],
        }),
      ],
      "control-scale": [
        node("Card", { size: "4" }, { children: [node("Button", { size: "1" }, { text: "Save" })] }),
      ],
      "eyebrow": [
        node("Stack", { gap: "2" }, {
          children: [
            node("Text", { size: "2", emphasis: "medium" }, { text: "PREFERENCES" }),
            node("Heading", { size: "6" }, { text: "Notifications" }),
          ],
        }),
      ],
      "zero-width-container": [
        node("Flex", { gap: "3" }, {
          children: [node("Box", { container: true }, { children: [node("Text", {}, { text: "a" })] }), node("Text", {}, { text: "b" })],
        }),
      ],
      "orphan-part": [node("DialogTitle", {}, { text: "Stranded" })],
    };

    // Both directions: every rule that offers a fix has a breaker here. The map used to be
    // hand-written and walked one way, so a new rule with a fix that repairs nothing would
    // have passed by not being listed.
    const fixing = new Set<string>();
    for (const rule of RULES) {
      const probe = breakers[rule.id];
      if (probe && reviewDocument(asDoc(probe)).some((f) => f.rule === rule.id && f.fix)) fixing.add(rule.id);
    }
    for (const rule of RULES) {
      const offersFix = Object.values(breakers).some((roots) =>
        reviewDocument(asDoc(roots)).some((f) => f.rule === rule.id && f.fix),
      );
      if (offersFix) {
        expect(breakers[rule.id], `${rule.id} offers a fix and has no document that breaks it`).toBeDefined();
      }
    }

    for (const [ruleId, roots] of Object.entries(breakers)) {
      const before = reviewDocument(asDoc(roots));
      const mine = before.filter((f) => f.rule === ruleId);
      expect(mine.length, `${ruleId} did not fire on a document built to break it`).toBeGreaterThan(0);
      const finding = mine[0]!;
      expect(finding.fix, `${ruleId} offers no fix`).toBeDefined();
      const repaired = finding.fix!.apply(roots);
      const after = reviewDocument(asDoc(repaired));
      expect(after.filter((f) => f.id === finding.id), `${ruleId}'s fix left its own finding standing`).toHaveLength(0);

      // Nothing NEW. A repair that trades one complaint for another is a repair nobody
      // trusts — and one that silences its own rule while the document gets worse is worse
      // than that.
      const was = new Set(before.map((f) => `${f.rule}|${f.message}`));
      const fresh = after.filter((f) => !was.has(`${f.rule}|${f.message}`));
      expect(fresh.map((f) => `${f.rule}: ${f.message}`), `${ruleId}'s fix raised a NEW finding`).toEqual([]);
    }
    expect(fixing.size).toBeGreaterThan(6);
  });

  it("a fix is MINIMAL: at most one prop, on at most one node", () => {
    // Written because a sabotage survived the other two fix laws. `size-1-retired`'s first
    // spelling wrote `emphasis: "medium"` alongside the size, which silently promoted a
    // `quiet` line — §15's exception rung, for something deliberately stood down — into
    // "real information said quietly". That is a size finding rewriting what a sentence
    // MEANS, and neither "the finding went" nor "the value is legal" can see it: the value
    // it wrote was a perfectly legal emphasis.
    const propsOf = (roots: BuilderNode[]) => {
      const out = new Map<string, BuilderNode["props"]>();
      const visit = (list: BuilderNode[]) => {
        for (const n of list) {
          out.set(n.id, n.props);
          if (n.children) visit(n.children);
        }
      };
      visit(roots);
      return out;
    };
    const docs: BuilderNode[][] = [
      [node("Text", { size: "1", emphasis: "quiet" }, { text: "Not on your plan" })],
      [node("Heading", { size: "1" }, { text: "Title" })],
      [
        node("Card", { size: "3" }, {
          children: [node("Button", { emphasis: "loud", tone: "destructive" }, { text: "A" }), node("Button", { emphasis: "loud" }, { text: "B" })],
        }),
      ],
      [node("Card", { size: "4" }, { children: [node("Button", { size: "1", tone: "accent" }, { text: "Save" })] })],
      [
        node("Flex", { gap: "3" }, {
          children: [node("Box", { container: true, p: "3" }, { children: [node("Text", {}, { text: "a" })] }), node("Text", {}, { text: "b" })],
        }),
      ],
      [
        node("Stack", { gap: "3", align: "center" }, {
          children: [node("Stack", { gap: "3" }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] })],
        }),
      ],
    ];
    let checked = 0;
    for (const roots of docs) {
      for (const finding of reviewDocument(asDoc(roots))) {
        if (!finding.fix) continue;
        const before = propsOf(roots);
        const after = propsOf(finding.fix.apply(roots));
        const changed: string[] = [];
        for (const [id, props] of after) {
          const was = before.get(id);
          if (!was) continue; // a node the fix created — structural, counted below
          for (const key of new Set([...Object.keys(was), ...Object.keys(props)])) {
            if (JSON.stringify(was[key]) !== JSON.stringify(props[key])) changed.push(`${id}.${key}`);
          }
        }
        checked++;
        expect(changed.length, `${finding.rule} rewrote ${changed.join(", ")} — a repair states one thing`).toBeLessThanOrEqual(1);
      }
    }
    expect(checked, "the walk examined no fix at all").toBeGreaterThan(4);
  });

  it("a row takes the size MOST of it says, not whichever control is first", () => {
    // The reference used to be `sizes[0]`, so a row of two correctly-scaled buttons beside
    // one odd mark was told to demote both. Measured worse: at 2/4/2 the repair produced
    // 2/4/4 and the rule then went silent, which the round-trip law could not see because
    // the finding it was offered for had indeed gone.
    const row = node("Flex", { gap: "3" }, {
      children: [
        node("Button", { size: "1" }, { text: "odd" }),
        node("Button", { size: "3" }, { text: "a" }),
        node("Button", { size: "3" }, { text: "b" }),
      ],
    });
    const found = reviewDocument(asDoc([row])).filter((f) => f.rule === "mixed-control-sizes");
    expect(found).toHaveLength(1);
    expect(found[0]!.message).toContain("size 1 in a row of size 3");
    expect(found[0]!.fix!.title).toBe("Match it to size 3");
  });

  it("every value a fix WRITES is a value the axis holds", () => {
    // The founding premise of this builder is that it cannot state anything the system would
    // refuse, and the reviewer was the one surface that could: `gap: String(Number(inner) + 2)`
    // on a document at gap 11 wrote gap="13" onto a palette that stops at 12, which left the
    // package as unitless raw CSS — the fix that promised to open a gap deleted it.
    const props = (roots: BuilderNode[]) => {
      const out = new Map<string, { type: string; props: BuilderNode["props"] }>();
      const visit = (list: BuilderNode[]) => {
        for (const n of list) {
          out.set(n.id, { type: n.type, props: n.props });
          if (n.children) visit(n.children);
        }
      };
      visit(roots);
      return out;
    };

    // The document that produced the defect: the top of the palette, one step apart.
    const deep = (gap: string) =>
      node("Stack", { gap }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] });
    const docs: BuilderNode[][] = [
      [node("Stack", { gap: "12" }, { children: [deep("11"), deep("11")] })],
      [node("Stack", { gap: "1" }, { children: [deep("1"), deep("1")] })],
      [node("Card", { size: "4" }, { children: [node("Button", { size: "1" }, { text: "Save" })] })],
      [node("Text", { size: "1" }, { text: "small" })],
      [
        node("Flex", { gap: "3" }, {
          children: [node("Box", { container: true }, { children: [node("Text", {}, { text: "a" })] }), node("Text", {}, { text: "b" })],
        }),
      ],
    ];

    let checked = 0;
    for (const roots of docs) {
      for (const finding of reviewDocument(asDoc(roots))) {
        if (!finding.fix) continue;
        const before = props(roots);
        const after = props(finding.fix.apply(roots));
        for (const [id, node2] of after) {
          const was = before.get(id);
          for (const [key, value] of Object.entries(node2.props)) {
            if (was && JSON.stringify(was.props[key]) === JSON.stringify(value)) continue;
            checked++;
            expect(
              legalValue(node2.type, key, value),
              `${finding.rule} wrote ${key}="${String(value)}" onto a ${node2.type}, which the axis does not hold`,
            ).toBe(true);
          }
        }
      }
    }
    expect(checked, "the walk checked no written value at all").toBeGreaterThan(0);
  });

  it("at the top of the palette a fix TIGHTENS instead, and at both ends it offers none", () => {
    const deep = (gap: string) =>
      node("Stack", { gap }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] });
    // ONE tree: a fix closes over the id it was built for, so re-building the document for
    // the apply makes the repair a no-op that reads like a passing test.
    const roots = [node("Stack", { gap: "12" }, { children: [deep("11"), deep("11")] })];
    const top = reviewDocument(asDoc(roots)).find((f) => f.rule === "flat-rhythm")!;
    expect(top.fix!.title).toMatch(/Tighten/);
    expect(reviewDocument(asDoc(top.fix!.apply(roots))).filter((f) => f.id === top.id)).toHaveLength(0);
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

  it("EVERY rule fires on a document the grammar allows — no rule is dead code", () => {
    // The old spelling of this law asserted `typeof rule.run === "function"`, which cannot
    // fail. What it was reaching for is that a rule nobody can trigger is a rule nobody
    // maintains — and the audit found two arms that were exactly that: an AlertDialog
    // exemption for a Button the grammar cannot put there, and a `Tabs` branch whose only
    // job was to return false.
    //
    // Every document below is one the EDITOR can build, checked against the grammar, so a
    // rule that only fires on an impossible tree fails here.
    const pair = (gap: string) =>
      node("Stack", { gap }, { children: [node("Text", {}, { text: "a" }), node("Text", {}, { text: "b" })] });
    const triggers: Record<string, BuilderNode[]> = {
      "one-figure": [
        node("Stack", { gap: "6" }, {
          children: [
            node("Card", { size: "3" }, { children: [node("Button", { emphasis: "loud" }, { text: "A" })] }),
            node("Card", { size: "3" }, { children: [node("Button", { emphasis: "loud" }, { text: "B" })] }),
          ],
        }),
      ],
      "size-1-retired": [node("Text", { size: "1" }, { text: "small" })],
      "accessible-name": [node("Checkbox", {})],
      "empty-container": [node("Stack", { gap: "3" }, { children: [] })],
      "empty-compound": [node("RadioGroup", { defaultValue: "a", "aria-label": "Pick" }, { children: [] })],
      "single-child-layout": [node("Stack", {}, { children: [node("Text", {}, { text: "one" })] })],
      "flat-rhythm": [node("Stack", { gap: "3" }, { children: [pair("3")] })],
      "heading-space": [
        node("Stack", { gap: "5" }, {
          children: [
            node("Text", { size: "2" }, { text: "Above" }),
            node("Heading", { size: "6" }, { text: "Title" }),
            node("Text", { size: "2" }, { text: "Below" }),
          ],
        }),
      ],
      "mixed-control-sizes": [
        node("Flex", { gap: "3" }, {
          children: [
            node("Button", { size: "2" }, { text: "a" }),
            node("Button", { size: "2" }, { text: "b" }),
            node("Button", { size: "4" }, { text: "c" }),
          ],
        }),
      ],
      "control-scale": [node("Card", { size: "4" }, { children: [node("Button", { size: "1" }, { text: "Save" })] })],
      "tone-as-decoration": [
        node("Card", { size: "3" }, {
          children: [
            node("Text", { tone: "blue" }, { text: "a" }),
            node("Text", { tone: "green" }, { text: "b" }),
            node("Text", { tone: "orange" }, { text: "c" }),
            node("Text", { tone: "destructive" }, { text: "d" }),
          ],
        }),
      ],
      "heading-ladder": [node("Heading", { size: "2" }, { text: "Title" })],
      eyebrow: [
        node("Stack", { gap: "2" }, {
          children: [
            node("Text", { size: "2" }, { text: "PREFERENCES" }),
            node("Heading", { size: "6" }, { text: "Notifications" }),
          ],
        }),
      ],
      "filler-text": [CATALOG.Button!.make()],
      "zero-width-container": [
        node("Flex", { gap: "3" }, {
          children: [node("Box", { container: true }, { children: [node("Text", {}, { text: "a" })] }), node("Text", {}, { text: "b" })],
        }),
      ],
      "orphan-part": [node("SegmentedItem", { value: "x" }, { text: "Stray" })],
    };

    for (const rule of RULES) {
      const roots = triggers[rule.id];
      expect(roots, `${rule.id} has no document that triggers it`).toBeDefined();
      expect(
        reviewDocument(asDoc(roots!)).filter((f) => f.rule === rule.id).length,
        `${rule.id} did not fire on the document written to trigger it`,
      ).toBeGreaterThan(0);
      // …and the tree really is one the editor could have built. `orphan-part` is the one
      // exemption, and it is the rule's whole subject: its `why` says the grammar prevents
      // this at the drop and a document edited elsewhere can still arrive holding one, so a
      // trigger the grammar ACCEPTS would mean the rule was checking the wrong thing.
      if (rule.id === "orphan-part") continue;
      const legal = (list: BuilderNode[], parentType: string | null, chain: string[]): boolean =>
        list.every(
          (n) =>
            canContainForTest(parentType, n.type, chain) &&
            legal(n.children ?? [], n.type, [...chain, n.type]),
        );
      expect(legal(roots!, null, []), `${rule.id}'s trigger is a tree the grammar refuses`).toBe(true);
    }
    // And no rule in the table is missing from the walk.
    expect(Object.keys(triggers).sort()).toEqual(RULES.map((r) => r.id).sort());
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

  it("the STARTER document holds to it too — it is the first thing anyone sees", () => {
    // Templates are chosen; the starter arrives. If the screen the builder opens on breaks
    // the brief, the panel's first act is to disagree with the editor that drew it.
    const findings = reviewDocument(starterDoc());
    expect(findings.map((f) => `${f.rule}: ${f.message}`)).toEqual([]);
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
