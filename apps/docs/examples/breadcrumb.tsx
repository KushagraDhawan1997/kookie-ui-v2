import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@kookie-ui/react";
import type { TypeSize } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: TypeSize }) {
  return (
    <Breadcrumb size={size}>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbEllipsis
          items={[
            { label: "Docs", href: "#" },
            { label: "Foundations", href: "#" },
            { label: "Patterns", href: "#" },
          ]}
        />
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">Components</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
