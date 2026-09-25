import { Badge, Flex, Text } from "@kushagradhawan/kookie-ui-react";

// Put a number in a badge to make it a pill. The badge shows what you give it, so format the
// number and choose the cut-off, such as 99+, in your app.
export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      <Text>
        Inbox <Badge>3</Badge>
      </Text>
      <Text>
        Reviews <Badge>12</Badge>
      </Text>
      <Text>
        Notifications <Badge aria-label="More than 99 unread">99+</Badge>
      </Text>
    </Flex>
  );
}
