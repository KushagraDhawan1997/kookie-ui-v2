import { Footer } from "../../blocks/footer";

export default function Example() {
  return (
    <Footer
      groups={[
        {
          title: "Product",
          links: [
            { label: "Overview", href: "/product" },
            { label: "Pricing", href: "/pricing" },
            { label: "Changelog", href: "/changelog" },
          ],
        },
        {
          title: "Developers",
          links: [
            { label: "Documentation", href: "/docs" },
            { label: "API reference", href: "/api" },
            { label: "Status", href: "/status" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "/about" },
            { label: "Careers", href: "/careers" },
            { label: "Contact", href: "/contact" },
          ],
        },
      ]}
      note="© 2026 Kookie"
      legal={[
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ]}
    />
  );
}
