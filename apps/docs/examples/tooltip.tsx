import { Button, Flex, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@kookie-ui/react";

const ACTIONS = ["Undo", "Redo", "Comment"] as const;

export default function Example() {
  return (
    <TooltipProvider>
      <Flex gap="2">
        {ACTIONS.map((label) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button emphasis="quiet" iconOnly aria-label={label}>
                  {label.slice(0, 1)}
                </Button>
              }
            />
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </Flex>
    </TooltipProvider>
  );
}
