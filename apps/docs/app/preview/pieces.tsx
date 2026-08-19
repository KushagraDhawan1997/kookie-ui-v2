/**
 * Shared specimen machinery — the pieces every preview surface uses, in ONE home so the
 * collection page and the per-component pages cannot drift apart (2026-08-19). These moved
 * out of specimens.tsx the day the per-component spec files landed: a spec file importing
 * them from specimens.tsx would be a cycle, and a second copy would be the inconsistency
 * this whole structure exists to kill.
 */
import * as React from "react";
import { Grid, Stack, Text, componentAxes } from "@kookie-ui/react";

// DERIVED since componentAxes shipped (2026-08-19, forced by the builder) — this was the
// literal the old comment on the tone list apologised for.
export const SIZES = componentAxes.size;

export const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

export type Row = { label: string; cells: React.ReactNode[] };

/**
 * A specimen table: column headers across the top, a row label down the side, one specimen
 * per cell. `wide` switches the tracks from max-content (bare controls, intrinsic width) to
 * 1fr (fields, sliders, composite cells). Labels are the QUIET role on purpose — the table
 * chrome recedes so the specimens carry the page.
 */
export function SpecTable({ cols, rows, wide = false }: { cols: string[]; rows: Row[]; wide?: boolean }) {
  const track = wide ? "minmax(0, 1fr)" : "minmax(0, max-content)";
  return (
    // Explicit both-axis alignment: grid items default to STRETCH, which warps any square
    // control to its column's widest cell (a size-1 icon button inflated to the size-4
    // cell's 51px, found by probe). Wide tables keep stretch on the inline axis — a field
    // should fill its track.
    <Grid
      columns={`72px repeat(${cols.length}, ${track})`}
      gapX="5"
      gapY="4"
      style={{ alignItems: "center", justifyItems: wide ? "stretch" : "start" }}
    >
      <span />
      {cols.map((col) => (
        <Text key={col} size="1" emphasis="quiet">
          {col}
        </Text>
      ))}
      {rows.map((row) => (
        <React.Fragment key={row.label}>
          <Text size="1" emphasis="quiet">
            {row.label}
          </Text>
          {row.cells.map((cell, i) => (
            <React.Fragment key={i}>{cell}</React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </Grid>
  );
}

/** A quiet caption above a composed example — the one label style the whole page uses. */
export function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap="3">
      <Text size="1" emphasis="quiet">
        {label}
      </Text>
      {children}
    </Stack>
  );
}
