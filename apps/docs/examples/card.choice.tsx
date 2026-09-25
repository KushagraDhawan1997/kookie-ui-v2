import { Card, Flex, Radio, RadioGroup, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const PLANS = [
  { value: "starter", name: "Starter", detail: "Up to 3 projects and 5 GB of storage." },
  { value: "team", name: "Team", detail: "Unlimited projects and 100 GB of storage." },
];

export default function Example() {
  return (
    <RadioGroup defaultValue="team" aria-label="Plan">
      <Stack gap="3" style={{ maxWidth: "24rem" }}>
        {PLANS.map((plan) => (
          <Card key={plan.value} render={<label />}>
            <Flex gap="3" align="flex-start">
              <Radio value={plan.value} />
              <Stack gap="1">
                <Text size="3" weight="medium">
                  {plan.name}
                </Text>
                <Text size="2" emphasis="medium">
                  {plan.detail}
                </Text>
              </Stack>
            </Flex>
          </Card>
        ))}
      </Stack>
    </RadioGroup>
  );
}
