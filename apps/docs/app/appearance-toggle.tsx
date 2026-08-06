"use client";

import { Button, Flex } from "@kookie-ui/react";

import { setAppearance, useAppearance, type AppearanceChoice } from "./appearance";

const CHOICES: readonly AppearanceChoice[] = ["system", "light", "dark"];
const LABELS: Record<AppearanceChoice, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

/**
 * Three quiet buttons, the active one accent — a picker built from the loudness ladder
 * rather than a segmented control the package does not have yet. Until hydration the server
 * snapshot shows "system" active; useSyncExternalStore corrects it without a mismatch.
 *
 * `flexGrow="1"` is load-bearing, not taste: every Box is a size-query container
 * (container-type: inline-size, §2), and inline-size containment sizes the element as if it
 * had no contents — so a Flex sitting as a row-flex item shrink-to-fits to ZERO width. A
 * grown item takes its width from space distribution instead of content measurement, which
 * is the one sizing route containment leaves open. The docs header is where this cost of the
 * container decision first bit a real consumer (recorded in DECISIONS' open questions).
 */
export function AppearanceToggle() {
  const { choice } = useAppearance();
  return (
    <Flex gap="1" align="center" justify="flex-end" flexGrow="1">
      {CHOICES.map((c) => (
        <Button
          key={c}
          size="1"
          tone={choice === c ? "accent" : "neutral"}
          emphasis={choice === c ? "medium" : "quiet"}
          onClick={() => setAppearance(c)}
        >
          {LABELS[c]}
        </Button>
      ))}
    </Flex>
  );
}
