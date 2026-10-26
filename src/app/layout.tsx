import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import PrefsBootstrap from "@/components/PrefsBootstrap";
import AppHeader from "@/components/AppHeader";
import Toaster from "@/components/Toaster";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HullData — Powerboat Reference Library",
  description:
    "An interactive reference library of production powerboats — motor yachts, trawlers, sportfishers, express cruisers, and center consoles. Pick a builder and read every model it made, with full specs.",
  applicationName: "HullData",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "HullData", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
};

// Sets the theme attribute before first paint so there's no flash, reading the
// same localStorage key the persisted store uses.
const themeScript = `(function(){try{var r=localStorage.getItem('hulldata-prefs');var t='dark';if(r){var s=JSON.parse(r);if(s&&s.state&&s.state.theme){t=s.state.theme;}}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <PrefsBootstrap />
          <ServiceWorkerRegistrar />
          <AppHeader />
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
