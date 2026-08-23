import {
  Button,
  Field,
  FieldLabel,
  Flex,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  TextField,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger render={<Button emphasis="quiet" bordered>Rename</Button>} />
      <PopoverContent>
        <Stack gap="4">
          <Stack gap="1">
            <PopoverTitle>Rename project</PopoverTitle>
            <PopoverDescription>This changes the name everywhere it appears.</PopoverDescription>
          </Stack>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <TextField defaultValue="api-gateway" />
          </Field>
          <Flex gap="3" justify="flex-end">
            <PopoverClose render={<Button emphasis="quiet">Cancel</Button>} />
            <PopoverClose render={<Button tone="accent" emphasis="loud">Save</Button>} />
          </Flex>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}
