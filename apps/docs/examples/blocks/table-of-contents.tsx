import { TableOfContents } from "../../blocks/table-of-contents";

export default function Example() {
  return (
    <TableOfContents
      entries={[
        { id: "installing", title: "Installing", level: 2 },
        { id: "the-theme", title: "The theme", level: 2 },
        { id: "appearance", title: "Appearance", level: 3 },
        { id: "density", title: "Density", level: 3 },
        { id: "next-steps", title: "Next steps", level: 2 },
      ]}
      current="the-theme"
    />
  );
}
