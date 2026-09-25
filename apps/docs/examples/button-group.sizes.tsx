import { Button, ButtonGroup, Stack } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Stack gap="4" align="flex-start">
      {SIZES.map((size) => (
        <ButtonGroup key={size} size={size} aria-label={`View at size ${size}`}>
          <Button>List</Button>
          <Button>Board</Button>
          <Button>Calendar</Button>
        </ButtonGroup>
      ))}
    </Stack>
  );
}
