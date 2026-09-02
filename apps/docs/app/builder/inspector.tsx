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
 *   SECTION — a heading, a hairline above it running wall to wall, and rows underneath.
 *             The hairline is the panel's own seam, so it bleeds (`mx="bleed"`) exactly as
 *             the pane's chrome row does; a section boundary that stops short of the walls
 *             reads as a line drawn inside the panel rather than as a division of it.
 *
 *   ROW     — a name on the left, its control on the right, in TWO EQUAL COLUMNS. The equal
 *             split is what makes the panel read as a panel: every control begins at one x
 *             and ends at one x, at every row, whatever kind of control it is. It is also
 *             the only spelling here with no number in it — a stated column width would be a
 *             raw length in a system that has none for this.
 *
 *   FIELD   — a name above its control, which takes the full width. For a value you TYPE.
 *             The rule for choosing is the value, not the widget: a pick from a closed list
 *             or a toggle is a WORD and fits a column; a placeholder, a label or a line of
 *             body copy is a SENTENCE and does not. Two shapes, one rule, stated here so a
 *             third never gets invented at a call site.
 *
 * The header is outside all three: the node's name, its reference link and its blurb, over
 * the first hairline. Figma's says less because Figma is not teaching anybody; the blurb
 * earns its place here for the same reason the refusals do.
 *
 * ONE VOICE PER RANK, which is what stops a structure from flattening back out: inside a
 * section exactly one thing is `weight="medium"` at full ink and it is the HEADING. A name is
 * `emphasis="medium"` — the muted ink, no weight — and a sentence is `emphasis="quiet"` at
 * size 1. Three ranks, and every piece of text in the panel is one of them.
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

/* ── The three shapes (see the contract in the file header) ──────────────────────────────── */

/** A name and its control, in two equal columns. Every control in the panel begins at one x
    because they all sit in the same half. `minmax(0, 1fr)` twice rather than `1fr 1fr`: a
    Select's trigger has a min-content width and would push its column wider than its half. */
export function Row({
  label,
  children,
  note,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  /** A sentence under the row, in the quiet ink — the schema's own note, or a warning. */
  note?: React.ReactNode;
}) {
  return (
    <Stack gap="1">
      <Grid columns="minmax(0, 1fr) minmax(0, 1fr)" gapX="3" align="center">
        {typeof label === "string" ? (
          <Text size="2" emphasis="medium">
            {label}
          </Text>
        ) : (
          label
        )}
        <Flex gap="1" align="center" style={{ minWidth: 0 }}>
          {children}
        </Flex>
      </Grid>
      {note ? (
        <Text size="1" emphasis="quiet">
          {note}
        </Text>
      ) : null}
    </Stack>
  );
}

/** A name over its control, full width — for a value you TYPE. The rule is the value and not
    the widget: a word fits a column, a sentence does not. */
function Field({
  label,
  children,
  note,
}: {
  label: string;
  children: React.ReactNode;
  note?: React.ReactNode;
}) {
  return (
    <Stack gap="1">
      <Text size="2" emphasis="medium">
        {label}
      </Text>
      {children}
      {note ? (
        <Text size="1" emphasis="quiet">
          {note}
        </Text>
      ) : null}
    </Stack>
  );
}

