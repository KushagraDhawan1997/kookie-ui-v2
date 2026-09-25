import { Badge, Flex, Text } from "@kushagradhawan/kookie-ui-react";

// `tone` says what the badge means. The default `accent` means something is here.
// `destructive` means something needs you. Map your own words to a tone in your app.
export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      <Text>
        Messages <Badge>5</Badge>
      </Text>
      <Text>
        Failed builds <Badge tone="destructive">2</Badge>
      </Text>
      <Text>
        Expiring keys <Badge tone="warning">1</Badge>
      </Text>
      <Text>
        Checks passed <Badge tone="success">8</Badge>
      </Text>
      <Text>
        Drafts <Badge tone="neutral">4</Badge>
      </Text>
    </Flex>
  );
}
