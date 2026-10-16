"use client";

import * as React from "react";
import { Button, Card, Flex, Text } from "@kushagradhawan/kookie-ui-react";

// Archiving can be reversed, so it runs at once and offers undo instead of asking first.
export default function Example() {
  const [archived, setArchived] = React.useState(false);

  return (
    <Card style={{ maxWidth: "24rem" }}>
      <Flex align="center" justify="space-between" gap="3">
        <Text size="2" emphasis={archived ? "medium" : "loud"} render={<p role="status" />}>
          {archived ? "Q3 report archived." : "Q3 report"}
        </Text>
        {archived ? (
          <Button emphasis="quiet" onClick={() => setArchived(false)}>
            Undo
          </Button>
        ) : (
          <Button onClick={() => setArchived(true)}>Archive</Button>
        )}
      </Flex>
    </Card>
  );
}
