import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// `context` holds quiet facts about the conversation, such as how much
// context is left or what a reply costs. It sits below the composer.
export default function Example() {
  return (
    <Composer
      context={
        <Flex justify="space-between">
          <Text size="2" emphasis="medium">
            62% of context left
          </Text>
          <Text size="2" emphasis="medium">
            About $0.04 per reply
          </Text>
        </Flex>
      }
    >
      <ComposerInput aria-label="Message" placeholder="Ask a follow-up…" />
      <ComposerRow>
        <Button>Opus 5</Button>
        <ComposerSend icons={{ ready: <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={iconStroke} aria-hidden /> }} />
      </ComposerRow>
    </Composer>
  );
}
