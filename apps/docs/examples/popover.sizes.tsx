import {
  Button,
  Flex,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Stack,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      {(["1", "2", "3", "4"] as const).map((size) => (
        <Popover key={size} size={size}>
          <PopoverTrigger render={<Button emphasis="quiet" bordered>{`Size ${size}`}</Button>} />
          <PopoverContent>
            <Stack gap="1">
              <PopoverTitle>Share link</PopoverTitle>
              <PopoverDescription>Anyone with the link can view this report.</PopoverDescription>
            </Stack>
          </PopoverContent>
        </Popover>
      ))}
    </Flex>
  );
}
