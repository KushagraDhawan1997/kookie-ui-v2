import { Button, Card } from "@kushagradhawan/kookie-ui-react";

// The Radix Themes reflexes: every prop here is refused by the package.
export default function App() {
  return (
    <Card variant="surface">
      <Button variant="solid" color="red" m="4">
        Save
      </Button>
    </Card>
  );
}
