"use client";

/**
 * The inspector generates itself (2026-08-19). Nobody hand-builds a property panel here:
 * every control below is a renderer over the catalog's prop schemas, which in turn derive
 * from `componentAxes` — so the panel is the closed unions given a pointer, and a widened
 * axis widens the panel with no edit in this file.
 *
 * The "Not here" section is the part no other builder can render: the refusals come from
 * the component reference's own entries, so the gap where a knob would be carries the
 * system's argument for why there is no knob.
 *
 * ── THE PANEL'S STRUCTURE (2026-09-02, Kushagra, with Figma's own inspector open beside
 *    ours: "we dont have a system yet, lets try and make a structure and system out of it")
 *
 * It had none, and that is a fair reading of what was there: three different shapes for the
 * one thing a property panel does. A picker was a `space-between` row, a string was a label
 * stacked over a full-width field, a boolean was a third arrangement — so no two controls
 * began at the same x, and nothing in the column said where one group of knobs ended and the
 * next began. The headings were the same size and weight as the labels under them, and a
 * hairline appeared above two sections out of five.
 *
 * Three parts, and every row in this file is one of them:
 *
 *   PANEL   — the COLUMNS, declared once for the whole panel: `auto minmax(0, 1fr)`. This is
 *             the part that makes it read as a panel, and the part the first two passes got
 *             wrong. A grid per row aligns a row with itself; a grid per section lets every
 *             section disagree with the next; one grid for the panel is the only arrangement
 *             where "the label column" is a thing that exists. Measured: every control in
 *             every section now starts at one x and ends at one x.
 *             No number in it — the content sizes the names' column, and a stated width
 *             would be a raw length in a system that has none for this.
 *
 *   SECTION — a heading, a hairline above it running wall to wall, and rows underneath. Also
 *             a fragment, for the same reason: the panel owns the columns.
 *             The hairline is the panel's own seam, so it bleeds (`mx="bleed"`) exactly as
 *             the pane's chrome row does; a section boundary that stops short of the walls
 *             reads as a line drawn inside the panel rather than as a division of it.
 *
 *   ROW     — a name and its value, as TWO CELLS of that grid. The ONLY row shape there is,
 *             which is the third pass's whole change (2026-09-02, Kushagra with Figma open:
 *             "every row is standard, every label standard"). A fragment, never a wrapper: a
 *             box around the pair would make it one grid item and put the halves back inside
 *             their own box, the same mistake one level down. Its three rules are stated on
 *             the component — the label is a STRING by type, the value cell divides evenly
 *             among what is in it, and a control that cannot fill sits on the column's far
 *             line rather than its near one.
 *
 * There is no FIELD any more. A string used to stack its name above a full-width input, on
 * the argument that a sentence does not fit a column — true of a paragraph, and not of what
 * is typed here: a button's label, a placeholder, a heading. What it actually bought was a
 * second label position, which is exactly what stops a panel reading as one thing.
 *
 * The header is outside all of it: the node's name, its reference link and its blurb, over
 * the first hairline. Figma's says less because Figma is not teaching anybody; the blurb
 * earns its place here for the same reason the refusals do.
 *
 * ONE RANK PER STEP, which is what stops a structure from flattening back out. Four ranks, one
 * type step apart each, and every piece of text in the panel is one of them:
 *
 *   the panel's title    size 4, medium weight, full ink
 *   a section heading    size 3, medium weight, full ink
 *   a name               size 2, regular weight, the muted ink
 *   a sentence           size 1, regular weight, the quiet ink
 *
 * Rank was carried by weight and ink alone before this — a heading and a name were both size
 * 2 — and a difference you have to look for is not a rank.
 */

import * as React from "react";

import {
  Box,
  Button,
  Flex,
  Grid,
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
  Switch,
  Text,
  TextField,
  componentAxes,
  themeAxes,
} from "@kookie-ui/react";

import { PlusIcon, XIcon } from "../icons";
import { InlineCode } from "../inline-code";
import { ENTRIES } from "../(docs)/components/registry";

/** The reference page for a component, when the docs have one — the inspector's header links
    to it, which is the shortest path from "what is this knob" to the system's own argument. */
const SLUGS = new Map(ENTRIES.map((e) => [e.name, e.slug]));

