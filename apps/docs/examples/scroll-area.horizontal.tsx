import { Card, Flex, ScrollArea, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const PROJECTS = ["Website", "Mobile app", "Brand kit", "Docs", "Onboarding", "Billing", "Analytics"];

// Content wider than its box scrolls sideways. ScrollArea shows a bar only for the
// direction that overflows, so you do not choose one.
export default function Example() {
  return (
    <ScrollArea aria-label="Recent projects" style={{ width: "24rem" }}>
      <Flex gap="3">
        {PROJECTS.map((name) => (
          <Card key={name} style={{ flexShrink: 0, width: "9rem" }}>
            <Stack gap="1">
              <Text size="2" weight="medium">
                {name}
              </Text>
              <Text size="2" emphasis="medium">
                Edited today
              </Text>
            </Stack>
          </Card>
        ))}
      </Flex>
    </ScrollArea>
  );
}
