import { Flex, MenuItem, SplitButton } from "@kookie-ui/react";

const menu = (
  <>
    <MenuItem>Export as CSV</MenuItem>
    <MenuItem>Export as PDF</MenuItem>
  </>
);

export default function Example() {
  return (
    <Flex gap="4" align="center" wrap="wrap">
      <SplitButton size="1" menuLabel="More export options" menu={menu}>
        Export
      </SplitButton>
      <SplitButton size="2" menuLabel="More export options" menu={menu}>
        Export
      </SplitButton>
      <SplitButton size="3" menuLabel="More export options" menu={menu}>
        Export
      </SplitButton>
      <SplitButton size="4" menuLabel="More export options" menu={menu}>
        Export
      </SplitButton>
    </Flex>
  );
}
