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
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Sheet side="inline-end">
      <SheetTrigger render={<Button emphasis="medium">Filters</Button>} />
      <SheetContent>
        <Stack gap="6">
          <Stack gap="2">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the deploys shown on this page.</SheetDescription>
          </Stack>
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
