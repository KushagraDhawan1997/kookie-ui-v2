"use client";

import * as React from "react";
import { Badge, Button, Flex, Text } from "@kushagradhawan/kookie-ui-react";

// Write `{count > 0 && count}` to show the badge only when there is something to count. At
// zero, the badge has no content and no name, so nothing renders.
export default function Example() {
  const [count, setCount] = React.useState(2);
  return (
    <Flex gap="4" align="center">
      <Text>
        Inbox <Badge>{count > 0 && count}</Badge>
      </Text>
      <Button emphasis="medium" disabled={count === 0} onClick={() => setCount((c) => c - 1)}>
        Mark one as read
      </Button>
    </Flex>
  );
}