/** A named group of rows, under a hairline that runs to the pane's walls. The first section
    states `first` and draws none — the header above it is already a division. */
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
    <Stack gap="3">
      {first ? null : (
        <Box mx="bleed">
          <Separator />
        </Box>
      )}
      <Stack gap="2">
        <Text size="2" weight="medium">
          {title}
        </Text>
        <Stack gap="2">{children}</Stack>
        {note ? (
          <Text size="1" emphasis="quiet">
            {note}
          </Text>
        ) : null}
      </Stack>
    </Stack>
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
  /** A sentence under the row, in the quiet ink. Carried here rather than stacked by the
      caller so a row and what it warns about are one thing, at one indent. */
  note?: React.ReactNode;
}) {
  /* `items` still goes to the Select for its label lookup; the options render from `order`,
     because the Record cannot hold one (see `pickOrder`). */
  const order = pickOrder(values, { ...(mixed ? { mixed } : {}), optional, ...(labels ? { labels } : {}) });
  const items: Record<string, string> = Object.fromEntries(order);
  return (
    <Row label={label} {...(note ? { note } : {})}>
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
        {after}
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
      <Row label={name}>
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
          style={{ inlineSize: "100%" }}
        />
      </Row>
    );
  }
  /* A string is a SENTENCE — a placeholder, a label, a line of copy — so it takes the full
     width. The contract's one rule for choosing between the two shapes. */
  return (
    <Field label={name}>
      <TextField
        aria-label={name}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value, true)}
      />
    </Field>
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

  return (
    <Stack gap="1">
      <PickRow
        label={name}
        value={base}
        values={values}
        {...(labels ? { labels } : {})}
        optional={optional}
        onPick={(v) => write(v, resp)}
        after={
          unstated.length ? (
            <Menu>
              <MenuTrigger
                render={
                  <Button emphasis="quiet" iconOnly aria-label={`Add a breakpoint to ${name}`}>
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
          ) : undefined
        }
      />
      {stated.map((tier) => (
        <Box key={tier} pl="4">
          <PickRow
            label={`@ ${tier}`}
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
          />
        </Box>
      ))}
    </Stack>
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
}: {
  nodes: BuilderNode[];
  /** Writes to every selected node, as ONE undoable edit. */
  onProp: (key: string, next: PropValue | undefined) => void;
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
    <Stack gap="4">
      <Stack gap="1">
        <Text size="2" weight="medium">
          {nodes.length} selected
        </Text>
        <Text size="2" emphasis="medium">
          {types.length === 1 ? `${types.length && types[0]}, all of them` : types.join(", ")}
        </Text>
      </Stack>

      <Section
        title="Shared properties"
        note="Text and numbers stay one at a time — writing one label onto several nodes is a deletion wearing an edit's clothes."
      >
        {offered.length === 0 ? (
          <Text size="1" emphasis="quiet">
            {types.length === 1
              ? "Nothing these share is a closed choice — this one is all identity."
              : "These types share no knob that means the same thing on all of them. Select fewer kinds, or edit them one at a time."}
          </Text>
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
    </Stack>
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
}) {
  const entry = CATALOG[node.type];
  if (!entry) return null;
  const refusals = REFUSALS.get(node.type);
  const propNames = Object.keys(entry.props);
  return (
    <Stack gap="4">
      {/* The header, outside the three shapes: what this is, where to read about it, and what
          it is for. Over the first hairline, which the first Section draws. */}
      <Stack gap="1">
        <Flex align="center" justify="space-between" gap="2">
          <Text size="2" weight="medium">
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

      {entry.children === "text" ? (
        <Section title="Content">
          <Field label="text">
            <TextField
              aria-label="Text content"
              {...(textRef ? { ref: textRef } : {})}
              value={node.text ?? ""}
              onChange={(e) => onText(e.target.value)}
            />
          </Field>
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
              <Row key={slot} label={slot}>
                {seated ? (
                  <>
                    <Button emphasis="quiet" bordered onClick={() => onSelect(seated.id)}>
                      {seated.type}
                    </Button>
                    <Button emphasis="quiet" iconOnly aria-label={`Clear the ${slot} slot`} onClick={() => onSlot(slot, null)}>
                      <XIcon />
                    </Button>
                  </>
                ) : (
                  <Menu>
                    <MenuTrigger
                      render={
                        <Button emphasis="quiet" bordered>
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
          {measured.map((row) => (
            <Row
              key={row.label}
              label={
                <Text size="2" emphasis="medium">
                  {row.label}
                  {row.stated ? (
                    <Text size="2" emphasis="quiet">
                      {` ${row.stated}`}
                    </Text>
                  ) : null}
                </Text>
              }
            >
              <Text size="2" render={<code />}>
                {row.value}
              </Text>
            </Row>
          ))}
        </Section>
      ) : null}

      {refusals?.length ? (
        <Section title="Not here, on purpose">
          <Stack gap="4">
            {refusals.map((r) => (
              <Refusal key={r.name} name={r.name} why={r.why} />
            ))}
          </Stack>
        </Section>
      ) : null}
    </Stack>
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
  );
}