import { CATALOG, SLOT_ACCEPTS, sharedProps, slotsFor, type PropSchema } from "./catalog";
import { TIER_KEYS, slottedChild, type BuilderNode, type DocTheme, type PropValue, type ResponsiveValue } from "./model";

const REFUSALS = new Map(ENTRIES.map((e) => [e.name, e.refusals]));

/** The sentinel a Select needs for "the component's own default" — a real value, mapped
    back to deleting the prop, because an axis picker cannot hold an absence. */
export const UNSET = "·unset·";

/** The second sentinel, and it is NOT a value: several nodes are selected and they disagree.
    Choosing it is meaningless — there is nothing to set them all to — so it is offered as
    the current reading and refuses to be picked. */
export const MIXED = "·mixed·";

/**
 * The rows a closed picker offers, IN ORDER (2026-08-20).
 *
 * Not a `Record`: an object with keys "1".."4" puts the integer-like keys first whatever the
 * insertion order, so the sentinels — which read the current state and belong at the top —
 * sorted to the bottom of every numeric axis. Measured, then fixed here rather than in the
 * markup, so the ordering is a fact with a law rather than a line of JSX.
 */
export const pickOrder = (
  values: readonly string[],
  opts: { mixed?: boolean; optional?: boolean; labels?: Record<string, string> } = {},
): [string, string][] => {
  const out: [string, string][] = [];
  if (opts.mixed) out.push([MIXED, "Mixed"]);
  if (opts.optional) out.push([UNSET, "(unset)"]);
  for (const v of values) out.push([v, opts.labels?.[v] ?? v]);
  return out;
};

/**
 * What a closed picker may REPORT — from its own list, or nothing (2026-08-20).
 *
 * This is not defensive noise. Picking a value resolves a mixed reading, which takes the
 * Mixed row out of the list underneath the live control, and Base UI answers a value that
 * has left its items by emitting a reset: measured as the string `"null"` written onto every
 * selected node one frame after the real pick landed. A closed vocabulary has to be closed at
 * the edge that READS it too, not only at the edge that offers it.
 *
 * `null` means "not a value" — ignore it. `{ value: undefined }` means the explicit unset.
 */
export const readPick = (
  raw: string,
  values: readonly string[],
  optional: boolean,
): { value: string | undefined } | null => {
  if (raw === MIXED) return null;
  if (raw === UNSET) return optional ? { value: undefined } : null;
  return values.includes(raw) ? { value: raw } : null;
};

/* ── The one shape (see the contract in the file header) ─────────────────────────────────── */

/**
 * A name and its value — TWO CELLS OF THE PANEL'S GRID, and the only row shape there is.
 *
 * THE THIRD PASS (2026-09-02, Kushagra with Figma open: "every row is standard, every label
 * standard"). The second pass built the column and left the panel ragged inside it: half the
 * value cells held a control that filled the column and half held a small object — a Switch, a
 * bordered Button, a line of code — sitting at the column's start with dead space behind it, so
 * the right-hand line existed for some rows and not others. And there were still two label
 * treatments (beside for a pick, above for a string) and a third for the readout, whose label
 * was a composed node with a quieter half inside it.
 *
 * So: one shape, and three rules that make it standard.
 *
 *   THE LABEL IS A STRING, enforced by the type. Not a node — a node is how a second label
 *   treatment gets in. Anything a row wants to say beyond its name belongs on the value side
 *   or in the note under it.
 *
 *   THE VALUE CELL DIVIDES EVENLY AMONG WHAT IS IN IT. One control fills the column; two split
 *   it in half (the multi-selection's On/Off pair). That is `grid-auto-flow: column` with
 *   `grid-auto-columns: 1fr` — the caller states nothing, so no call site can decide to be
 *   ragged. A composed value is passed as ONE element and lays itself out inside its cell.
 *
 *   A STATE SITS AT THE COLUMN'S END, not its start (`end`). A Switch cannot fill anything —
 *   its width is the mark family's, not the column's — so filling is not available to it and
 *   the only two places it can be are the two lines the panel already has. At the end it lands
 *   on the same right-hand line every filled control ends on; at the start it would be the one
 *   row in the panel that ends nowhere.
 *
 * A fragment, because a wrapper element around the pair would make it ONE grid item and put
 * the two halves back inside their own box — the same mistake one level down.
 */
