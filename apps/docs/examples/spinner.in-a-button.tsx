import { HugeiconsIcon } from "@hugeicons/react";
import { CloudUploadIcon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kushagradhawan/kookie-ui-react";

// `loading` puts a Spinner in the icon's place and marks the button busy. The label stays,
// so the button keeps its width and a screen reader still hears what is running.
export default function Example() {
  return (
    <Flex gap="3" align="center">
      <Button emphasis="loud" loading>
        Publishing
      </Button>
      <Button
        emphasis="medium"
        loading
        leading={<HugeiconsIcon icon={CloudUploadIcon} strokeWidth={iconStroke} aria-hidden />}
      >
        Uploading files
      </Button>
    </Flex>
  );
}
