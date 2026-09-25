import { Button, Card, CodeBlock, Flex, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const SOURCE = `curl https://api.example.com/v1/projects \\
  -H "Authorization: Bearer $API_KEY"`;

// A CodeBlock is recessed into the pane that holds it, so it sits inside
// a Card without looking like a second card.
export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "36rem" }}>
      <Stack gap="5">
        <Stack gap="2">
          <Heading size="6">Test your API key</Heading>
          <Text emphasis="medium">
            Run this request from a terminal. A list of your projects means the key works.
          </Text>
        </Stack>
        <CodeBlock>{SOURCE}</CodeBlock>
        <Flex justify="flex-end">
          <Button emphasis="loud">Continue</Button>
        </Flex>
      </Stack>
    </Card>
  );
}
