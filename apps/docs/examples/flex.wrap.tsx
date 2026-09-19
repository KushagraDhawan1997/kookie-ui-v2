import { Chip, Flex } from "@kookie-ui/react";

const TAGS = ["Billing", "Onboarding", "API", "Security", "Mobile", "Integrations", "Reporting", "Accessibility"];

// `wrap="wrap"` moves items to a new line when the row runs out of room.
// `gap` sets the space between items on a line and between lines.
export default function Example() {
  return (
    <Flex wrap="wrap" gap="2" style={{ maxWidth: "24rem" }}>
      {TAGS.map((tag) => (
        <Chip key={tag}>{tag}</Chip>
      ))}
    </Flex>
  );
}
