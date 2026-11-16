import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { general, seo } = await getSiteSettings();
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${general.name} | ${general.title}`,
      template: `%s | ${general.name}`,
    },
    description: general.description,
    robots: seo.noindex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: "./",
      types: { "application/rss+xml": "/rss.xml" },
    },
    openGraph: {
      type: "website",
      siteName: general.name,
      images: [seo.ogImageUrl || "/og"],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} ${jetbrains.variable}`}
    >
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}