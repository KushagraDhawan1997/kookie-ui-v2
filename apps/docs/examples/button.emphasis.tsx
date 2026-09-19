import { Button, Flex } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button emphasis="loud">Publish</Button>
      <Button>Save draft</Button>
      <Button emphasis="quiet" bordered>
        Preview
      </Button>
      <Button emphasis="quiet">Cancel</Button>
    </Flex>
  );
}
