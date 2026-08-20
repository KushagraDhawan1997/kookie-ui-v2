import { Button, Flex, Spinner } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="4" align="center">
      <Spinner />
      <Button loading>Saving</Button>
      <Button emphasis="quiet" loading>Refreshing</Button>
    </Flex>
  );
}
