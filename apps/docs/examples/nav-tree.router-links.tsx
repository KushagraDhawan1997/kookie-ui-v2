"use client";

import * as React from "react";
import { Box, NavTree, Stack, Text, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const pages: readonly TreeNode[] = [
  {
    id: "account",
    label: "Account",
    children: [
      { id: "/account/profile", label: "Profile", href: "/account/profile" },
      { id: "/account/security", label: "Security", href: "/account/security" },
      { id: "/account/billing", label: "Billing", href: "/account/billing" },
    ],
  },
];

// `renderLink` returns the element each page renders as, such as your router's
// link component. This one updates `currentId` in place of a real navigation.
export default function Example() {
  const [current, setCurrent] = React.useState("/account/profile");

  return (
    <Stack gap="3" style={{ width: "18rem" }}>
      <Box render={<nav aria-label="Account" />}>
        <NavTree
          items={pages}
          defaultExpandedIds={["account"]}
          currentId={current}
          renderLink={(node) => (
            <a
              href={node.href}
              onClick={(event) => {
                event.preventDefault();
                setCurrent(node.id);
              }}
            />
          )}
        />
      </Box>
      <Text size="2" emphasis="medium">
        Current page: {current}
      </Text>
    </Stack>
  );
}
