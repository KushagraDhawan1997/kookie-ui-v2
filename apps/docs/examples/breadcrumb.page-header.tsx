import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Button,
  Flex,
  Heading,
  Stack,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3" style={{ minWidth: "24rem" }}>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Members</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Shruti Bhatia</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <Flex justify="space-between" align="center" gap="4">
        <Heading size="6" render={<h1 />}>
          Shruti Bhatia
        </Heading>
        <Flex gap="2">
          <Button>Reset password</Button>
          <Button emphasis="loud">Edit role</Button>
        </Flex>
      </Flex>
    </Stack>
  );
}
