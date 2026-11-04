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
  Stack,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      {(["1", "2", "3", "4"] as const).map((size) => (
        <Popover key={size} size={size}>
          <PopoverTrigger render={<Button emphasis="quiet" bordered>{`Size ${size}`}</Button>} />
          <PopoverContent>
            <Toolbar>
              <ToolbarTitle render={<PopoverTitle />}>Share link</ToolbarTitle>
              <PopoverClose
                render={
                  <ToolbarButton iconOnly aria-label="Close">
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
                  </ToolbarButton>
                }
              />
            </Toolbar>
            <PopoverDescription>Anyone with the link can view this report.</PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </Flex>
  );
}
