import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, File01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { Kbd, Row, Stack, Text, iconStroke } from "@kookie-ui/react";

const icon = (glyph: typeof File01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Stack gap="1" style={{ minWidth: "20rem" }}>
      <Row leading={icon(Folder01Icon)} trailing={icon(ArrowRight01Icon)}>
        Invoices
      </Row>
      <Row leading={icon(File01Icon)} trailing={<Text size="2" emphasis="quiet">2.4 MB</Text>}>
        q3-summary.pdf
      </Row>
      <Row leading={icon(File01Icon)} trailing={<Kbd>⌘O</Kbd>}>
        Open recent file
      </Row>
    </Stack>
  );
}
