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
 * and in the sidebar's footer one trigger costs a fraction of the row three buttons did.
 *
 * STEP 3, WITH THE FRAME'S OWN CONTROLS (2026-09-05, Kushagra). It rests level with the
 * search button above it and the two in the header, which is the whole reason it states an
 * index at all — the frame's chrome is one row of controls seen together, and a 32px trigger
 * under a 40px button reads as an accident rather than as a rank.
 *
 * `items` is passed because the value paints on the closed trigger before the panel has
 * ever opened — the exact case the map exists for. Until hydration the server snapshot
 * shows "system"; useSyncExternalStore corrects it without a mismatch.
 */
export function AppearanceToggle() {
  const { choice } = useAppearance();
  return (
    <Select
      value={choice}
      items={LABELS}
      onValueChange={(value) => setAppearance(value as AppearanceChoice)}
    >
      {/* `backdrop` since 2026-08-30: the toggle floats in the sidebar's footer band and
          nav rows pass behind it (§10 — a floating control over content is what the
          material defends). */}
      <SelectTrigger aria-label="Appearance" backdrop />
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
