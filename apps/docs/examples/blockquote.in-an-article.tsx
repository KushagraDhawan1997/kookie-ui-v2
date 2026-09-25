import { Blockquote, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// In running text, the quote sits in the same column as the paragraphs. The layout around it
// sets the space above and below. Blockquote adds no margin of its own.
export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "34rem" }}>
      <Heading size="6">What changed in the release process</Heading>
      <Text>
        Every deploy now waits for one approval from the owning team. The check runs in the pull
        request, so nobody opens a second tool.
      </Text>
      <Blockquote>
        The approval step added two minutes to a deploy and removed most of our rollbacks.
      </Blockquote>
      <Text>
        The rule applies to production only. Preview environments still deploy on every push.
      </Text>
    </Stack>
  );
}
