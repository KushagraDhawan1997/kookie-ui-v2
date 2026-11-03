"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  ButtonGroup,
  Flex,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const PAGES = 3;

export default function Example() {
  const [page, setPage] = React.useState(1);

  return (
    <Flex gap="4" align="center">
      <Text size="2" emphasis="medium">
        Page {page} of {PAGES}
      </Text>
      <ButtonGroup aria-label="Pages">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                iconOnly
                aria-label="Previous page"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
              </Button>
            }
          />
          <TooltipContent>Previous page</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                iconOnly
                aria-label="Next page"
                disabled={page === PAGES}
                onClick={() => setPage((p) => p + 1)}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
              </Button>
            }
          />
          <TooltipContent>Next page</TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </Flex>
  );
}
