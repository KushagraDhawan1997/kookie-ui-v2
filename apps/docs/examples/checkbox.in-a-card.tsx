import { Card, Checkbox, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const ADDONS = [
  { name: "Priority support", detail: "Replies within 4 hours, every day." },
  { name: "Extra storage", detail: "Adds 500 GB to every member." },
];

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "24rem" }}>
      {ADDONS.map((addon, index) => (
        <Card key={addon.name} render={<label />}>
          <Flex gap="3" align="flex-start">
            <Checkbox defaultChecked={index === 0} />
            <Stack gap="1">
              <Text size="3" weight="medium">
                {addon.name}
              </Text>
              <Text size="2" emphasis="medium">
                {addon.detail}
              </Text>
            </Stack>
          </Flex>
        </Card>
      ))}
    </Stack>
  );
}
