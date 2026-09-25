import { Flex, Radio, RadioGroup, Text } from "@kushagradhawan/kookie-ui-react";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match the system" },
];

// A label that wraps the radio needs no `id` and no `htmlFor`.
export default function Example() {
  return (
    <RadioGroup defaultValue="system" aria-label="Appearance">
      {OPTIONS.map((option) => (
        <Flex key={option.value} gap="3" align="center" render={<label />}>
          <Radio value={option.value} />
          <Text size="2" render={<span />}>
            {option.label}
          </Text>
        </Flex>
      ))}
    </RadioGroup>
  );
}
