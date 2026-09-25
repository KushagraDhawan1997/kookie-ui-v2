import { Grid, Tree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const items: readonly TreeNode[] = [
  {
    id: "settings",
    label: "Settings",
    children: [
      { id: "profile", label: "Profile" },
      { id: "billing", label: "Billing" },
    ],
  },
];

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Grid columns="2" gap="5" style={{ minWidth: "28rem" }}>
      {SIZES.map((size) => (
        <Tree
          key={size}
          size={size}
          items={items}
          defaultExpandedIds={["settings"]}
          aria-label={`Settings, size ${size}`}
        />
      ))}
    </Grid>
  );
}
