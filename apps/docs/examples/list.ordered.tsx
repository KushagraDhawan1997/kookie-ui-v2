import { List, ListItem } from "@kushagradhawan/kookie-ui-react";

// Set `ordered` when the order is information, such as steps to follow.
// A screen reader then announces a numbered list.
export default function Example() {
  return (
    <List ordered>
      <ListItem>Open the project settings</ListItem>
      <ListItem>Choose the domain tab</ListItem>
      <ListItem>Add the DNS record we show you</ListItem>
      <ListItem>Wait for the check to pass</ListItem>
    </List>
  );
}
