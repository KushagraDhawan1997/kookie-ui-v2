import { Box, Button, Flex } from "@kookie-ui/react";

// `backdrop` marks a region where content passes behind the controls, such as a toolbar over a
// picture. Every control inside it then uses the theme's material. Set it once on the region.
export default function Example() {
  return (
    <Box
      p="4"
      render={<section aria-label="Photo editor" />}
      style={{ minWidth: "22rem", backgroundImage: "url(/backdrop.jpg)", backgroundSize: "cover" }}
    >
      <Box backdrop>
        <Flex gap="2">
          <Button emphasis="medium">Crop</Button>
          <Button emphasis="medium">Adjust</Button>
          <Button emphasis="medium">Filters</Button>
        </Flex>
      </Box>
    </Box>
  );
}
