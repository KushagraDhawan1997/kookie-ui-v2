import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Flex,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// `side` follows the reading direction. Under `dir="rtl"`, `inline-end` opens the panel
// from the left, and a swipe to the left closes it.
export default function Example() {
  return (
    <Box dir="rtl">
      <Sheet side="inline-end">
        <SheetTrigger render={<Button emphasis="medium">Details</Button>} />
        <SheetContent>
          <Toolbar>
            <ToolbarTitle render={<SheetTitle />}>Invoice details</ToolbarTitle>
            <SheetClose
              render={
                <ToolbarButton iconOnly aria-label="Close">
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
                </ToolbarButton>
              }
            />
          </Toolbar>
          <SheetDescription>Paid on 1 September by card.</SheetDescription>
          <Toolbar aria-label="Actions">
            <Flex flexGrow="1" justify="flex-end" gap="3">
              <SheetClose render={<ToolbarButton emphasis="loud">Done</ToolbarButton>} />
            </Flex>
          </Toolbar>
        </SheetContent>
      </Sheet>
    </Box>
  );
}
