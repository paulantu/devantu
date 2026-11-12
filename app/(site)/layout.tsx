import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSiteSettings } from "@/lib/settings";
import { getVisibleNav } from "@/lib/settings-schema";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSiteSettings();
  const nav = getVisibleNav(s);

  return (
    <>
      <Header nav={nav} name={s.general.name} />
      <main className="flex-1">{children}</main>
      <Footer general={s.general} contact={s.contact} social={s.social} nav={nav} />
    </>
  );
}