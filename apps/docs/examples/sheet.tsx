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
  Text,
  TextField,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Sheet side="inline-end">
      <SheetTrigger render={<Button emphasis="medium">Filters</Button>} />
      <SheetContent>
        <Toolbar>
          <ToolbarTitle render={<SheetTitle />}>Filters</ToolbarTitle>
          <SheetClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="6">
          <SheetDescription>Narrow the deploys shown on this page.</SheetDescription>
          <Stack gap="3">
            <Text size="2" weight="medium">Branch</Text>
            <TextField placeholder="main" aria-label="Branch" />
          </Stack>
          <Flex gap="3" justify="flex-end">
            <SheetClose render={<Button emphasis="quiet" bordered>Reset</Button>} />
            <SheetClose render={<Button emphasis="loud">Apply</Button>} />
          </Flex>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
