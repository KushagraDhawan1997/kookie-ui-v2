import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  Checkbox,
  Field,
  FieldItem,
  FieldLabel,
  Flex,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const STATUSES = ["Queued", "Running", "Failed", "Finished"];

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            emphasis="quiet"
            bordered
            leading={<HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={iconStroke} aria-hidden />}
          >
            Filter
          </Button>
        }
      />
      <PopoverContent align="start">
        <Toolbar>
          <ToolbarTitle render={<PopoverTitle />}>Filter jobs</ToolbarTitle>
          <PopoverClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="4">
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Stack gap="5">
              {STATUSES.map((status) => (
                <FieldItem key={status}>
                  <Checkbox defaultChecked={status !== "Finished"} />
                  <FieldLabel>{status}</FieldLabel>
                </FieldItem>
              ))}
            </Stack>
          </Field>
        </Stack>
        <Toolbar aria-label="Actions">
          <Flex flexGrow="1" justify="flex-end" gap="3">
            <PopoverClose render={<ToolbarButton emphasis="quiet">Reset</ToolbarButton>} />
            <PopoverClose render={<ToolbarButton emphasis="loud">Apply</ToolbarButton>} />
          </Flex>
        </Toolbar>
      </PopoverContent>
    </Popover>
  );
}
