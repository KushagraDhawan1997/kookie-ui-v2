import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
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
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Popover size={size}>
      <PopoverTrigger render={<Button emphasis="quiet" bordered>Rename</Button>} />
      <PopoverContent>
        <Toolbar>
          <ToolbarTitle render={<PopoverTitle />}>Rename project</ToolbarTitle>
          <PopoverClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="4">
          <PopoverDescription>This changes the name everywhere it appears.</PopoverDescription>
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
