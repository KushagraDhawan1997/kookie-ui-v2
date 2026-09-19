import { CodeBlock, Flex, Text } from "@kookie-ui/react";

const SOURCE = `$ pnpm install
Packages: +412
Progress: resolved 412, reused 398, downloaded 14, added 412, done
Done in 6.2s`;

// The footer is a second row at the bottom of the pane, for a status
// line or an action that belongs to the code above it.
export default function Example() {
  return (
    <CodeBlock
      footer={
        <Flex justify="space-between" align="center">
          <Text size="2" emphasis="medium">
            Exit code 0
          </Text>
          <Text size="2" emphasis="medium">
            6.2 seconds
          </Text>
        </Flex>
      }
    >
      {SOURCE}
    </CodeBlock>
  );
}
