import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "@/styles/globals.css";

import { themeInitScript } from "@/lib/theme";

import { Providers } from "./providers";

// Lato 2.0 (SIL OFL 1.1), self-hosted: Google Fonts' Lato has no 500/600,
// which the Figma designs use throughout. The files report an ascent of 0.81em and a descent of
// 0.20em, but Figma lays Lato out with 0.987em / 0.213em (its "Auto" line height is 1.2em). The
// overrides below give the browser Figma's vertical metrics, so a line box places its text where
// Figma does (about 1 to 2px lower than the raw files) and `line-height: normal` is 1.2em.
const lato = localFont({
  src: [
    { path: "../styles/fonts/lato/Lato-Regular.woff2", weight: "400", style: "normal" },
    { path: "../styles/fonts/lato/Lato-Medium.woff2", weight: "500", style: "normal" },
    { path: "../styles/fonts/lato/Lato-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../styles/fonts/lato/Lato-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-lato",
  display: "swap",
  declarations: [
    { prop: "ascent-override", value: "98.7%" },
    { prop: "descent-override", value: "21.3%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "SambaNova Cloud",
    template: "%s | SambaNova Cloud",
  },
  description: "Build AI applications faster with SambaNova. Blazing fast inference.",
};

export const viewport: Viewport = {
  // Dark by default: the browser draws its own UI (scrollbars, form controls) dark before the CSS loads.
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Dark is the default, also without JavaScript. The theme-init script sets data-theme before
    // paint (a saved Light or System choice, when the switcher is on), so the server markup and
    // the client DOM can differ on purpose.
    <html
      lang="en"
      data-theme="dark"
      className={`${lato.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* Applies the saved theme synchronously, before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
