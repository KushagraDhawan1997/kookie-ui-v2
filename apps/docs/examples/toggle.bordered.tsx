import { Flex, Toggle, ToggleGroup } from "@kookie-ui/react";

export default function Example() {
  return (
    <ToggleGroup aria-label="File types" defaultValue={["pdf"]} render={<Flex gap="2" wrap="wrap" />}>
      <Toggle bordered value="pdf">
        PDF
      </Toggle>
      <Toggle bordered value="images">
        Images
      </Toggle>
      <Toggle bordered value="video">
        Video
      </Toggle>
    </ToggleGroup>
  );
}
