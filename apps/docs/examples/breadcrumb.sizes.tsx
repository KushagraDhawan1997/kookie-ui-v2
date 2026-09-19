import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Stack,
} from "@kookie-ui/react";

const SIZES = ["1", "2", "3"] as const;

export default function Example() {
  return (
    <Stack gap="4">
      {SIZES.map((size) => (
        <Breadcrumb key={size} size={size} label={`Path at size ${size}`}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Website redesign</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>
      ))}
    </Stack>
  );
}
