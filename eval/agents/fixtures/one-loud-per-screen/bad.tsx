import { Button, Flex } from "@kushagradhawan/kookie-ui-react";

// Two loud buttons compete on one screen, and the second sits in a local component.
function PublishButton() {
  return <Button tone="accent" emphasis="loud">Publish</Button>;
}

export default function App() {
  return (
    <Flex gap="3">
      <Button tone="accent" emphasis="loud">Save</Button>
      <PublishButton />
    </Flex>
  );
}
