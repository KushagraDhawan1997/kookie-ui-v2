"use client";

/**
 * The editor's own chrome (2026-08-20): the document bar, the jump bar, the shortcut sheet
 * and the toast. Every one of them is @kookie-ui/react — a builder for the system that is
 * not built from the system argues against itself, and the argument does not get weaker for
 * the parts that are "just editor UI".
 */

import * as React from "react";

import {
  Box,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Grid,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Stack,
  Text,
  TextField,
} from "@kookie-ui/react";

import { COMMANDS, chordLabel, type CommandGroup } from "./commands";
import { ancestorChain, findNode, type BuilderNode } from "./model";
import { TEMPLATES } from "./templates";
import { activeDoc, type Action, type EditorState } from "./store";

/* ── The document bar ─────────────────────────────────────────────────────────────────── */

export function DocumentBar({
  state,
  dispatch,
}: {
  state: EditorState;
  dispatch: (a: Action) => void;
}) {
  const doc = activeDoc(state);
  const [renaming, setRenaming] = React.useState(false);
  const [draft, setDraft] = React.useState(doc.name);

  const items = Object.fromEntries(state.docs.map((d) => [d.id, d.name]));

  return (
    <Flex align="center" gap="1" style={{ minWidth: 0 }}>
      <Select
        size="1"
        items={items}
        value={doc.id}
        onValueChange={(id) => dispatch({ type: "docSwitch", id })}
      >
        <SelectTrigger />
        <SelectContent>
          {state.docs.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Menu size="1">
        <MenuTrigger
          render={
            <Button size="1" emphasis="quiet" aria-label="Document actions">
              ⋯
            </Button>
          }
        />
        <MenuContent>
          <MenuItem onClick={() => dispatch({ type: "docNew" })}>New document</MenuItem>
          <MenuItem
            onClick={() => {
              setDraft(doc.name);
              setRenaming(true);
            }}
          >
            Rename…
          </MenuItem>
          <MenuItem onClick={() => dispatch({ type: "docDuplicate", id: doc.id })}>Duplicate</MenuItem>
          <MenuItem
            tone="destructive"
            disabled={state.docs.length <= 1}
            onClick={() => dispatch({ type: "docDelete", id: doc.id })}
          >
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>

      <Dialog size="2" open={renaming} onOpenChange={setRenaming}>
        <DialogContent>
          <Stack gap="5">
            <Stack gap="2">
              <DialogTitle>Rename document</DialogTitle>
              <DialogDescription>The name shows in the document switcher and in the exported file.</DialogDescription>
            </Stack>
            <TextField
              value={draft}
              aria-label="Document name"
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || !draft.trim()) return;
                dispatch({ type: "docRename", id: doc.id, name: draft.trim() });
                setRenaming(false);
              }}
            />
            <Flex gap="3" justify="flex-end">
              <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
              <Button
                emphasis="loud"
                disabled={!draft.trim()}
                onClick={() => {
                  dispatch({ type: "docRename", id: doc.id, name: draft.trim() });
                  setRenaming(false);
                }}
              >
                Rename
              </Button>
            </Flex>
          </Stack>
        </DialogContent>
      </Dialog>
    </Flex>
  );
}

/* ── The jump bar ─────────────────────────────────────────────────────────────────────── */

/**
 * Xcode's jump bar, in this system's vocabulary: the ancestor path of what is selected,
 * clickable all the way up. It exists because a canvas click lands on the DEEPEST thing
 * under the pointer, and the thing you usually want next is its parent — the path is how
 * you get there without hunting in the tree.
 */
export function Breadcrumb({
  roots,
  selection,
  onSelect,
  extra,
  hidePath,
}: {
  roots: BuilderNode[];
  selection: string[];
  onSelect: (id: string) => void;
  extra?: React.ReactNode;
  /** Preview keeps the VIEWING controls in this bar and drops the selection path: a path is
      an editing affordance, and "Nothing selected" over a screen you are trying out is the
      editor talking about itself. */
  hidePath?: boolean;
}) {
  const primary = selection[selection.length - 1] ?? null;
  const node = primary ? findNode(roots, primary) : null;
  const chain = primary ? [...ancestorChain(roots, primary), ...(node ? [node] : [])] : [];

  return (
    <Flex align="center" justify="space-between" gapX="3" px="4" py="1">
      <Flex align="center" gap="1" wrap="wrap" style={{ minWidth: 0 }}>
        {hidePath ? null : chain.length === 0 ? (
          <Text size="1" emphasis="quiet">
            Nothing selected
          </Text>
        ) : (
          chain.map((n, i) => (
            <React.Fragment key={n.id}>
              {i > 0 ? (
                <Text size="1" emphasis="quiet" aria-hidden>
                  ›
                </Text>
              ) : null}
              <Button
                size="1"
                emphasis="quiet"
                aria-current={n.id === primary ? "true" : undefined}
                onClick={() => onSelect(n.id)}
              >
                {n.type}
              </Button>
            </React.Fragment>
          ))
        )}
        {selection.length > 1 ? (
          <Text size="1" emphasis="medium">
            +{selection.length - 1} more
          </Text>
        ) : null}
      </Flex>
      {extra}
    </Flex>
  );
}

