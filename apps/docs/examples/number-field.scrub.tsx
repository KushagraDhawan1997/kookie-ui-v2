"use client";

import { Box, Card, NumberField, NumberFieldGroup, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const TRANSFORM = [
  { label: "Position", unit: { style: "unit", unit: "centimeter", unitDisplay: "narrow" }, values: [12, 0, -4] },
  { label: "Rotation", unit: { style: "unit", unit: "degree", unitDisplay: "narrow" }, values: [0, 45, 0] },
  { label: "Scale", unit: undefined, values: [1, 1, 1] },
] as const;

// A 3D editor's transform: drag a letter sideways to change its value, or type. The values
// update while you drag, and `onValueCommitted` fires once when you let go, so an undo history
// takes one step per drag. Each group is one thing to read, so its three fields share borders.
export default function Example() {
  return (
    <Box maxWidth="20rem">
      <Card size="2">
        <Stack gap="5">
          {TRANSFORM.map((row) => (
            <Stack key={row.label} gap="3">
              <Text size="2" emphasis="medium">
                {row.label}
              </Text>
              <NumberFieldGroup label={row.label}>
                {(["X", "Y", "Z"] as const).map((axis, i) => (
                  <NumberField
                    key={axis}
                    scrub={axis}
                    aria-label={axis}
                    defaultValue={row.values[i]}
                    step={row.label === "Scale" ? 0.1 : 1}
                    {...(row.unit ? { format: row.unit } : {})}
                  />
                ))}
              </NumberFieldGroup>
            </Stack>
          ))}
        </Stack>
      </Card>
    </Box>
  );
}
