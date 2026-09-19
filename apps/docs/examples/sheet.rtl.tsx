import {
  Box,
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Stack,
} from "@kookie-ui/react";

// `side` follows the reading direction. Under `dir="rtl"`, `inline-end` opens the panel
// from the left, and a swipe to the left closes it.
export default function Example() {
  return (
    <Box dir="rtl">
      <Sheet side="inline-end">
        <SheetTrigger render={<Button emphasis="medium">Details</Button>} />
        <SheetContent>
          <Stack gap="6">
            <Stack gap="2">
              <SheetTitle>Invoice details</SheetTitle>
              <SheetDescription>Paid on 1 September by card.</SheetDescription>
            </Stack>
            <SheetClose render={<Button emphasis="loud">Done</Button>} />
          </Stack>
        </SheetContent>
      </Sheet>
    </Box>
  );
}