export function Row({
  label,
  children,
  after,
  end,
  indent,
  note,
}: {
  label: string;
  children: React.ReactNode;
  /** A small control seated OUTSIDE the value's cell, keeping its own width — the responsive
      row's + menu, the slot's clear button. Outside, because it is not part of the value and
      dividing the column with it would make the value narrower than the row above. */
  after?: React.ReactNode;
  /** This row's control cannot fill a column, so it sits on the column's far line. */
  end?: boolean;
  /** A responsive override's tier row, one step in from the base it overrides. */
  indent?: boolean;
  /** A sentence under the row, in the quiet ink — the schema's own note, or a warning. It
      spans both columns: it is about the row, not about the value. */
  note?: React.ReactNode;
}) {
  return (
    <>
      <Box {...(indent ? { pl: "3" } : {})}>
        <Text size="2" emphasis="medium">
          {label}
        </Text>
      </Box>
      <Flex gap="2" align="center" style={{ minInlineSize: 0 }}>
        <Grid
          gap="2"
          style={{
            gridAutoFlow: "column",
            gridAutoColumns: "1fr",
            justifyItems: end ? "end" : "stretch",
            flex: 1,
            minInlineSize: 0,
          }}
        >
          {children}
        </Grid>
        {after}
      </Flex>
      {note ? (
        <Span>
          <Text size="1" emphasis="quiet">
            {note}
          </Text>
        </Span>
      ) : null}
    </>
  );
}

/** Anything that is about the whole panel rather than about one value: a heading, a hairline,
    a sentence, a field. One spelling, so a spanning cell cannot be spelled two ways. */
export function Span({ children, ...rest }: { children: React.ReactNode } & { my?: string; mb?: string; mx?: string }) {
  return (
    <Box gridArea="auto / 1 / auto / -1" {...(rest as object)}>
      {children}
    </Box>
  );
}

/**
 * A named group of rows — A FRAGMENT, because the PANEL owns the columns and not the section.
 *
 * The second pass put one grid per section, which lines a section up with itself and leaves
 * every section free to disagree with the next: Properties' names took one width, Slots' took
 * another, the readout's a third, and the panel had three left edges instead of one. One grid
 * for the whole panel is the only arrangement where "the label column" is a thing that exists.
 * So a section contributes spanning cells — its hairline, its heading, its closing sentence —
 * and its rows contribute pairs, all into the caller's grid.
 *
 * The first section states `first` and draws no hairline: the header above it already divides.
 */
export function Section({
  title,
  first,
  note,
  children,
}: {
  title: string;
  first?: boolean;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      {first ? null : (
        <Span mx="bleed" my="3">
          <Separator />
        </Span>
      )}
      {/* ONE STEP UP FROM ITS ROWS (2026-09-02). It was `size="2" weight="medium"` against
          names at `size="2" emphasis="medium"` — the same step, separated only by ink and
          weight, which at one size is a difference you have to look for. The ladder is the
          panel's title, its section headings, its names and its sentences, and each rank is
          one step of the type scale from the next. */}
      <Span>
        <Text size="3" weight="medium">
          {title}
        </Text>
      </Span>
      {children}
      {note ? (
        <Span>
          <Text size="1" emphasis="quiet">
            {note}
          </Text>
        </Span>
      ) : null}
    </>
  );
}

/**
 * THE PANEL'S COLUMNS, declared once (2026-09-02).
 *
 * `auto minmax(0, 1fr)`: the names take exactly the width the longest one in the WHOLE panel
 * needs and the values take the rest, so every control in every section starts and ends on the
 * same two lines. `minmax(0, …)` rather than `1fr` because a Select's trigger has a min-content
 * width that would otherwise push the value column past the panel and scroll it sideways.
 *
 * No number anywhere: the content sizes the column. A stated width would be a raw length in a
 * system that has none for this, and it would be wrong for the next component's prop names.
 */
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Grid columns="auto minmax(0, 1fr)" gapX="4" gapY="3" align="center">
      {children}
    </Grid>
  );
}

