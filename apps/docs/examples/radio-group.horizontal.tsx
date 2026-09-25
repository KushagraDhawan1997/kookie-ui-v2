import { Flex, Radio, RadioGroup, Text } from "@kushagradhawan/kookie-ui-react";

const PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function Example() {
  return (
    <RadioGroup defaultValue="yearly" aria-label="Billing period" render={<Flex gap="5" />}>
      {PERIODS.map((period) => (
        <Flex key={period.value} gap="3" align="center" render={<label />}>
          <Radio value={period.value} />
          <Text size="2" render={<span />}>
            {period.label}
          </Text>
        </Flex>
      ))}
    </RadioGroup>
  );
}
