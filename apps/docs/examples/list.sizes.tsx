import { List, ListItem, Stack } from "@kookie-ui/react";

// `size` picks a step on the same scale Text uses. The room for the marker
// and the space between items grow with the step.
export default function Example() {
  return (
    <Stack gap="5">
      <List size="2">
        <ListItem>Unlimited projects</ListItem>
        <ListItem>Preview builds on every push</ListItem>
      </List>
      <List size="3">
        <ListItem>Unlimited projects</ListItem>
        <ListItem>Preview builds on every push</ListItem>
      </List>
      <List size="4">
        <ListItem>Unlimited projects</ListItem>
        <ListItem>Preview builds on every push</ListItem>
      </List>
    </Stack>
  );
}
