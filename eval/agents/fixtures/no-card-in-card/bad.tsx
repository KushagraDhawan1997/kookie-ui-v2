import { Card, Stack, Text } from "@kushagradhawan/kookie-ui-react";

function Item({ name }: { name: string }) {
  return <Card><Text>{name}</Text></Card>;
}

// A card inside a card, reached through a local component.
export default function App() {
  return (
    <Card>
      <Stack gap="3">
        {["Alpha", "Beta"].map((name) => <Item key={name} name={name} />)}
      </Stack>
    </Card>
  );
}
