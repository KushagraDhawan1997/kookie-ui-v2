import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Stack,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// `side="bottom"` is the default. On a phone the panel is the full width of the window.
// On a wider window its width stops at a size that suits one task.
export default function Example() {
  return (
    <Sheet>
      <SheetTrigger render={<Button emphasis="medium">Share project</Button>} />
      <SheetContent>
        <Toolbar>
          <ToolbarTitle render={<SheetTitle />}>Share project</ToolbarTitle>
          <SheetClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="6">
          <SheetDescription>Anyone with the link can view this project.</SheetDescription>
          <Flex gap="3" justify="flex-end">
            <SheetClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
            <SheetClose render={<Button emphasis="loud">Copy link</Button>} />
          </Flex>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
