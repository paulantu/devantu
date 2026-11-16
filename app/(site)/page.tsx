import { PageSections } from "@/components/sections/page-sections";

export default function HomePage() {
  return (
    <PageSections
      pageKey="home"
      empty={
        <p className="container-page py-24 text-muted">
          No sections yet. Add some in Admin → Sections.
        </p>
      }
    />
  );
}