"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@kookie-ui/react";

import { setAppearance, useAppearance, type AppearanceChoice } from "./appearance";

const CHOICES: readonly AppearanceChoice[] = ["system", "light", "dark"];
const LABELS: Record<AppearanceChoice, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

/**
 * A Select, not three buttons (2026-08-26, Kushagra — the chrome restructure that removed
 * the header). The button row was built before the package had a segmented control or a
 * Select worth using; picking one of three persistent choices is exactly what a Select is,
 * and in the sidebar's footer a 32px trigger costs a third of the row three buttons did.
 *
 * `items` is passed because the value paints on the closed trigger before the panel has
 * ever opened — the exact case the map exists for. Until hydration the server snapshot
 * shows "system"; useSyncExternalStore corrects it without a mismatch.
 */
export function AppearanceToggle() {
  const { choice } = useAppearance();
  return (
    <Select
      size="2"
      value={choice}
      items={LABELS}
      onValueChange={(value) => setAppearance(value as AppearanceChoice)}
    >
      <SelectTrigger aria-label="Appearance" />
      <SelectContent>
        {CHOICES.map((c) => (
          <SelectItem key={c} value={c}>
            {LABELS[c]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
