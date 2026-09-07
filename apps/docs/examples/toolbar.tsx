import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarTitle,
  Flex,
} from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

import { CopyIcon, LockIcon, MoreIcon, PanelLeftIcon, SearchIcon } from "../app/icons";

/* Three, which is the component's own default. A band rests one step above the app's index,
   and an app resting at 2 puts its toolbar at 3. */
export default function Example({
  size = "3",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    /* `backdrop` on the ROW marks a region: it paints nothing itself and every control in it
       resolves the theme's material. Turn it on to see what a band over a photograph or a
       canvas looks like. */
    <Toolbar size={size} backdrop={backdrop} aria-label="Note tools">
      <Flex align="center" gap="2">
        <ToolbarButton iconOnly aria-label="Toggle navigation">
          <PanelLeftIcon />
        </ToolbarButton>
        <ToolbarTitle>Nature Walks</ToolbarTitle>
      </Flex>
      <Flex align="center" gap="2">
        <ToolbarGroup>
          <ToolbarButton iconOnly aria-label="Lock note">
            <LockIcon />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Duplicate note">
            <CopyIcon />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="More">
            <MoreIcon />
          </ToolbarButton>
        </ToolbarGroup>
        {/* No rule after the capsule. The group already draws the boundary — a hairline
            beside it says the same thing twice. A `ToolbarSeparator` earns its place BETWEEN
            loose controls, or inside a group, which is where the declaration above this
            specimen shows one. */}
        <ToolbarButton iconOnly aria-label="Search">
          <SearchIcon />
        </ToolbarButton>
      </Flex>
    </Toolbar>
  );
}