/* ── The shortcut sheet ───────────────────────────────────────────────────────────────── */

const GROUP_ORDER: CommandGroup[] = ["Edit", "Arrange", "Select", "Document", "View"];

export function ShortcutSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog size="4" open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Stack gap="6">
          <Stack gap="2">
            <DialogTitle>Keyboard</DialogTitle>
            <DialogDescription>
              Every shortcut runs the same command the palette and the context menus run.
            </DialogDescription>
          </Stack>
          <Grid columns="repeat(2, minmax(0, 1fr))" gap="6">
            {GROUP_ORDER.map((group) => {
              const rows = COMMANDS.filter((c) => c.group === group && c.chord);
              if (rows.length === 0) return null;
              return (
                <Stack key={group} gap="3">
                  <Text size="2" weight="medium">
                    {group}
                  </Text>
                  <Stack gap="2">
                    {rows.map((c) => (
                      <Flex key={c.id} align="center" justify="space-between" gap="4">
                        <Text size="2" emphasis="medium">
                          {c.title}
                        </Text>
                        <Kbd>{chordLabel(c.chord!)}</Kbd>
                      </Flex>
                    ))}
                  </Stack>
                </Stack>
              );
            })}
          </Grid>
          <Separator />
          <Flex align="center" justify="space-between" gap="4">
            <Text size="2" emphasis="medium">
              Drag anything on the canvas to move it; hold ⇧ while clicking to select several.
            </Text>
            <DialogClose render={<Button emphasis="medium">Done</Button>} />
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

/* ── The context menu ─────────────────────────────────────────────────────────────────── */

/** The commands a right-click offers, in the order a hand reaches for them. */
export const CONTEXT_COMMANDS = [
  "duplicate",
  "copy",
  "cut",
  "paste",
  "·",
  "wrapInStack",
  "wrapInFlex",
  "wrapInCard",
  "unwrap",
  "·",
  "moveUp",
  "moveDown",
  "outdent",
  "indent",
  "·",
  "saveBlock",
  "delete",
] as const;

/**
 * A menu anchored to a POINT rather than to a control. Base UI positions against its
 * trigger's element, so the trigger here is a one-pixel span parked where the pointer was —
 * the standard virtual-anchor shape, and the reason a right-click can open the system's own
 * Menu rather than something hand-drawn for the occasion.
 */
export function ContextMenu({
  point,
  onOpenChange,
  run,
  enabled,
  titleOf,
  inserts,
  onInsert,
}: {
  point: { x: number; y: number } | null;
  onOpenChange: (open: boolean) => void;
  run: (id: string) => void;
  enabled: (id: string) => boolean;
  titleOf: (id: string) => string;
  /** What may be inserted AT the right-clicked node — grammar-filtered by the caller, so the
      menu on a Card and the menu on a MenuContent offer different things and neither offers
      something the tree would refuse. */
  inserts: string[];
  onInsert: (type: string) => void;
}) {
  if (!point) return null;
  return (
    <Menu size="1" open onOpenChange={onOpenChange}>
      <MenuTrigger
        render={
          <span
            aria-hidden
            style={{ position: "fixed", left: point.x, top: point.y, width: 1, height: 1, pointerEvents: "none" }}
          />
        }
      />
      <MenuContent>
        {inserts.length > 0 ? (
          <>
            <MenuSub>
              <MenuSubTrigger>Insert here</MenuSubTrigger>
              <MenuSubContent>
                {inserts.map((type) => (
                  <MenuItem key={type} onClick={() => onInsert(type)}>
                    {type}
                  </MenuItem>
                ))}
              </MenuSubContent>
            </MenuSub>
            <Separator />
          </>
        ) : null}
        {CONTEXT_COMMANDS.map((id, i) =>
          id === "·" ? (
            <Separator key={`sep${i}`} />
          ) : (
            <MenuItem
              key={id}
              disabled={!enabled(id)}
              {...(id === "delete" ? { tone: "destructive" as const } : {})}
              onClick={() => run(id)}
            >
              {titleOf(id)}
            </MenuItem>
          ),
        )}
      </MenuContent>
    </Menu>
  );
}

