import { HugeiconsIcon } from "@hugeicons/react";
import { Share08Icon, SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { Flex, Stack, Toolbar, ToolbarButton, ToolbarTitle, iconStroke } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Stack gap="4" style={{ minWidth: "28rem" }}>
      {SIZES.map((size) => (
        <Toolbar key={size} size={size} aria-label={`Project tools, size ${size}`}>
          <Flex align="center" gap="2">
            <ToolbarButton iconOnly aria-label="Show sidebar">
              <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={iconStroke} aria-hidden />
            </ToolbarButton>
            <ToolbarTitle>Q3 planning</ToolbarTitle>
          </Flex>
          <ToolbarButton leading={<HugeiconsIcon icon={Share08Icon} strokeWidth={iconStroke} aria-hidden />}>
            Share
          </ToolbarButton>
        </Toolbar>
      ))}
    </Stack>
  );
}
