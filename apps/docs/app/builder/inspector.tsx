"use client";

/**
 * The inspector generates itself (2026-08-19). Nobody hand-builds a property panel here:
 * every control below is a renderer over the catalog's prop schemas, which in turn derive
 * from `componentAxes` — so the panel is the closed unions given a pointer, and a widened
 * axis widens the panel with no edit in this file.
 *
 * The refusals are not shown here (2026-09-15, Kushagra): someone building a screen does not
 * need the system's argument for a missing knob. They live on the component reference.
 *
 * ── THE PANEL'S STRUCTURE (2026-09-02, Kushagra, with Figma's own inspector open beside
 *    ours: "we dont have a system yet, lets try and make a structure and system out of it")
 *
 * The 2026-09-02 passes gave it one: a single two-column grid, a name beside every value,
 * and one type step per rank. The 2026-09-15 iteration took Figma's anatomy instead — a
 * caption ABOVE each control, two value columns and an action column — and the structure
 * block beside `Panel` below is the contract now. What survived from the first cut is the
 * rule under both: the columns are declared ONCE for the whole panel, every row is a subgrid
 * of them, and every caption is written the same way.
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
  Switch,
  Text,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  componentAxes,
  themeAxes,
} from "@kushagradhawan/kookie-ui-react";

import { PlusIcon, XIcon } from "../icons";
import { ENTRIES } from "../(docs)/components/registry";

/** The reference page for a component, when the docs have one — the inspector's header links
    to it, which is the shortest path from "what is this knob" to the system's own argument. */
const SLUGS = new Map(ENTRIES.map((e) => [e.name, e.slug]));
export const referenceHref = (type: string) => (SLUGS.has(type) ? "/components/" + SLUGS.get(type) : null);

import { CATALOG, SLOT_ACCEPTS, sharedProps, slotsFor, type PropSchema } from "./catalog";
import { TIER_KEYS, slottedChild, type BuilderNode, type DocTheme, type PropValue, type ResponsiveValue } from "./model";


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
  if (opts.optional) out.push([UNSET, "Unset"]);
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

/* ── The structure (2026-09-15 iteration, Figma's anatomy) ──────────────────────────────────
 *
 *   PANEL   — three columns for the whole panel: two equal value columns and one ACTION column
 *             reserved everywhere, one control wide.
 *   SECTION — a hairline, a title spanning the value columns, its actions in the action column.
 *   ROW     — a subgrid spanning all three columns: an optional caption over the value columns
 *             (it names the row's controls as a group), cells, and actions in the last column.
 *   CELL    — one control spanning one or two value columns, with an optional caption above it.
 */

const ACTION_COLUMN = "var(--control-height-2)";

export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Grid columns={`minmax(0, 1fr) minmax(0, 1fr) ${ACTION_COLUMN}`} gapX="3" gapY="4" align="end">
      {children}
    </Grid>
  );
}

