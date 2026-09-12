import { List, ListItem } from "@kookie-ui/react";

export default function Example() {
  return (
    <List size="3">
      <ListItem>Invite your team</ListItem>
      <ListItem>Connect a repository</ListItem>
      <ListItem>
        Deploy the first build
        {/* A list inside an item states no step: it takes the one the item sits at. */}
        <List>
          <ListItem>Preview builds run on every push</ListItem>
          <ListItem>Production builds run on main</ListItem>
        </List>
      </ListItem>
    </List>
  );
}
