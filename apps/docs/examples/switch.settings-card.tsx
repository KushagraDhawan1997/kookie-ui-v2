import { Card, Flex, Separator, Stack, Switch, Text } from "@kookie-ui/react";

const settings = [
  ["public-profile", "Public profile", "Anyone with the link can see your work.", true],
  ["show-email", "Show email address", "Members of your workspace can see it.", false],
  ["activity", "Share activity status", "Show when you were last active.", true],
] as const;

export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "28rem" }}>
      <Stack gap="4">
        {settings.map(([id, label, description, on], index) => (
          <Stack key={id} gap="4">
            {index > 0 && <Separator />}
            <Flex justify="space-between" align="center" gap="4">
              <Stack gap="1">
                <Text size="3" weight="medium" render={<label htmlFor={id} />}>
                  {label}
                </Text>
                <Text size="2" emphasis="medium">
                  {description}
                </Text>
              </Stack>
              <Switch id={id} defaultChecked={on} />
            </Flex>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
