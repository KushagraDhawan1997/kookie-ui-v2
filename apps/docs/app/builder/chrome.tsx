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
}: {
  roots: BuilderNode[];
  selection: string[];
  onSelect: (id: string) => void;
  extra?: React.ReactNode;
}) {
  const primary = selection[selection.length - 1] ?? null;
  const node = primary ? findNode(roots, primary) : null;
  const chain = primary ? [...ancestorChain(roots, primary), ...(node ? [node] : [])] : [];

  return (
    <Flex align="center" justify="space-between" gapX="3" px="4" py="1">
      <Flex align="center" gap="1" wrap="wrap" style={{ minWidth: 0 }}>
        {chain.length === 0 ? (
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
}: {
  point: { x: number; y: number } | null;
  onOpenChange: (open: boolean) => void;
  run: (id: string) => void;
  enabled: (id: string) => boolean;
  titleOf: (id: string) => string;
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
