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
 * `flexGrow="1"` is now taste, not load-bearing: it dates from when every Box was a
 * size-query container and a Flex as a row-flex item collapsed to zero width — the defect
 * this header was the first real consumer to hit. Containment went opt-in 2026-08-08 (§2,
 * the `container` prop), so a plain Flex here would hug its content; the grown item stays
 * because absorbing the middle is the layout this header wants.
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
