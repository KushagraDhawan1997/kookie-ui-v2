import { Box, Button, Flex, Stack, Theme } from "@kushagradhawan/kookie-ui-react";

const STEPS = ["2", "5", "9"] as const;

// The same toolbar over a picture at three material steps. Each step lets less of the picture
// through, and "9" is solid. The `backdrop` region marks where the picture passes behind.
export default function Example() {
  return (
    <Box
      p="4"
      render={<section aria-label="Material steps" />}
      style={{ minWidth: "18rem", backgroundImage: "url(/backdrop.jpg)", backgroundSize: "cover" }}
    >
      <Stack gap="4">
        {STEPS.map((step) => (
          <Theme key={step} material={step}>
            <Box backdrop>
              <Flex gap="2" align="center" wrap="wrap">
                <Button emphasis="loud">Export</Button>
                <Button emphasis="medium">Step {step}</Button>
                <Button emphasis="quiet">Rotate</Button>
              </Flex>
            </Box>
          </Theme>
        ))}
      </Stack>
    </Box>
  );
}
