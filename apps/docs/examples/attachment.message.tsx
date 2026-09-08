import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon } from "@hugeicons/core-free-icons";
import {
  Attachment,
  Avatar,
  Card,
  Flex,
  Stack,
  Text,
  iconStroke,
  type Size,
} from "@kookie-ui/react";

// After sending: the same tile, in the message, with no remove. Nothing about it changed
// except what the app put in it. A picture file shows its own picture. The card is the pane,
// so it is what states the backdrop; the tiles inside it resolve solid.
export default function Example({ size = "2", backdrop = false }: { size?: Size; backdrop?: boolean }) {
  return (
    <Card backdrop={backdrop} style={{ maxWidth: "28rem" }}>
      <Flex gap="3" align="start">
        <Avatar size="7" fallback="SB" />
        <Stack gap="4" flexGrow="1">
          <Stack gap="2">
            <Flex gap="2" align="baseline">
              <Text weight="medium">Shruti Bhatia</Text>
              <Text size="2" emphasis="medium">
                10:42
              </Text>
            </Flex>
            <Text>Here is the brief and the final hero for tomorrow's review.</Text>
          </Stack>
          <Flex gap="2" wrap="wrap">
            <Attachment size={size} icon={<HugeiconsIcon icon={Pdf01Icon} strokeWidth={iconStroke} aria-hidden />} meta="1.2 MB">
              brief.pdf
            </Attachment>
            <Attachment size={size} icon={<img src="/backdrop.jpg" alt="" />} meta="3.8 MB">
              hero-final.png
            </Attachment>
          </Flex>
        </Stack>
      </Flex>
    </Card>
  );
}
