import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
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
  iconStroke,
} from "@kookie-ui/react";

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
        <Stack gap="4">
          <PopoverTitle>Filter jobs</PopoverTitle>
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
          <Flex gap="3" justify="flex-end">
            <PopoverClose render={<Button emphasis="quiet">Reset</Button>} />
            <PopoverClose render={<Button emphasis="loud">Apply</Button>} />
          </Flex>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}
