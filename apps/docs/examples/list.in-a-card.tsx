import { Button, Card, Heading, List, ListItem, Stack, Text } from "@kookie-ui/react";

// A list inside a card, between the title and the action. The card sets
// the padding, and the Stack sets the space between the parts.
export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "22rem" }}>
      <Stack gap="4">
        <Stack gap="1">
          <Heading size="6" render={<h3 />}>
            Team plan
          </Heading>
          <Text size="3" emphasis="medium">
            For groups that ship together.
          </Text>
        </Stack>
        <List size="3">
          <ListItem>Up to 25 members</ListItem>
          <ListItem>Shared environment variables</ListItem>
          <ListItem>Priority support</ListItem>
        </List>
        <Button emphasis="loud">Choose Team</Button>
      </Stack>
    </Card>
  );
}
