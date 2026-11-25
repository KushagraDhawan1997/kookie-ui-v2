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
        </Stack>
        <Toolbar aria-label="Actions">
          <Flex flexGrow="1" justify="flex-end" gap="3">
            <SheetClose render={<ToolbarButton emphasis="loud">Copy link</ToolbarButton>} />
          </Flex>
        </Toolbar>
      </SheetContent>
    </Sheet>
  );
}