function PickRow({
  label,
  value,
  values,
  labels,
  optional,
  mixed,
  onPick,
  after,
  indent,
  note,
}: {
  label: string;
  value: string | undefined;
  values: readonly string[];
  labels?: Record<string, string>;
  optional: boolean;
  /** The selection disagrees about this prop. */
  mixed?: boolean;
  onPick: (next: string | undefined) => void;
  /** A small control seated beside the picker — the responsive row's + menu. */
  after?: React.ReactNode;
  /** A responsive override's tier row. */
  indent?: boolean;
  /** A sentence under the row, in the quiet ink. Carried here rather than stacked by the
      caller so a row and what it warns about are one thing, at one indent. */
  note?: React.ReactNode;
}) {
  /* `items` still goes to the Select for its label lookup; the options render from `order`,
     because the Record cannot hold one (see `pickOrder`). */
  const order = pickOrder(values, { ...(mixed ? { mixed } : {}), optional, ...(labels ? { labels } : {}) });
  const items: Record<string, string> = Object.fromEntries(order);
  return (
    <Row
      label={label}
      {...(after ? { after } : {})}
      {...(indent ? { indent } : {})}
      {...(note ? { note } : {})}
    >
      {/* No width stated here any more: the value cell fills the column, and it does it for
          every row rather than for the rows whose author remembered. */}
      <Select
        items={items}
        value={mixed ? MIXED : (value ?? UNSET)}
        onValueChange={(v) => {
          // `null` is Base UI's own value-RESET, not a pick — see Select's `onValueChange`.
          if (v === null) return;
          const picked = readPick(v, values, optional);
          if (picked) onPick(picked.value);
        }}
      >
        <SelectTrigger />
        <SelectContent>
          {order.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  );
}

function PropControl({
  name,
  schema,
  value,
  onChange,
}: {
  name: string;
  schema: PropSchema;
  value: PropValue | undefined;
  /** `continuous` marks a value being TYPED — a run of keystrokes that is one gesture and
      belongs in one undo entry. A pick from a closed list is not continuous: choosing size 2
      and then size 3 is two decisions, and each should be its own step back. */
  onChange: (next: PropValue | undefined, continuous?: boolean) => void;
}) {
  if (schema.kind === "axis" || schema.kind === "options") {
    const values = schema.kind === "axis" ? componentAxes[schema.axis] : schema.values;
    const labels = schema.kind === "options" ? schema.labels : undefined;
    if (schema.responsive) {
      return (
        <ResponsiveControl
          name={name}
          values={values}
          {...(labels ? { labels } : {})}
          optional={schema.optional ?? false}
          value={value}
          onChange={onChange}
        />
      );
    }
    return (
      <PickRow
        label={name}
        value={typeof value === "string" ? value : undefined}
        values={values}
        {...(labels ? { labels } : {})}
        optional={schema.optional ?? false}
        onPick={onChange}
      />
    );
  }
  if (schema.kind === "boolean") {
    return (
      /* `end` — a Switch's width is the mark family's, so there is no filling for it to do
         and the column's far line is the only line it can land on. */
      <Row label={name} end>
        <Switch
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked ? true : undefined)}
          aria-label={name}
        />
      </Row>
    );
  }
  if (schema.kind === "number") {
    return (
      <Row label={name}>
        <TextField
          type="number"
          aria-label={name}
          value={value === undefined ? "" : String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? undefined : Number(raw), true);
          }}
        />
      </Row>
    );
  }
  /* A string is a row like every other row (2026-09-02). It used to take the full width with
     its name stacked above it, on the argument that a sentence does not fit a column — which
     is true of a paragraph and not of what is actually typed here: a button's label, a
     placeholder, a heading. The panel's column is ~200px, a field scrolls its own value, and
     a second label position costs the panel its one standard row. */
  return (
    <Row label={name}>
      <TextField
        aria-label={name}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value, true)}
      />
    </Row>
  );
}

/**
 * A responsive prop: the base (`initial`) picker, one indented picker per stated override
 * tier, and quiet + chips for the tiers not yet stated. Adding a tier copies the current
 * base so the override is visible immediately; unsetting a tier removes it; when no
 * overrides remain the value collapses back to a plain string. Each tier's picker is the
 * SAME closed list — responsiveness multiplies where a token applies, never what a value
 * may be.
 */
