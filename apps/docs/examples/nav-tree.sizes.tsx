import { Box, Grid, NavTree, type TreeNode } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

const pages: readonly TreeNode[] = [
  {
    id: "guides",
    label: "Guides",
    children: [
      { id: "/guides/deploy", label: "Deploy", href: "#" },
      { id: "/guides/domains", label: "Domains", href: "#" },
    ],
  },
  { id: "/changelog", label: "Changelog", href: "#" },
];

const sizes: Size[] = ["1", "2", "3"];

// `size` sets the height of every row, the text and the indent together.
// Rows rest at size 2. Each row is as tall as a Button of the same size.
export default function Example() {
  return (
    <Grid gap="5" columns="repeat(3, minmax(0, 1fr))">
      {sizes.map((size) => (
        <Box key={size} render={<nav aria-label={`Guides at size ${size}`} />}>
          <NavTree
            size={size}
            items={pages}
            defaultExpandedIds={["guides"]}
            currentId="/guides/deploy"
          />
        </Box>
      ))}
    </Grid>
  );
}
