"use client";

import * as React from "react";
import { Button, Checkbox, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [agreed, setAgreed] = React.useState(false);

  return (
    <Stack gap="4" align="flex-start">
      <Flex gap="3" align="center">
        <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} />
        <Text size="2" render={<label htmlFor="terms" />}>
          I accept the terms of service
        </Text>
      </Flex>
      <Button emphasis="loud" disabled={!agreed}>
        Create account
      </Button>
    </Stack>
  );
}
