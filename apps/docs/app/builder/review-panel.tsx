"use client";

/**
 * The review panel (2026-08-20): what `review.ts` found, and the one gesture that acts on
 * it. Two things make it different from a lint list — every finding SELECTS the node it is
 * about (so the eye and the panel never disagree about which thing is meant), and every
 * finding carries the system's own sentence for why, rather than a rule id nobody can look
 * up.
 */

import * as React from "react";

import { Box, Button, Flex, Separator, Stack, Text } from "@kookie-ui/react";

import type { Finding } from "./review";

export function ReviewPanel({
  findings,
  selection,
  onSelect,
  onFix,
}: {
  findings: Finding[];
  selection: string[];
  onSelect: (id: string) => void;
  onFix: (finding: Finding) => void;
}) {
  if (findings.length === 0) {
    return (
      <Stack gap="2">
        <Text size="2" weight="medium">
          Nothing to answer for
        </Text>
        <Text size="2" emphasis="medium">
          The document holds to the house style: one focal action per surface, distances that
          differentiate, every control named.
        </Text>
      </Stack>
    );
  }

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");

  return (
    <Stack gap="5">
      {[
        { label: "Must fix", rows: errors },
        { label: "Worth a look", rows: warnings },
      ]
        .filter((section) => section.rows.length > 0)
        .map((section) => (
          <Stack key={section.label} gap="3">
            <Text size="1" emphasis="quiet">
              {section.label} · {section.rows.length}
            </Text>
            <Stack gap="3">
              {section.rows.map((f) => (
                <Row
                  key={f.id}
                  finding={f}
                  selected={f.nodeId !== null && selection.includes(f.nodeId)}
                  onSelect={onSelect}
                  onFix={onFix}
                />
              ))}
            </Stack>
          </Stack>
        ))}
    </Stack>
  );
}

function Row({
  finding,
  selected,
  onSelect,
  onFix,
}: {
  finding: Finding;
  selected: boolean;
  onSelect: (id: string) => void;
  onFix: (f: Finding) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Stack gap="2">
      <Flex gap="2" align="flex-start" justify="space-between">
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Button
            size="1"
            emphasis={selected ? "medium" : "quiet"}
            tone={finding.severity === "error" ? "destructive" : "neutral"}
            onClick={() => finding.nodeId && onSelect(finding.nodeId)}
            style={{ justifyContent: "flex-start", width: "100%", whiteSpace: "normal", textAlign: "start", height: "auto", paddingBlock: "var(--layout-space-2)" }}
          >
            {finding.message}
          </Button>
        </Box>
        {finding.fix ? (
          <Button size="1" emphasis="medium" onClick={() => onFix(finding)}>
            Fix
          </Button>
        ) : null}
      </Flex>
      <Box pl="3">
        <Button size="1" emphasis="quiet" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {finding.rule}
        </Button>
        {open ? (
          <Box pt="1" pr="3">
            <Text size="1" emphasis="quiet">
              {finding.why}
            </Text>
          </Box>
        ) : null}
      </Box>
      <Separator />
    </Stack>
  );
}
