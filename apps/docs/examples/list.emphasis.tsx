import { List, ListItem, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// `emphasis` picks the ink colour of the words. Use `medium` for a list of
// details under a main statement. Numbers take the colour of the words.
export default function Example() {
  return (
    <Stack gap="2" style={{ maxWidth: "28rem" }}>
      <Text size="3" weight="medium">
        Your trial ends in 3 days
      </Text>
      <List size="3" emphasis="medium">
        <ListItem>Projects stay in read-only mode</ListItem>
        <ListItem>Members keep access to their files</ListItem>
        <ListItem>Deploys stop until you choose a plan</ListItem>
      </List>
    </Stack>
  );
}
