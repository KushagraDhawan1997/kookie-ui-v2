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
} from "@kookie-ui/react";

// `side="bottom"` is the default. On a phone the panel is the full width of the window.
// On a wider window its width stops at a size that suits one task.
export default function Example() {
  return (
    <Sheet>
      <SheetTrigger render={<Button emphasis="medium">Share project</Button>} />
      <SheetContent>
        <Stack gap="6">
          <Stack gap="2">
            <SheetTitle>Share project</SheetTitle>
            <SheetDescription>Anyone with the link can view this project.</SheetDescription>
          </Stack>
          <Flex gap="3" justify="flex-end">
            <SheetClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
            <SheetClose render={<Button emphasis="loud">Copy link</Button>} />
          </Flex>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
