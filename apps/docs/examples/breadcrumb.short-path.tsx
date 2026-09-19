import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@kookie-ui/react";

export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">Billing</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>Invoice INV-0042</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
