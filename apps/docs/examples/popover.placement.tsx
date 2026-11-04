import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const SIDES = ["top", "right", "bottom", "left"] as const;

export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      {SIDES.map((side) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button emphasis="quiet" bordered>{`Open ${side}`}</Button>} />
          <PopoverContent side={side} align="start">
            <Toolbar>
              <ToolbarTitle render={<PopoverTitle />}>Preferred side: {side}</ToolbarTitle>
              <PopoverClose
                render={
                  <ToolbarButton iconOnly aria-label="Close">
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
                  </ToolbarButton>
                }
              />
            </Toolbar>
            <PopoverDescription>
              The panel moves to the other side when this side has no room.
            </PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </Flex>
  );
}
