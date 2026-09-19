import * as React from "react";

import { Button, Card, Flex, Grid, Stack, Surface, Text, Theme, componentAxes } from "@kookie-ui/react";

/**
 * The colour chapter's figures (2026-09-14, Kushagra: "shouldnt the color page in docs show
 * colours visually?", then "make it even better"). ReviewRules' kind of thing: a chapter cannot
 * draw a palette in markdown, and the palette is the system's, so these read the package's own
 * tone list and the generated tokens — nothing here states a colour. Every figure is shown in
 * both modes, because half of what the chapter says is how the two modes differ, and every
 * figure says in one line what to look at, because a wall of swatches explains nothing.
 */

/**
 * What each figure asks the reader to look at. One home, read twice: the figure renders it
 * under the swatches, and the chapter's markdown twin states it in place of a picture a
 * plain-text reader cannot see.
 */
export const FIGURE_CAPTIONS = {
  ColorScales:
    "Read a column top to bottom: every family is equally light at the same step, so swapping a tone never changes how loud something looks. Dark is not light inverted — each step is redesigned for a dark background.",
  ColorInks:
    "The three levels reach the same contrast in every family. Look at accent: its medium and quiet go grey, because a faded brand colour stops looking like the brand. The meanings stay coloured, because a faded red still reads as danger.",
  ColorGrounds:
    "In light, a card and the page are the same white, so the card's shadow is what separates them — only the ground is a different colour. In dark, all three step apart: page darkest, cards lightest.",
} as const;

const MODES = ["light", "dark"] as const;
type Mode = (typeof MODES)[number];

/** What each run of steps is FOR — read off the roles the generator emits (`--x-soft` is step
    3, its hover and press 4 and 5; `--x-border` is 7; `--x-text` is 11, neutral's ink 12; the
    solid fill is solved to land around 9 and 10). */
const BANDS = [
  { label: "Backgrounds", steps: [1, 2] },
  { label: "Tints", steps: [3, 4, 5] },
  { label: "Borders", steps: [6, 7, 8] },
  { label: "Solid", steps: [9, 10] },
  { label: "Text", steps: [11, 12] },
] as const;

const swatch: React.CSSProperties = { borderRadius: "var(--radius-mark-2)" };

/** One mode's panel: its own Theme, painting that mode's page, so the colours sit on the
    background they are designed against. */
function ModePanel({ mode, children }: { mode: Mode; children: React.ReactNode }) {
  return (
    <Theme appearance={mode}>
      <Stack
        gap="4"
        p="5"
        style={{
          background: "var(--color-page)",
          borderRadius: "var(--radius-surface-2)",
          border: "var(--border-width) solid var(--color-border)",
        }}
      >
        <Text size="2" emphasis="medium">
          {mode === "light" ? "Light" : "Dark"}
        </Text>
        {children}
      </Stack>
    </Theme>
  );
}

/** The sentence under a figure: what to look for, not what the figure is. */
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <Text size="2" emphasis="medium" render={<p />}>
      {children}
    </Text>
  );
}

/** Ten families × twelve steps, grouped by what each run of steps is used for. */
export function ColorScales() {
  const columns = `6rem ${BANDS.map((b) => `repeat(${b.steps.length}, minmax(0, 1fr))`).join(" ")}`;
  return (
    <Stack gap="3">
      {MODES.map((mode) => (
        <ModePanel key={mode} mode={mode}>
          <Grid columns={columns} gap="1" align="center">
            <span />
            {BANDS.map((b) => (
              <Text
                key={b.label}
                size="1"
                emphasis="medium"
                style={{ gridColumn: `span ${b.steps.length}`, textAlign: "center" }}
              >
                {b.label}
              </Text>
            ))}
            <span />
            {BANDS.flatMap((b) => b.steps).map((s) => (
              <Text key={s} size="1" emphasis="quiet" style={{ textAlign: "center" }}>
                {s}
              </Text>
            ))}
            {componentAxes.tone.map((tone) => (
              <React.Fragment key={tone}>
                <Text size="2">{tone}</Text>
                {BANDS.flatMap((b) => b.steps).map((s) => (
                  <div
                    key={s}
                    title={`--${tone}-${s}`}
                    style={{ ...swatch, blockSize: "var(--space-6)", background: `var(--${tone}-${s})` }}
                  />
                ))}
              </React.Fragment>
            ))}
          </Grid>
        </ModePanel>
      ))}
      <Caption>{FIGURE_CAPTIONS.ColorScales}</Caption>
    </Stack>
  );
}

/** The three text colours, as the sentences they exist for, and the solid fill with its label. */
export function ColorInks() {
  return (
    <Stack gap="3">
      {/* Stacked, not side by side: at half the column, "Medium" broke across two lines. */}
      <Stack gap="3">
        {MODES.map((mode) => (
          <ModePanel key={mode} mode={mode}>
            <Stack gap="1">
              <Text size="3">Payment failed</Text>
              <Text size="1" emphasis="quiet">
                Loud — what the screen is saying
              </Text>
            </Stack>
            <Stack gap="1">
              <Text size="3" emphasis="medium">
                We retry on 10 August
              </Text>
              <Text size="1" emphasis="quiet">
                Medium — real information, said quietly
              </Text>
            </Stack>
            <Stack gap="1">
              <Text size="3" emphasis="quiet">
                Refunds are not available
              </Text>
              <Text size="1" emphasis="quiet">
                Quiet — turned off, nothing to act on
              </Text>
            </Stack>
            <Grid columns="5.5rem repeat(3, minmax(0, 1fr)) auto" gap="2" align="center">
              {componentAxes.tone.map((tone) => (
                <React.Fragment key={tone}>
                  <Text size="2" emphasis="medium">
                    {tone}
                  </Text>
                  <Text size="2" tone={tone}>
                    Loud
                  </Text>
                  <Text size="2" tone={tone} emphasis="medium">
                    Medium
                  </Text>
                  <Text size="2" tone={tone} emphasis="quiet">
                    Quiet
                  </Text>
                  <Button size="1" emphasis="loud" tone={tone}>
                    Solid
                  </Button>
                </React.Fragment>
              ))}
            </Grid>
          </ModePanel>
        ))}
      </Stack>
      <Caption>{FIGURE_CAPTIONS.ColorInks}</Caption>
    </Stack>
  );
}

/** Page, ground, surface — from the bottom up, as the composition they exist for. */
export function ColorGrounds() {
  return (
    <Stack gap="3">
      <Grid columns={{ initial: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }} gap="4">
        {MODES.map((mode) => (
          <ModePanel key={mode} mode={mode}>
            <Flex gap="2" align="baseline" justify="space-between">
              <Text size="2">Page</Text>
              <Text size="1" emphasis="quiet">
                --color-page
              </Text>
            </Flex>
            <Surface size="2">
              <Stack gap="3">
                <Flex gap="2" align="baseline" justify="space-between">
                  <Text size="2">Ground</Text>
                  <Text size="1" emphasis="quiet">
                    --color-ground
                  </Text>
                </Flex>
                <Grid columns="repeat(2, minmax(0, 1fr))" gap="3">
                  {["Surface", "Surface"].map((label, i) => (
                    <Card key={i} size="1">
                      <Stack gap="1">
                        <Text size="2">{label}</Text>
                        <Text size="1" emphasis="quiet">
                          --color-surface
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Surface>
          </ModePanel>
        ))}
      </Grid>
      <Caption>{FIGURE_CAPTIONS.ColorGrounds}</Caption>
    </Stack>
  );
}
