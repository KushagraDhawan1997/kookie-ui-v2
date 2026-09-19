import { Flex, MenuItem, SplitButton, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <SplitButton
        disabled
        emphasis="loud"
        menuLabel="More deploy options"
        menu={
          <>
            <MenuItem>Deploy to staging</MenuItem>
            <MenuItem>Deploy to preview</MenuItem>
          </>
        }
      >
        Deploy
      </SplitButton>
      <Text size="2" emphasis="medium">
        Two checks are still running.
      </Text>
    </Flex>
  );
}
