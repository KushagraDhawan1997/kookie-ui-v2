import { Heading, ScrollArea, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A ScrollArea is a tab stop, so keyboard users can scroll it with the arrow keys. Name it
// with `aria-labelledby` or `aria-label`, and a screen reader announces it as a region.
export default function Example() {
  return (
    <Stack gap="3" width="22rem">
      <Heading size="4" id="terms-heading">
        Terms of service
      </Heading>
      <ScrollArea aria-labelledby="terms-heading" style={{ height: "10rem" }}>
        <Stack gap="4">
          <Text size="2">
            These terms apply to every workspace you create or join. By using the service you
            agree to them.
          </Text>
          <Text size="2">
            You keep ownership of the files you upload. We store them only to provide the
            service to you and your team.
          </Text>
          <Text size="2">
            You can export or delete your data at any time from the settings page. Deleted data
            is removed from backups within 30 days.
          </Text>
          <Text size="2">
            We may change these terms. We tell you by email at least 14 days before a change
            takes effect.
          </Text>
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
