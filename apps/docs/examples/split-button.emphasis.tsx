import { Flex, MenuItem, SplitButton } from "@kookie-ui/react";

const menu = (
  <>
    <MenuItem>Save as draft</MenuItem>
    <MenuItem>Save as template</MenuItem>
  </>
);

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <SplitButton emphasis="loud" menuLabel="More save options" menu={menu}>
        Publish
      </SplitButton>
      <SplitButton emphasis="medium" menuLabel="More save options" menu={menu}>
        Save
      </SplitButton>
      <SplitButton emphasis="quiet" bordered menuLabel="More save options" menu={menu}>
        Save
      </SplitButton>
    </Flex>
  );
}
