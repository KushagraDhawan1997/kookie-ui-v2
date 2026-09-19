"use client";

import * as React from "react";
import {
  Button,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuTrigger,
} from "@kookie-ui/react";

// A checkbox row turns one setting on or off. Pass `checked` and
// `onCheckedChange` to keep the value in your own state.
export default function Example() {
  const [columns, setColumns] = React.useState({ owner: true, updated: true, size: false });

  return (
    <Menu>
      <MenuTrigger render={<Button>Columns</Button>} />
      <MenuContent>
        <MenuGroup>
          <MenuLabel>Show columns</MenuLabel>
          <MenuCheckboxItem
            checked={columns.owner}
            onCheckedChange={(owner) => setColumns((c) => ({ ...c, owner }))}
          >
            Owner
          </MenuCheckboxItem>
          <MenuCheckboxItem
            checked={columns.updated}
            onCheckedChange={(updated) => setColumns((c) => ({ ...c, updated }))}
          >
            Last updated
          </MenuCheckboxItem>
          <MenuCheckboxItem
            checked={columns.size}
            onCheckedChange={(size) => setColumns((c) => ({ ...c, size }))}
          >
            File size
          </MenuCheckboxItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}
