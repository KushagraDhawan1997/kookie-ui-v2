"use client";

import * as React from "react";
import {
  Button,
  Menu,
  MenuContent,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@kushagradhawan/kookie-ui-react";

const orders = { name: "Name", updated: "Last updated", size: "File size" } as const;
type Order = keyof typeof orders;

// Radio rows choose one value from a set. The trigger shows the current
// choice, so a person can see it without opening the menu.
export default function Example() {
  const [order, setOrder] = React.useState<Order>("updated");

  return (
    <Menu>
      <MenuTrigger render={<Button>Sort by {orders[order].toLowerCase()}</Button>} />
      <MenuContent>
        <MenuRadioGroup value={order} onValueChange={(value) => setOrder(value as Order)}>
          <MenuLabel>Sort files by</MenuLabel>
          {(Object.keys(orders) as Order[]).map((key) => (
            <MenuRadioItem key={key} value={key}>
              {orders[key]}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
