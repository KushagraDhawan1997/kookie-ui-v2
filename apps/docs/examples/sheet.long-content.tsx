import {
  Button,
  Flex,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Stack,
  Text,
} from "@kookie-ui/react";

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
        <Stack gap="6">
          <Stack gap="2">
            <SheetTitle>Activity</SheetTitle>
            <SheetDescription>Everything that happened in this workspace today.</SheetDescription>
          </Stack>
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
