import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { Box, Page, Text, iconStroke } from "@kookie-ui/react";

// `mark` sits above the title. Use it for your app's own logo on a front page.
export default function Example() {
  return (
    <Box style={{ maxWidth: "36rem" }}>
      <Page
        mark={<HugeiconsIcon icon={Folder01Icon} strokeWidth={iconStroke} size={40} aria-hidden />}
        title="Archive"
        description="Every file your team has shared, sorted by project."
      >
        <Text size="3">Open a project in the sidebar to see its files.</Text>
      </Page>
    </Box>
  );
}
