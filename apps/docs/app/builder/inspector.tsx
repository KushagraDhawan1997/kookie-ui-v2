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

import { PlusIcon } from "../icons";
import { ENTRIES } from "../(site)/components/registry";

import { CATALOG, type PropSchema } from "./catalog";
import { TIER_KEYS, type BuilderNode, type DocTheme, type PropValue, type ResponsiveValue } from "./model";

const REFUSALS = new Map(ENTRIES.map((e) => [e.name, e.refusals]));

/** The sentinel a Select needs for "the component's own default" — a real value, mapped
    back to deleting the prop, because an axis picker cannot hold an absence. */
const UNSET = "·unset·";

function PickRow({
  label,
  value,
  values,
  labels,
  optional,
  onPick,
  after,
}: {
  label: string;
  value: string | undefined;
  values: readonly string[];
  labels?: Record<string, string>;
  optional: boolean;
  onPick: (next: string | undefined) => void;
  /** A small control seated beside the picker — the responsive row's + menu. */
  after?: React.ReactNode;
}) {
  const items: Record<string, string> = {};
  if (optional) items[UNSET] = "(unset)";
  for (const v of values) items[v] = labels?.[v] ?? v;
  return (
    <Flex gap="3" align="center" justify="space-between">
      <Text size="1" emphasis="medium">
        {label}
      </Text>
      <Flex gap="1" align="center">
        <Select
          size="1"
          items={items}
          value={value ?? UNSET}
          onValueChange={(v) => onPick(v === UNSET ? undefined : v)}
        >
          <SelectTrigger />
          <SelectContent>
            {Object.entries(items).map(([v, l]) => (
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
  onChange: (next: PropValue | undefined) => void;
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
            onChange(raw === "" ? undefined : Number(raw));
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
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
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

export function Inspector({
  node,
  onProp,
  onText,
  textRef,
}: {
  node: BuilderNode;
  onProp: (key: string, next: PropValue | undefined) => void;
  onText: (next: string) => void;
  /** The editor's ⏎ focuses the content field — the fastest path from "selected" to
      "typing", and the reason canvas text needs no inline editor of its own. */
  textRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const entry = CATALOG[node.type];
  if (!entry) return null;
  const refusals = REFUSALS.get(node.type);
  const propNames = Object.keys(entry.props);
  return (
    <Stack gap="4">
      <Stack gap="1">
        <Text size="2" weight="medium">
          {node.type}
        </Text>
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
                onChange={(next) => onProp(name, next)}
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

      {refusals?.length ? (
        <Stack gap="2">
          <Separator />
          <Text size="1" weight="medium">
            Not here, on purpose
          </Text>
          {refusals.map((r) => (
            <Stack key={r.name} gap="1">
              <Text size="1" emphasis="medium">
                {r.name}
              </Text>
              <Text size="1" emphasis="quiet">
                {r.why}
              </Text>
            </Stack>
          ))}
        </Stack>
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