/** Anything about the whole panel rather than one value. Spans all three columns. */
export function Span({ children, ...rest }: { children: React.ReactNode } & { my?: string; mb?: string; mx?: string }) {
  return (
    <Box gridArea="auto / 1 / auto / -1" {...(rest as object)}>
      {children}
    </Box>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <Text size="1" emphasis="medium" style={{ minInlineSize: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {children}
    </Text>
  );
}

const subgrid: React.CSSProperties = {
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  rowGap: "var(--layout-space-2)",
  alignItems: "end",
  minInlineSize: 0,
};

export function Section({
  title,
  first,
  note,
  actions,
  lead,
  children,
}: {
  title: string;
  /** The panel's own title, one rank above a section's. */
  lead?: boolean;
  first?: boolean;
  note?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <>
      {first ? null : (
        <Span my="2">
          <Separator />
        </Span>
      )}
      <div style={{ ...subgrid, alignItems: "center" }}>
        <Box gridArea={actions ? "auto / 1 / auto / 2" : "auto / 1 / auto / 3"} style={{ minInlineSize: 0 }}>
          <Text size={lead ? "3" : "2"} weight="medium">
            {title}
          </Text>
        </Box>
        {actions ? (
          <Flex justify="end" gap="1" style={{ gridColumn: "2 / -1" }}>
            {actions}
          </Flex>
        ) : null}
      </div>
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

export function Row({
  label,
  actions,
  note,
  children,
}: {
  /** Names the row's controls as one group. A row takes this OR captions on its cells. */
  label?: string;
  actions?: React.ReactNode;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div role={label ? "group" : undefined} aria-label={label} style={subgrid}>
      {label ? (
        <Box gridArea="auto / 1 / auto / 3">
          <Caption>{humanize(label)}</Caption>
        </Box>
      ) : null}
      {children}
      {actions ? (
        <Flex justify="end" style={{ gridColumn: "3" }}>
          {actions}
        </Flex>
      ) : null}
      {note ? (
        <Box gridArea="auto / 1 / auto / -1">
          <Text size="1" emphasis="quiet">
            {note}
          </Text>
        </Box>
      ) : null}
    </div>
  );
}

export function Cell({ label, span = 1, children }: { label?: string; span?: 1 | 2; children: React.ReactNode }) {
  return (
    <Stack gap="2" style={{ gridColumn: `span ${span}`, minInlineSize: 0 }}>
      {label ? <Caption>{humanize(label)}</Caption> : null}
      {children}
    </Stack>
  );
}

/** Pairs consecutive compact cells two to a row; a wide one takes a row of its own. */
function pack<T>(items: T[], wide: (item: T) => boolean): T[][] {
  const rows: T[][] = [];
  let pending: T | null = null;
  for (const item of items) {
    if (wide(item)) {
      if (pending !== null) rows.push([pending]);
      pending = null;
      rows.push([item]);
    } else if (pending === null) {
      pending = item;
    } else {
      rows.push([pending, item]);
      pending = null;
    }
  }
  if (pending !== null) rows.push([pending]);
  return rows;
}

function Pick({
  label,
  value,
  values,
  labels,
  optional,
  mixed,
  onPick,
}: {
  label: string;
  value: string | undefined;
  values: readonly string[];
  labels?: Record<string, string> | undefined;
  optional: boolean;
  mixed?: boolean;
  onPick: (next: string | undefined) => void;
}) {
  const order = pickOrder(values, { ...(mixed ? { mixed } : {}), optional, labels: humanLabels(values, labels) });
  const items: Record<string, string> = Object.fromEntries(order);
  return (
    <Select
      items={items}
      value={mixed ? MIXED : (value ?? UNSET)}
      onValueChange={(v) => {
        if (v === null) return;
        const picked = readPick(v, values, optional);
        if (picked) onPick(picked.value);
      }}
    >
      <SelectTrigger aria-label={label} />
      <SelectContent>
        {order.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** An icon-only action, named by a tooltip. `render` swaps the element (a link). */
export function IconAction({
  label,
  onClick,
  disabled,
  tone,
  render,
  segment,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "destructive";
  render?: React.ReactElement<{ className?: string; style?: React.CSSProperties }>;
  /** A segment in a group: a filled rung, sharing the cell's width with its siblings. */
  segment?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            emphasis={segment ? "medium" : "quiet"}
            {...(segment ? { style: { flex: "1 1 0", minInlineSize: 0, aspectRatio: "auto", inlineSize: "auto" } } : {})}
            iconOnly
            aria-label={label}
            disabled={disabled ?? false}
            {...(tone ? { tone } : {})}
            {...(render ? { render } : {})}
            {...(onClick ? { onClick } : {})}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Sentence case for anything the panel shows: `flexGrow` → "Flex grow", `space-between` →
    "Space between". The written value is untouched; only what is read changes. */
const SPELLED: Record<string, string> = {
  p: "Padding",
  px: "Padding x",
  py: "Padding y",
  m: "Margin",
  mx: "Margin x",
  my: "Margin y",
  src: "Image URL",
  alt: "Alt text",
  href: "Link",
  "aria-label": "Accessible name",
};

/** Text that runs long — a URL, a sentence — takes the whole row; short text (initials, a
    label) pairs like any other value. */
const LONG_TEXT: readonly string[] = ["src", "href", "alt", "placeholder", "aria-label", "meta", "value", "defaultValue"];
export function humanize(raw: string): string {
  if (SPELLED[raw]) return SPELLED[raw];
  const words = raw
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const humanLabels = (values: readonly string[], given?: Record<string, string>) =>
  Object.fromEntries(values.map((v) => [v, humanize((given?.[v] ?? v).replace(/^(flex|space)-/, ""))]));

/**
 * Which section a prop belongs to — Figma's split: where the thing sits, what it holds, how it
 * lays out its children, how it looks, and what state it is in. Anything unlisted is content.
 */
const GROUPS: { title: string; props: readonly string[] }[] = [
  { title: "Position", props: ["flexGrow", "gridArea", "m", "mx", "my"] },
  { title: "Content", props: [] },
  { title: "Layout", props: ["direction", "orientation", "gap", "align", "justify", "wrap", "columns", "p", "px", "py", "container"] },
  { title: "Appearance", props: ["size", "tone", "emphasis", "weight", "bordered", "radius", "material", "depth", "density", "pointer", "backdrop"] },
  { title: "State", props: ["disabled", "loading", "defaultChecked", "defaultPressed", "current", "state", "progress", "multiple"] },
];
const groupOf = (name: string) => GROUPS.find((g) => g.props.includes(name))?.title ?? "Content";

type Closed = Extract<PropSchema, { kind: "axis" } | { kind: "options" }>;
const isPick = (s: PropSchema): s is Closed => s.kind === "axis" || s.kind === "options";
const pickValues = (s: Closed) => (s.kind === "axis" ? componentAxes[s.axis] : s.values);
const pickLabels = (s: Closed) => (s.kind === "options" ? s.labels : undefined);

const tiersOf = (value: PropValue | undefined): ResponsiveValue =>
  typeof value === "object" && value !== null ? value : {};
const baseOf = (value: PropValue | undefined) => (typeof value === "string" ? value : tiersOf(value).initial);
const OVERRIDE_TIERS = TIER_KEYS.filter((t) => t !== "initial");

function writeResponsive(base: string | undefined, overrides: ResponsiveValue): PropValue | undefined {
  const stated = OVERRIDE_TIERS.filter((t) => overrides[t] !== undefined);
  if (stated.length === 0) return base;
  const next: ResponsiveValue = {};
  if (base !== undefined) next.initial = base;
  for (const t of stated) next[t] = overrides[t]!;
  return next;
}

/** One prop's rows. Compact props come back as a single cell for the caller to pair. */
function propRows(
  name: string,
  schema: PropSchema,
  value: PropValue | undefined,
  onChange: (next: PropValue | undefined, continuous?: boolean) => void,
): { compact: React.ReactElement } | { rows: React.ReactElement[] } {
  if (isPick(schema)) {
    const values = pickValues(schema);
    const labels = pickLabels(schema);
    const optional = schema.optional ?? false;
    const resp = tiersOf(value);
    const base = baseOf(value);
    const stated = schema.responsive ? OVERRIDE_TIERS.filter((t) => resp[t] !== undefined) : [];
    const cell = (
      <Cell key={name} label={name}>
        <Pick
          label={name}
          value={base}
          values={values}
          labels={labels}
          optional={optional}
          onPick={(v) => onChange(schema.responsive ? writeResponsive(v, resp) : v)}
        />
      </Cell>
    );
    if (stated.length === 0) return { compact: cell };
    return {
      rows: [
        <Row key={name}>{React.cloneElement(cell, { span: 2 })}</Row>,
        ...stated.map((tier) => (
          <Row
            key={`${name}@${tier}`}
            actions={
              <IconAction
                label={`Remove the ${tier} breakpoint from ${name}`}
                onClick={() => {
                  const next = { ...resp };
                  delete next[tier];
                  onChange(writeResponsive(base, next));
                }}
              >
                <XIcon />
              </IconAction>
            }
          >
            <Cell label={`${name} at ${tier}`} span={2}>
              <Pick
                label={`${name} at ${tier}`}
                value={resp[tier]}
                values={values}
                labels={labels}
                optional
                onPick={(v) => {
                  const next = { ...resp };
                  if (v === undefined) delete next[tier];
                  else next[tier] = v;
                  onChange(writeResponsive(base, next));
                }}
              />
            </Cell>
          </Row>
        )),
      ],
    };
  }
  if (schema.kind === "boolean") {
    return {
      compact: (
        <Cell key={name} label={name}>
          <Flex align="center" style={{ blockSize: "var(--control-height-2)" }}>
            <Switch
              checked={value === true}
              onCheckedChange={(checked) => onChange(checked ? true : undefined)}
              aria-label={name}
            />
          </Flex>
        </Cell>
      ),
    };
  }
  if (schema.kind === "number") {
    return {
      compact: (
        <Cell key={name} label={name}>
          <TextField
            type="number"
            aria-label={name}
            value={value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value), true)}
          />
        </Cell>
      ),
    };
  }
  const long = LONG_TEXT.includes(name);
  const field = (
    <Cell key={name} label={name} span={long ? 2 : 1}>
      <TextField
        aria-label={name}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value, true)}
      />
    </Cell>
  );
  return long ? { rows: [<Row key={name}>{field}</Row>] } : { compact: field };
}

/** Lays compact cells two to a row and wide rows whole, in schema order. */
function layout(parts: ({ compact: React.ReactElement } | { rows: React.ReactElement[] })[]) {
  const packed = pack(parts, (p) => "rows" in p);
  return packed.flatMap((group, i) => {
    if (group.length === 1 && "rows" in group[0]!) return group[0].rows;
    return [<Row key={`pair-${i}`}>{group.map((p) => ("compact" in p ? p.compact : null))}</Row>];
  });
}

/** The section's + : one menu for every breakpoint any responsive prop could still take. */
function BreakpointMenu({
  props,
  onAdd,
}: {
  props: { name: string; unstated: string[] }[];
  onAdd: (name: string, tier: string) => void;
}) {
  const open = props.filter((p) => p.unstated.length > 0);
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button emphasis="quiet" iconOnly disabled={open.length === 0} aria-label="Add a breakpoint">
            <PlusIcon />
          </Button>
        }
      />
      <MenuContent>
        {open.map((p) => (
          <MenuSub key={p.name}>
            <MenuSubTrigger>{humanize(p.name)}</MenuSubTrigger>
            <MenuSubContent>
              {p.unstated.map((tier) => (
                <MenuItem key={tier} onClick={() => onAdd(p.name, tier)}>
                  {`At ${tier}`}
                </MenuItem>
              ))}
            </MenuSubContent>
          </MenuSub>
        ))}
      </MenuContent>
    </Menu>
  );
}

/* ── The multi-selection inspector ─────────────────────────────────────────────────────── */

const sameValue = (a: PropValue | undefined, b: PropValue | undefined): boolean =>
  a === b || JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export function MultiInspector({
  nodes,
  onProp,
  children,
}: {
  actions?: React.ReactNode;
  nodes: BuilderNode[];
  onProp: (key: string, next: PropValue | undefined) => void;
  children?: React.ReactNode;
}) {
  const types = [...new Set(nodes.map((n) => n.type))];
  const shared = sharedProps(types);
  type Offered = Extract<PropSchema, { kind: "axis" } | { kind: "options" } | { kind: "boolean" }>;
  const offered = Object.entries(shared).filter(
    (e): e is [string, Offered] => e[1].kind === "axis" || e[1].kind === "options" || e[1].kind === "boolean",
  );
  const anyResponsive = (name: string) => nodes.some((n) => typeof n.props[name] === "object" && n.props[name] !== null);

  const parts = offered.map(([name, schema]) => {
    const first = nodes[0]!.props[name];
    const agreed = nodes.every((n) => sameValue(n.props[name], first));
    if (schema.kind === "boolean") {
      return {
        rows: [
          <Row key={name} label={name}>
            <Cell>
              <Button emphasis={agreed && first === true ? "medium" : "quiet"} bordered onClick={() => onProp(name, true)}>
                On
              </Button>
            </Cell>
            <Cell>
              <Button emphasis={agreed && first !== true ? "medium" : "quiet"} bordered onClick={() => onProp(name, undefined)}>
                Off
              </Button>
            </Cell>
          </Row>,
        ],
      };
    }
    const cell = (
      <Cell key={name} label={name}>
        <Pick
          label={name}
          value={agreed ? baseOf(first) : undefined}
          values={pickValues(schema)}
          labels={pickLabels(schema)}
          optional={schema.optional ?? false}
          mixed={!agreed}
          onPick={(next) => onProp(name, next)}
        />
      </Cell>
    );
    if (!anyResponsive(name)) return { compact: cell };
    return {
      rows: [
        <Row key={name} note={`One of these states ${name} per tier. Picking here replaces that.`}>
          {React.cloneElement(cell, { span: 2 })}
        </Row>,
      ],
    };
  });

  return (
    <Panel>
      <Span>
        <Text size="2" emphasis="medium">
          {types.length === 1 ? `${types[0]}, all of them` : types.join(", ")}
        </Text>
      </Span>

      <Section
        title="Shared properties"
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
          layout(parts)
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
  textRef,
  measured,
  arrange,
  children,
}: {
  /** Commands on the node itself (duplicate, delete), beside its name. */
  actions?: React.ReactNode;
  /** Rows that move the node in its tree — they open the Position section. */
  arrange?: React.ReactNode;
  node: BuilderNode;
  onProp: (key: string, next: PropValue | undefined, continuous?: boolean) => void;
  onText: (next: string) => void;
  onSlot: (slot: "leading" | "trailing", type: string | null) => void;
  onSelect: (id: string) => void;
  textRef?: React.RefObject<HTMLInputElement | null>;
  measured?: { label: string; value: string; stated?: string | undefined }[];
  children?: React.ReactNode;
}) {
  const entry = CATALOG[node.type];
  if (!entry) return null;
  const propNames = Object.keys(entry.props);

  /** One section's props: booleans after the pickers so pairs stay pairs, and a + for the
      breakpoints only when something in THIS section can take one. */
  const propSection = (title: string, lead?: React.ReactNode) => {
    const names = propNames
      .filter((n) => groupOf(n) === title)
      .sort((a, b) => Number(entry.props[a]!.kind === "boolean") - Number(entry.props[b]!.kind === "boolean"));
    if (names.length === 0 && !lead) return null;
    const responsive = names
      .filter((n) => {
        const s = entry.props[n]!;
        return isPick(s) && s.responsive;
      })
      .map((name) => ({ name, unstated: OVERRIDE_TIERS.filter((t) => tiersOf(node.props[name])[t] === undefined) }));
    return (
      <Section
        title={title}
        {...(responsive.length
          ? {
              actions: (
                <BreakpointMenu
                  props={responsive}
                  onAdd={(name, tier) => {
                    const current = node.props[name];
                    const base = baseOf(current);
                    const schema = entry.props[name] as Closed;
                    onProp(name, writeResponsive(base, { ...tiersOf(current), [tier]: base ?? pickValues(schema)[0]! }));
                  }}
                />
              ),
            }
          : {})}
      >
        {lead}
        {layout(
          names.map((name) =>
            propRows(name, entry.props[name]!, node.props[name], (next, continuous) => onProp(name, next, continuous)),
          ),
        )}
      </Section>
    );
  };

  return (
    <Panel>
      {/* The name and the node's own commands live in the pane's floating toolbar. */}
      <Span>
        <Text size="2" emphasis="medium">
          {entry.blurb}
        </Text>
      </Span>

      {propSection("Position", arrange)}

      {propSection(
        "Content",
        entry.children === "text" ? (
          <Row>
            <Cell label="Text" span={2}>
              <TextField
                aria-label="Text content"
                {...(textRef ? { ref: textRef } : {})}
                value={node.text ?? ""}
                onChange={(e) => onText(e.target.value)}
              />
            </Cell>
          </Row>
        ) : undefined,
      )}
      {propSection("Layout")}
      {propSection("Appearance")}
      {propSection("State")}

      {slotsFor(node.type).length ? (
        <Section title="Slots">
          <Row>
            {slotsFor(node.type).map((slot) => {
              const seated = slottedChild(node, slot);
              const items: Record<string, string> = { [UNSET]: "None", ...Object.fromEntries(SLOT_ACCEPTS.map((t) => [t, t])) };
              return (
                <Cell key={slot} label={slot}>
                  <Select
                    items={items}
                    value={seated?.type ?? UNSET}
                    onValueChange={(v) => {
                      if (v === null || v === (seated?.type ?? UNSET)) return;
                      onSlot(slot, v === UNSET ? null : v);
                    }}
                  >
                    <SelectTrigger aria-label={humanize(slot)} />
                    <SelectContent>
                      <SelectItem value={UNSET}>None</SelectItem>
                      {SLOT_ACCEPTS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Cell>
              );
            })}
          </Row>
        </Section>
      ) : null}

      {measured && measured.length > 1 ? (
        <Section
          title="Measurements"
        >
          {pack(measured, () => false).map((pair, i) => (
            <Row key={i}>
              {pair.map((row) => (
                <Cell key={row.label} label={row.label} span={pair.length === 1 ? 2 : 1}>
                  <TextField readOnly aria-label={humanize(row.label)} value={row.value} />
                </Cell>
              ))}
            </Row>
          ))}
        </Section>
      ) : null}

      {children}
    </Panel>
  );
}

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
      >
        {pack(axes, () => false).map((pair, i) => (
          <Row key={i}>
            {pair.map((axis) => (
              <Cell key={axis} label={axis}>
                <Pick
                  label={axis}
                  value={theme[axis]}
                  values={themeAxes[axis]}
                  optional={false}
                  onPick={(v) => v !== undefined && onAxis(axis, v)}
                />
              </Cell>
            ))}
          </Row>
        ))}
      </Section>
    </Panel>
  );
}
