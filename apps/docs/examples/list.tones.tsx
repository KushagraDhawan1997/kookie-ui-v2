import { List, ListItem, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// `tone` moves the words and the markers to that colour family.
// Use it when the whole list carries one meaning, such as what a delete removes.
export default function Example() {
  return (
    <Stack gap="2" style={{ maxWidth: "28rem" }}>
      <Text size="3" weight="medium">
        Deleting this project also removes:
      </Text>
      <List size="3" tone="destructive">
        <ListItem>12 deployments and their logs</ListItem>
        <ListItem>3 custom domains</ListItem>
        <ListItem>All environment variables</ListItem>
      </List>
    </Stack>
  );
}
