import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCta } from "@/components/layout/FloatingCta";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { AosInit } from "@/components/providers/AosInit";
import { GuideBot } from "@/components/visual/GuideBot";
import { VisitorProvider } from "@/components/providers/VisitorProvider";
import { ScrollProgress } from "@/components/visual/ScrollProgress";
import { PointerEffects } from "@/components/visual/PointerEffects";
import { Intro } from "@/components/visual/Intro";
import { site } from "@/content/site";
import { ogImageUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

const defaultTitle = "Dental Sleep Medicine Program for Your Team | OSA + TMD | Beyonn";
const defaultDescription =
  "Add Obstructive Sleep Apnea and Temporomandibular Joint Disorder treatment to your practice. Beyonn trains your team, gives you the systems and coaches you until it runs.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: defaultTitle, template: "%s | Beyonn" },
  description: defaultDescription,
  applicationName: "Beyonn",
  referrer: "origin-when-cross-origin",
  keywords: ["Beyonn", "dental sleep medicine", "obstructive sleep apnea", "TMD", "TMJ", "oral appliance therapy", "sleep apnea training for dentists", "Dr. Rodney Willey"],
  authors: [{ name: "Beyonn", url: site.url }],
  creator: "Beyonn",
  publisher: "Beyonn",
  category: "health",
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: site.name,
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: ogImageUrl(defaultTitle, "The OSA + TMD program your team can run"), width: 1200, height: 630, alt: "Beyonn: the OSA + TMD program your team can run" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImageUrl(defaultTitle, "The OSA + TMD program your team can run")],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  appleWebApp: { title: "Beyonn", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const orgJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: "Beyonn",
    url: site.url,
    logo: `${site.url}/assets/beyonn-logo.png`,
    email: site.email,
    telephone: "+1-888-264-1981",
    slogan: site.line,
    description: defaultDescription,
    sameAs: [site.linkedin.beyonn],
    contactPoint: [{ "@type": "ContactPoint", telephone: "+1-888-264-1981", email: site.email, contactType: "customer service", areaServed: "US", availableLanguage: "English" }],
    founder: { "@type": "Person", name: "Dr. Rodney Willey", honorificSuffix: "DDS, D.ACSDD, D.ASBA", jobTitle: "Founder & Clinical Lead" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: "Beyonn",
    url: site.url,
    publisher: { "@id": `${site.url}/#organization` },
    inLanguage: "en-US",
  },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} data-scroll-behavior="smooth">
      <body>
        <Intro />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-dawn focus:px-5 focus:py-3 focus:font-semibold focus:text-ink">
          Skip to content
        </a>
        <VisitorProvider>
          <SmoothScroll>
            <ScrollProgress />
            <Header />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer />
            <FloatingCta />
            <GuideBot />
            <AosInit />
            <PointerEffects />
          </SmoothScroll>
        </VisitorProvider>
        <JsonLd data={orgJsonLd} />
      </body>
    </html>
  );
}
