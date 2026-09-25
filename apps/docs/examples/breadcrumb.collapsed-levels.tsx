"use client";

import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

const HIDDEN = ["Clients", "Northwind", "2026", "Quarterly reports"];

export default function Example() {
  const [opened, setOpened] = React.useState<string | null>(null);

  return (
    <Stack gap="4">
      <Breadcrumb label="Folder path">
        <BreadcrumbItem>
          <BreadcrumbLink href="#">All files</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbEllipsis
            label="Show hidden folders"
            items={HIDDEN.map((name) => ({ label: name, onClick: () => setOpened(name) }))}
          />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Q3</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Revenue summary.pdf</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <Text size="2" emphasis="medium">
        {opened ? `Opened the ${opened} folder.` : "Open the menu to go to a hidden folder."}
      </Text>
    </Stack>
  );
}
