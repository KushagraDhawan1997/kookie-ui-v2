import {
  Avatar,
  Button,
  Flex,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Separator,
  Stack,
  Text,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger render={<Button emphasis="quiet">Shruti Bhatia</Button>} />
      <PopoverContent side="bottom" align="start">
        <Stack gap="4">
          <Flex gap="3" align="center">
            <Avatar fallback="SB" alt="" />
            <Stack gap="1">
              <PopoverTitle>Shruti Bhatia</PopoverTitle>
              <PopoverDescription>Engineering lead, Payments</PopoverDescription>
            </Stack>
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
