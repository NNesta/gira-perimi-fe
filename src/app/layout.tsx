import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";

import { ServiceWorker } from "@/components/pwa/service-worker";
import { INSTALL_PROMPT_SCRIPT } from "@/lib/pwa";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin", "latin-ext"], display: "swap" });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const DESCRIPTION =
  "Iga amategeko y’umuhanda mu Kinyarwanda: amasomo asobanutse, ibyapa byo ku muhanda, n’ibibazo by’ikizamini cy’uruhushya rw’agateganyo. Witoze nk’uko bigenda kwa Polisi: ibibazo 20 mu minota 20.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Tsinda Neza · Iga amategeko y’umuhanda, utsinde ikizamini",
    template: "%s · Tsinda Neza",
  },
  description: DESCRIPTION,
  applicationName: "Tsinda Neza",
  appleWebApp: { capable: true, title: "Tsinda Neza", statusBarStyle: "default" },
  keywords: [
    "amategeko y’umuhanda",
    "perimi",
    "uruhushya rwo gutwara",
    "ikizamini cya provisoire",
    "ibyapa byo ku muhanda",
    "Rwanda",
    "driving theory test Rwanda",
  ],
  openGraph: {
    type: "website",
    locale: "rw_RW",
    siteName: "Tsinda Neza",
    title: "Tsinda Neza · Iga amategeko y’umuhanda, utsinde ikizamini",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1628" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="rw"
      data-theme="system"
      suppressHydrationWarning
      className={`${jakarta.variable} ${bricolage.variable} antialiased`}
    >
      <head>
        {/* Applies the saved colour theme before the first paint (no flash of the default theme). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Keeps the "install app" prompt for our own button (it can fire before hydration). */}
        <script dangerouslySetInnerHTML={{ __html: INSTALL_PROMPT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
