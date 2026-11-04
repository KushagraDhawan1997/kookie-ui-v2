import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Avatar,
  Button,
  Flex,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Separator,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger render={<Button emphasis="quiet">Shruti Bhatia</Button>} />
      <PopoverContent side="bottom" align="start">
        <Toolbar>
          <ToolbarTitle render={<PopoverTitle />}>Shruti Bhatia</ToolbarTitle>
          <PopoverClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="4">
          <Flex gap="3" align="center">
            <Avatar fallback="SB" alt="" />
            <PopoverDescription>Engineering lead, Payments</PopoverDescription>
          </Flex>
          <Separator />
          <Stack gap="2">
            <Text size="2" emphasis="medium">Owns 6 projects in this workspace.</Text>
            <Text size="2" emphasis="medium">Last active 20 minutes ago.</Text>
          </Stack>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}
