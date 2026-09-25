import {
  Button,
  Flex,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@kushagradhawan/kookie-ui-react";

const SIDES = ["top", "right", "bottom", "left"] as const;

export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      {SIDES.map((side) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button emphasis="quiet" bordered>{`Open ${side}`}</Button>} />
          <PopoverContent side={side} align="start">
            <PopoverTitle>Preferred side: {side}</PopoverTitle>
            <PopoverDescription>
              The panel moves to the other side when this side has no room.
            </PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </Flex>
  );
}