function ResponsiveControl({
  name,
  values,
  labels,
  optional,
  value,
  onChange,
}: {
  name: string;
  values: readonly string[];
  labels?: Record<string, string>;
  optional: boolean;
  value: PropValue | undefined;
  onChange: (next: PropValue | undefined) => void;
}) {
  const resp: ResponsiveValue = typeof value === "object" && value !== null ? value : {};
  const base = typeof value === "string" ? value : resp.initial;
  const overrideTiers = TIER_KEYS.filter((t) => t !== "initial");
  const stated = overrideTiers.filter((t) => resp[t] !== undefined);
  const unstated = overrideTiers.filter((t) => resp[t] === undefined);

  const write = (nextBase: string | undefined, overrides: ResponsiveValue) => {
    const tiers = Object.keys(overrides).filter((t) => t !== "initial");
    if (tiers.length === 0) return onChange(nextBase);
    const next: ResponsiveValue = {};
    if (nextBase !== undefined) next.initial = nextBase;
    for (const t of overrideTiers) if (overrides[t] !== undefined) next[t] = overrides[t];
    onChange(next);
  };

  /* A FRAGMENT, not a Stack (2026-09-02). A Row contributes two CELLS, so wrapping its rows
     in a flex column made each pair one grid item stacked inside column 1 — the base picker
     and every tier rendered with its name above it, half the panel wide, while every other
     row in the section sat in the column. The tiers are rows of the panel's grid like any
     other; what marks them as overrides is the label's one step of indent. */
  return (
    <>
      <PickRow
        label={name}
        value={base}
        values={values}
        {...(labels ? { labels } : {})}
        optional={optional}
        onPick={(v) => write(v, resp)}
        /* ALWAYS RENDERED, DISABLED WHEN THERE IS NOTHING LEFT TO ADD (2026-09-02). A
           trailing control that comes and goes takes the value's right edge with it, so a
           row with every tier stated would reach a line no other row in the section reaches.
           Disabled is honest — it is the same thing Arrange does with a command that is not
           armed — where absent would be the panel changing shape under you. */
        after={
          <Menu>
            <MenuTrigger
              render={
                <Button
                  emphasis="quiet"
                  iconOnly
                  disabled={unstated.length === 0}
                  aria-label={`Add a breakpoint to ${name}`}
                >
                  <PlusIcon />
                </Button>
              }
            />
            <MenuContent>
              {unstated.map((tier) => (
                <MenuItem key={tier} onClick={() => write(base, { ...resp, [tier]: base ?? values[0]! })}>
                  {`at ${tier}`}
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>
        }
      />
      {stated.map((tier) => (
        <PickRow
          key={tier}
          label={`@ ${tier}`}
          indent
          value={resp[tier]}
          values={values}
          {...(labels ? { labels } : {})}
          optional
          onPick={(v) => {
            const next = { ...resp };
            if (v === undefined) delete next[tier];
            else next[tier] = v;
            write(base, next);
          }}
          /* The tier's own trailing control — it keeps this row's right edge on the same
             line as the base row it overrides, and it is the gesture the panel was missing:
             taking a breakpoint back was only reachable by picking "(unset)" in its list. */
          after={
            <Button
              emphasis="quiet"
              iconOnly
              aria-label={`Remove the ${tier} breakpoint from ${name}`}
              onClick={() => {
                const next = { ...resp };
                delete next[tier];
                write(base, next);
              }}
            >
              <XIcon />
            </Button>
          }
        />
      ))}
    </>
  );
}

/* ── The multi-selection inspector ─────────────────────────────────────────────────────── */

/** Do these nodes agree about this prop? Canonical, because a responsive value is an object
    and two objects that say the same thing are not `===`. */
const sameValue = (a: PropValue | undefined, b: PropValue | undefined): boolean =>
  a === b || JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Several things selected, one knob (2026-08-20).
 *
 * This is the gesture the closed unions pay for. "Make these five the same size" is a guess
 * in a system where size is a number and a measurement in a system where it is a length; here
 * it is a pick from a list every selected node already answers, so one gesture can write all
 * of them and nothing can land somewhere it is refused. `sharedProps` decides what is offered
 * — same name AND structurally the same schema, so a knob that means two things is never one
 * knob.
 *
 * Only the CLOSED vocabularies are here: axes, designed literal lists and booleans. Free text
 * and numbers stay per-node on purpose — writing one label onto five buttons is never what
 * the gesture meant, and the panel would be offering a destruction dressed as an edit.
 */
export function MultiInspector({
  nodes,
  onProp,
  children,
}: {
  nodes: BuilderNode[];
  /** Writes to every selected node, as ONE undoable edit. */
  onProp: (key: string, next: PropValue | undefined) => void;
  /** The app's own sections — see `Inspector`'s note: a pane has one grid. */
  children?: React.ReactNode;
}) {
  const types = [...new Set(nodes.map((n) => n.type))];
  const shared = sharedProps(types);
  /** Only the CLOSED vocabularies are offered — see the note at the foot of the panel. */
  type Closed = Extract<PropSchema, { kind: "axis" } | { kind: "options" } | { kind: "boolean" }>;
  const offered = Object.entries(shared).filter(
    (e): e is [string, Closed] => e[1].kind === "axis" || e[1].kind === "options" || e[1].kind === "boolean",
  );
  /** Does any selected node state this prop per tier? Then a plain pick REPLACES that, and
      the panel says so rather than quietly flattening it. */
  const anyResponsive = (name: string) => nodes.some((n) => typeof n.props[name] === "object" && n.props[name] !== null);

  return (
    <Panel>
      <Span>
        <Stack gap="1">
          <Text size="4" weight="medium">
            {nodes.length} selected
          </Text>
          <Text size="2" emphasis="medium">
            {types.length === 1 ? `${types.length && types[0]}, all of them` : types.join(", ")}
          </Text>
        </Stack>
      </Span>

      <Section
        title="Shared properties"
        note="Text and numbers stay one at a time — writing one label onto several nodes is a deletion wearing an edit's clothes."
      >
        {offered.length === 0 ? (
          <Span>
            <Text size="1" emphasis="quiet">
              {types.length === 1
                ? "Nothing these share is a closed choice — this one is all identity."
                : "These types share no knob that means the same thing on all of them. Select fewer kinds, or edit them one at a time."}
            </Text>
          </Span>
        ) : (
          offered.map(([name, schema]) => {
            const first = nodes[0]!.props[name];
            const agreed = nodes.every((n) => sameValue(n.props[name], first));
            if (schema.kind === "boolean") {
              return (
                <Row key={name} label={name}>
                  {/* Two buttons rather than a switch: a switch has no way to say "these
                      disagree", and one drawn OFF over a mixed set would be a lie. */}
                  <Button
                    emphasis={agreed && first === true ? "medium" : "quiet"}
                    bordered
                    onClick={() => onProp(name, true)}
                  >
                    On
                  </Button>
                  <Button
                    emphasis={agreed && first !== true ? "medium" : "quiet"}
                    bordered
                    onClick={() => onProp(name, undefined)}
                  >
                    Off
                  </Button>
                </Row>
              );
            }
            const values = schema.kind === "axis" ? componentAxes[schema.axis] : schema.values;
            const labels = schema.kind === "options" ? schema.labels : undefined;
            /* A responsive value is an object, and reading only the string arm made an
               AGREED per-tier value render as "(unset)" — the panel denying a value both
               nodes state. The base is what a plain picker can show; the note below says what
               picking here does to the tiers.

               It shows the BASE, so a value with tiers but no base still reads "(unset)" —
               reachable by stating a tier and then clearing the base. That is deliberate
               rather than fixed: a picker showing `md`'s value under a label that means the
               base would be a truer-looking lie than an honest blank, and the per-tier editor
               one row down is where that value belongs. */
            const plain =
              typeof first === "string"
                ? first
                : first && typeof first === "object"
                  ? (first as Record<string, string>).initial
                  : undefined;
            return (
              <PickRow
                key={name}
                label={name}
                value={agreed ? plain : undefined}
                values={values}
                {...(labels ? { labels } : {})}
                optional={schema.optional ?? false}
                mixed={!agreed}
                onPick={(next) => onProp(name, next)}
                {...(anyResponsive(name)
                  ? { note: `One of these states ${name} per tier. Picking here replaces that.` }
                  : {})}
              />
            );
          })
        )}
      </Section>

      {children}
    </Panel>
  );
}

export function Inspector({
  node,
  onProp,
  onText,
  onSlot,
  onSelect,
  textRef,
  measured,
  children,
}: {
  node: BuilderNode;
  onProp: (key: string, next: PropValue | undefined, continuous?: boolean) => void;
  onText: (next: string) => void;
  /** Seat a component in a named slot, or clear it (§4's adornments). */
  onSlot: (slot: "leading" | "trailing", type: string | null) => void;
  onSelect: (id: string) => void;
  /** The editor's ⏎ focuses the content field — the fastest path from "selected" to
      "typing", and the reason canvas text needs no inline editor of its own. */
  textRef?: React.RefObject<HTMLInputElement | null>;
  /** What this node's stated indices actually come to, measured off the rendered element.
      The app owns the measurement; this panel only renders it. */
  measured?: { label: string; value: string; stated?: string | undefined }[];
  /** Sections the APP owns rather than the schema — Arrange, Save as block. They come in
      here rather than sitting in a panel of their own below, because a pane has ONE grid:
      two panels stacked are two label columns and two rhythms, and the `Stack` holding them
      apart was a third distance beside the seam's own. */
  children?: React.ReactNode;
}) {
  const entry = CATALOG[node.type];
  if (!entry) return null;
  const refusals = REFUSALS.get(node.type);
  const propNames = Object.keys(entry.props);
  return (
    <Panel>
      {/* The header spans both columns — it is about the panel, not about one value. What this
          is, where to read about it, and what it is for. Its title is the ladder's top step:
          one above a section heading, two above a name. */}
      <Span>
      <Stack gap="1">
        <Flex align="center" justify="space-between" gap="2">
          <Text size="4" weight="medium">
            {node.type}
          </Text>
          {SLUGS.has(node.type) ? (
            <Button
              emphasis="quiet"
              render={<a href={"/components/" + SLUGS.get(node.type)} target="_blank" rel="noreferrer" />}
            >
              Reference
            </Button>
          ) : null}
        </Flex>
        <Text size="2" emphasis="medium">
          {entry.blurb}
        </Text>
      </Stack>
      </Span>

      {entry.children === "text" ? (
        <Section title="Content">
          <Row label="text">
            <TextField
              aria-label="Text content"
              {...(textRef ? { ref: textRef } : {})}
              value={node.text ?? ""}
              onChange={(e) => onText(e.target.value)}
            />
          </Row>
        </Section>
      ) : null}

      <Section
        title="Properties"
        {...(propNames.length ? {} : { note: "Nothing to configure — this one is all identity." })}
      >
        {propNames.map((name) => (
          <PropControl
            key={name}
            name={name}
            schema={entry.props[name]!}
            value={node.props[name]}
            onChange={(next, continuous) => onProp(name, next, continuous)}
          />
        ))}
      </Section>

      {slotsFor(node.type).length ? (
        <Section
          title="Slots"
          note="Icons go in by hand — the package ships none, so a written one would not resolve."
        >
          {slotsFor(node.type).map((slot) => {
            const seated = slottedChild(node, slot);
            return (
              <Row
                key={slot}
                label={slot}
                {...(seated
                  ? {
                      /* The clear button sits OUTSIDE the value's cell: it is not half the
                         value, and splitting the column with it would leave this row's
                         picker narrower than every picker above it. */
                      after: (
                        <Button
                          emphasis="quiet"
                          iconOnly
                          aria-label={`Clear the ${slot} slot`}
                          onClick={() => onSlot(slot, null)}
                        >
                          <XIcon />
                        </Button>
                      ),
                    }
                  : {})}
              >
                {seated ? (
                  /* A button's label centres, which is right for a button standing on its
                     own and wrong for one standing in the value column: it would be the one
                     value in the panel that does not begin on the column's left line. */
                  <Button emphasis="quiet" bordered style={{ justifyContent: "flex-start" }} onClick={() => onSelect(seated.id)}>
                    {seated.type}
                  </Button>
                ) : (
                  <Menu>
                    <MenuTrigger
                      render={
                        <Button emphasis="quiet" bordered style={{ justifyContent: "flex-start" }}>
                          Empty
                        </Button>
                      }
                    />
                    <MenuContent>
                      {SLOT_ACCEPTS.map((type) => (
                        <MenuItem key={type} onClick={() => onSlot(slot, type)}>
                          {type}
                        </MenuItem>
                      ))}
                    </MenuContent>
                  </Menu>
                )}
              </Row>
            );
          })}
        </Section>
      ) : null}

      {measured && measured.length > 1 ? (
        <Section
          title="What that comes to"
          note="Measured off this element, so density, the pointer world and the canvas width are all already in it."
        >
          {/* THE LABEL IS THE NAME AND NOTHING ELSE (2026-09-02). It used to be a composed
              node — the name plus the stated index in a quieter ink inside it — which is a
              second label treatment, and the one place the panel's names were not all one
              thing. What was stated moves to the value's side, where it belongs anyway: the
              row reads "you said 4, that comes to 16px". */}
          {measured.map((row) => (
            <Row key={row.label} label={row.label}>
              <Flex gap="1" align="baseline" style={{ minInlineSize: 0 }}>
                {row.stated ? (
                  <Text size="2" emphasis="quiet">
                    {`${row.stated} →`}
                  </Text>
                ) : null}
                <Text size="2" render={<code />}>
                  {row.value}
                </Text>
              </Flex>
            </Row>
          ))}
        </Section>
      ) : null}

      {refusals?.length ? (
        <Section title="Not here, on purpose">
          <Span>
            <Stack gap="4">
              {refusals.map((r) => (
                <Refusal key={r.name} name={r.name} why={r.why} />
              ))}
            </Stack>
          </Span>
        </Section>
      ) : null}

      {children}
    </Panel>
  );
}

/**
 * A refusal is a SENTENCE, so it is text (2026-08-22, Kushagra: a title that long in a button
 * is "a big no no", and he is right — the system said so first).
 *
 * It was a disclosure whose trigger was a Button carrying the whole refusal as its label. The
 * strings are the component reference's own, written to be read as prose — Card's longest is
 * "a `selected` prop, and an `interactive` one" — and `.kui-control` sets `white-space: nowrap`
 * on purpose: a control's label is one line, which is a rule about what a control IS. So the
 * label could not wrap, its min-content measured 334px against the inspector's 303px viewport,
 * and because the scroller's content box is `min-width: fit-content` that single unshrinkable
 * child pushed the WHOLE panel sideways. The horizontal scrollbar was the visible end of a
 * sentence being asked to be a button label; the geometry was downstream of the category error.
 *
 * Now it renders exactly as the same data renders on its own reference page — name, then
 * argument, both `Text`, both free to wrap — so one entry reads one way wherever it appears.
 * The disclosure went with it: it was buying compactness in a panel that scrolls vertically
 * anyway, and it is what forced the sentence into a control in the first place.
 */
function Refusal({ name, why }: { name: string; why: string }) {
  return (
    <Stack gap="1">
      {/* A LABEL, not a heading (2026-09-02). It carried `weight="medium"` at full ink, which
          is the section heading's own identity — so "emphasis and tone" competed with "Not
          here, on purpose" one line above it and the section stopped reading as one thing.
          Exactly one thing in a section is the heading; see the contract in the header. */}
      <Text size="2" emphasis="medium">
        <InlineCode text={name} />
      </Text>
      <Text size="1" emphasis="quiet">
        <InlineCode text={why} />
      </Text>
    </Stack>
  );
}

/** The document's one Theme identity. Values derive from `themeAxes`; `appearance` and
    `contrast` stay the docs store's, exactly as /preview divides them. */
export function ThemePanel({
  theme,
  onAxis,
}: {
  theme: DocTheme;
  onAxis: (axis: keyof DocTheme, value: string) => void;
}) {
  const axes = Object.keys(theme) as (keyof DocTheme)[];
  return (
    <Panel>
    <Section
      title="Document"
      first
      note="One identity for the whole document — every axis re-prices tokens, no call site answers twice."
    >
      {axes.map((axis) => (
        <PickRow
          key={axis}
          label={axis}
          value={theme[axis]}
          values={themeAxes[axis]}
          optional={false}
          onPick={(v) => v !== undefined && onAxis(axis, v)}
        />
      ))}
    </Section>
    </Panel>
  );
}
