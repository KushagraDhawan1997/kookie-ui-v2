"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Switch,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <Flex gap="5" align="center">
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger
          render={
            <Button iconOnly aria-label="Notifications">
              <HugeiconsIcon icon={Notification01Icon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          }
        />
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
      <Flex gap="2" align="center" render={<label />}>
        <Switch checked={open} onCheckedChange={setOpen} />
        <Text size="2">Show the tooltip</Text>
      </Flex>
    </Flex>
  );
}