/* ── The canvas boundary ──────────────────────────────────────────────────────────────── */

/**
 * The canvas renders REAL components, so a document can reach a state one of them throws on —
 * a part orphaned by a paste, a value a primitive refuses. Without a boundary that takes the
 * whole editor down and the document with it, which is the one failure an editor must not
 * have: the work is still in memory and still undoable, and the only thing between the author
 * and it would be a blank page. Measured: an orphaned MenuItem, SelectItem or TabsPanel each
 * throw out of Base UI, and each is now caught with the rest of the editor still working.
 *
 * A class component because that is still the only way to catch a render error in React.
 */
export class CanvasBoundary extends React.Component<
  {
    children: React.ReactNode;
    onRecover: () => void;
    canRecover: boolean;
    /** The tree being drawn — identity, not content. See `componentDidUpdate`. */
    tree: unknown;
  },
  { error: Error | null }
> {
  override state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidUpdate(prev: { tree: unknown }) {
    // ANY new tree gets a clean slate — not just a new document. Keying this on the document
    // id was a dead end: the other route out of a broken canvas is to delete the offending
    // node in Layers (which draws from the model, so it keeps working), and that leaves the
    // id unchanged. The boundary would have held its failure over a tree that no longer
    // contains it, with nothing left to press. The model's writes preserve identity where
    // nothing changed, so this does not fire on an unrelated edit.
    if (prev.tree !== this.props.tree && this.state.error) this.setState({ error: null });
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <Card size="3">
        <Stack gap="4" align="flex-start">
          <Stack gap="2">
            <Text size="3" weight="medium">
              This document could not be drawn
            </Text>
            <Text size="2" emphasis="medium">
              {this.props.canRecover
                ? "Your work is safe — it is still in memory and still undoable. Step back to the last state that rendered."
                : "Your work is safe — the whole tree is still in Layers, which draws from the document rather than from the components. Select the offending node there and delete it."}
            </Text>
          </Stack>
          <Text size="1" emphasis="quiet" render={<pre />} style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </Text>
          {this.props.canRecover ? (
            <Button
              emphasis="loud"
              onClick={() => {
                this.setState({ error: null });
                this.props.onRecover();
              }}
            >
              Undo the last change
            </Button>
          ) : null}
        </Stack>
      </Card>
    );
  }
}

/* ── The empty state ──────────────────────────────────────────────────────────────────── */

/**
 * An empty document opens on the templates rather than on nothing. Two reasons: an empty
 * state should invite an action (§15's own rule for them), and these screens are the house
 * style demonstrated — a law holds every one of them to zero review findings, so starting
 * from one starts you inside the brief rather than beside it.
 */
export function TemplatePicker({ onPick }: { onPick: (id: string) => void }) {
  return (
    <Stack gap="6">
      <Stack gap="2">
        <Text size="6" weight="semibold" render={<h2 />}>
          Start with a screen
        </Text>
        <Text size="2" emphasis="medium">
          Every one holds to the house style — the review panel has nothing to say about them.
        </Text>
      </Stack>
      <Grid columns="repeat(2, minmax(0, 1fr))" gap="4">
        {TEMPLATES.filter((t) => t.id !== "blank").map((t) => (
          <Card key={t.id} size="3" render={<button type="button" onClick={() => onPick(t.id)} />}>
            <Stack gap="2" align="flex-start">
              <Text size="3" weight="medium">
                {t.name}
              </Text>
              <Text size="2" emphasis="medium" style={{ textAlign: "start" }}>
                {t.blurb}
              </Text>
            </Stack>
          </Card>
        ))}
      </Grid>
      <Text size="2" emphasis="quiet">
        Or press {chordLabel("mod+k")} and add a component.
      </Text>
    </Stack>
  );
}

/** A quiet, self-clearing message — the editor's way of confirming something happened
    without a dialog interrupting the work. */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Box
      style={{
        position: "fixed",
        insetInlineStart: "50%",
        insetBlockEnd: "var(--layout-space-6)",
        transform: "translateX(-50%)",
        zIndex: 50,
      }}
    >
      <Box
        p="3"
        style={{
          background: "var(--color-surface)",
          border: "var(--border-width) solid var(--color-border)",
          borderRadius: "var(--radius-surface-2)",
          boxShadow: "var(--shadow-3)",
        }}
      >
        <Text size="2" aria-live="polite">
          {message}
        </Text>
      </Box>
    </Box>
  );
}
