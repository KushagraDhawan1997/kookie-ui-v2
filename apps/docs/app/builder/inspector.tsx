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
 */

import * as React from "react";

import {
  Box,
  Button,
  Flex,
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
import { ENTRIES } from "../(site)/components/registry";

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

function PickRow({
  label,
  value,
  values,
  labels,
  optional,
  mixed,
  onPick,
  after,
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
}) {
  /* `items` still goes to the Select for its label lookup; the options render from `order`,
     because the Record cannot hold one (see `pickOrder`). */
  const order = pickOrder(values, { ...(mixed ? { mixed } : {}), optional, ...(labels ? { labels } : {}) });
  const items: Record<string, string> = Object.fromEntries(order);
  return (
    <Flex gap="3" align="center" justify="space-between">
      <Text size="1" emphasis="medium">
        {label}
      </Text>
      <Flex gap="1" align="center">
        <Select
          size="1"
          items={items}
          value={mixed ? MIXED : (value ?? UNSET)}
          onValueChange={(v) => {
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
      </Flex>
    </Flex>
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
      <Flex gap="3" align="center" justify="space-between">
        <Text size="1" emphasis="medium">
          {name}
        </Text>
        <Switch
          size="1"
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked ? true : undefined)}
          aria-label={name}
        />
      </Flex>
    );
  }
  if (schema.kind === "number") {
    return (
      <Flex gap="3" align="center" justify="space-between">
        <Text size="1" emphasis="medium">
          {name}
        </Text>
        <TextField
          size="1"
          type="number"
          aria-label={name}
          value={value === undefined ? "" : String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? undefined : Number(raw), true);
          }}
        />
      </Flex>
    );
  }
  return (
    <Stack gap="1">
      <Text size="1" emphasis="medium">
        {name}
      </Text>
      <TextField
        size="1"
        aria-label={name}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value, true)}
      />
    </Stack>
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
            <Menu size="1">
              <MenuTrigger
                render={
                  <Button size="1" emphasis="quiet" iconOnly aria-label={`Add a breakpoint to ${name}`}>
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
        <Text size="1" emphasis="medium">
          {types.length === 1 ? `${types.length && types[0]}, all of them` : types.join(", ")}
        </Text>
      </Stack>

      {offered.length === 0 ? (
        <Text size="1" emphasis="quiet">
          {types.length === 1
            ? "Nothing these share is a closed choice — this one is all identity."
            : "These types share no knob that means the same thing on all of them. Select fewer kinds, or edit them one at a time."}
        </Text>
      ) : (
        <Stack gap="2">
          {offered.map(([name, schema]) => {
            const first = nodes[0]!.props[name];
            const agreed = nodes.every((n) => sameValue(n.props[name], first));
            if (schema.kind === "boolean") {
              return (
                <Flex key={name} gap="3" align="center" justify="space-between">
                  <Text size="1" emphasis="medium">
                    {name}
                  </Text>
                  <Flex gap="1" align="center">
                    {/* Two buttons rather than a switch: a switch has no way to say "these
                        disagree", and one drawn OFF over a mixed set would be a lie. */}
                    <Button
                      size="1"
                      emphasis={agreed && first === true ? "medium" : "quiet"}
                      bordered
                      onClick={() => onProp(name, true)}
                    >
                      On
                    </Button>
                    <Button
                      size="1"
                      emphasis={agreed && first !== true ? "medium" : "quiet"}
                      bordered
                      onClick={() => onProp(name, undefined)}
                    >
                      Off
                    </Button>
                  </Flex>
                </Flex>
              );
            }
            const values = schema.kind === "axis" ? componentAxes[schema.axis] : schema.values;
            const labels = schema.kind === "options" ? schema.labels : undefined;
            const plain = typeof first === "string" ? first : undefined;
            return (
              <Stack key={name} gap="1">
                <PickRow
                  label={name}
                  value={agreed ? plain : undefined}
                  values={values}
                  {...(labels ? { labels } : {})}
                  optional={schema.optional ?? false}
                  mixed={!agreed}
                  onPick={(next) => onProp(name, next)}
                />
                {anyResponsive(name) ? (
                  <Text size="1" emphasis="quiet">
                    One of these states {name} per tier. Picking here replaces that.
                  </Text>
                ) : null}
              </Stack>
            );
          })}
        </Stack>
      )}

      <Text size="1" emphasis="quiet">
        Text and numbers stay one at a time — writing one label onto several nodes is a
        deletion wearing an edit&apos;s clothes.
      </Text>
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
      <Stack gap="1">
        <Flex align="center" justify="space-between" gap="2">
          <Text size="2" weight="medium">
            {node.type}
          </Text>
          {SLUGS.has(node.type) ? (
            <Button
              size="1"
              emphasis="quiet"
              render={<a href={"/components/" + SLUGS.get(node.type)} target="_blank" rel="noreferrer" />}
            >
              Reference
            </Button>
          ) : null}
        </Flex>
        <Text size="1" emphasis="medium">
          {entry.blurb}
        </Text>
      </Stack>

      {entry.children === "text" ? (
        <Stack gap="1">
          <Text size="1" emphasis="medium">
            text
          </Text>
          <TextField
            size="1"
            aria-label="Text content"
            {...(textRef ? { ref: textRef } : {})}
            value={node.text ?? ""}
            onChange={(e) => onText(e.target.value)}
          />
        </Stack>
      ) : null}

      {propNames.length ? (
        <Stack gap="2">
          {propNames.map((name) => (
            <Stack key={name} gap="1">
              <PropControl
                name={name}
                schema={entry.props[name]!}
                value={node.props[name]}
                onChange={(next, continuous) => onProp(name, next, continuous)}
              />
              {entry.props[name]!.note ? (
                <Text size="1" emphasis="quiet">
                  {entry.props[name]!.note}
                </Text>
              ) : null}
            </Stack>
          ))}
        </Stack>
      ) : (
        <Text size="1" emphasis="quiet">
          Nothing to configure — this one is all identity.
        </Text>
      )}

      {slotsFor(node.type).length ? (
        <Stack gap="2">
          <Text size="1" weight="medium">
            Slots
          </Text>
          {slotsFor(node.type).map((slot) => {
            const seated = slottedChild(node, slot);
            return (
              <Flex key={slot} gap="2" align="center" justify="space-between">
                <Text size="1" emphasis="medium">
                  {slot}
                </Text>
                {seated ? (
                  <Flex gap="1" align="center">
                    <Button size="1" emphasis="quiet" bordered onClick={() => onSelect(seated.id)}>
                      {seated.type}
                    </Button>
                    <Button size="1" emphasis="quiet" iconOnly aria-label={`Clear the ${slot} slot`} onClick={() => onSlot(slot, null)}>
                      <XIcon />
                    </Button>
                  </Flex>
                ) : (
                  <Menu size="1">
                    <MenuTrigger
                      render={
                        <Button size="1" emphasis="quiet" bordered>
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
              </Flex>
            );
          })}
          <Text size="1" emphasis="quiet">
            Icons go in by hand — the package ships none, so a written one would not resolve.
          </Text>
        </Stack>
      ) : null}

      {measured && measured.length > 1 ? (
        <Stack gap="2">
          <Separator />
          <Text size="1" weight="medium">
            What that comes to
          </Text>
          {measured.map((row) => (
            <Flex key={row.label} gap="3" align="center" justify="space-between">
              <Text size="1" emphasis="medium">
                {row.label}
                {row.stated ? (
                  <Text size="1" emphasis="quiet">
                    {` ${row.stated}`}
                  </Text>
                ) : null}
              </Text>
              <Text size="1" render={<code />}>
                {row.value}
              </Text>
            </Flex>
          ))}
          <Text size="1" emphasis="quiet">
            Measured off this element, so density, the pointer world and the canvas width are
            all already in it.
          </Text>
        </Stack>
      ) : null}

      {refusals?.length ? (
        <Stack gap="2">
          <Separator />
          <Text size="1" weight="medium">
            Not here, on purpose
          </Text>
          {refusals.map((r) => (
            <Refusal key={r.name} name={r.name} why={r.why} />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

/** A refusal reads as its NAME; the argument opens when someone wants it. Three paragraphs
    of prose sitting between the props and the actions is the panel arguing with itself. */
function Refusal({ name, why }: { name: string; why: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Stack gap="1">
      <Button
        size="1"
        emphasis="quiet"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{ justifyContent: "flex-start" }}
      >
        {`no ${name}`}
      </Button>
      {open ? (
        <Box pl="3" pr="2">
          <Text size="1" emphasis="quiet">
            {why}
          </Text>
        </Box>
      ) : null}
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
    <Stack gap="2">
      <Text size="1" emphasis="medium">
        One identity for the whole document — every axis re-prices tokens, no call site
        answers twice.
      </Text>
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
    </Stack>
  );
}
