import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@kushagradhawan/kookie-ui-react";

// `dir` is the platform attribute. Set it here or on any ancestor, and the chevrons point
// the other way.
export default function Example() {
  return (
    <Box dir="rtl" lang="ar">
      <Breadcrumb label="مسار الصفحة">
        <BreadcrumbItem>
          <BreadcrumbLink href="#">الرئيسية</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">المشاريع</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>الإعدادات</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
    </Box>
  );
}
