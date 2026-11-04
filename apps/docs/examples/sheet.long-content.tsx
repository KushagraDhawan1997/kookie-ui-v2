import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const EVENTS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  action: i % 3 === 0 ? "Deployed to production" : i % 3 === 1 ? "Changed billing email" : "Invited a member",
  time: `${i + 1} hours ago`,
}));

// When the content is taller than the window, the panel stops at the window's height and
// its body scrolls. The page behind it does not scroll.
export default function Example() {
  return (
    <Sheet side="inline-end">
      <SheetTrigger render={<Button emphasis="medium">View activity</Button>} />
      <SheetContent>
        <Toolbar>
          <ToolbarTitle render={<SheetTitle />}>Activity</ToolbarTitle>
          <SheetClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="6">
          <SheetDescription>Everything that happened in this workspace today.</SheetDescription>
          <Stack gap="3">
            {EVENTS.map((event, i) => (
              <Stack key={event.id} gap="3">
                {i > 0 && <Separator />}
                <Flex justify="space-between" gap="4">
                  <Text size="2">{event.action}</Text>
                  <Text size="2" emphasis="medium">
                    {event.time}
                  </Text>
                </Flex>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
