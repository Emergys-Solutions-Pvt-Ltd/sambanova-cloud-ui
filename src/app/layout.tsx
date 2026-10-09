import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "@/styles/globals.css";

import { themeInitScript } from "@/lib/theme";

import { Providers } from "./providers";

// Lato 2.0 (SIL OFL 1.1), self-hosted: Google Fonts' Lato has no 500/600,
// which the Figma designs use throughout.
const lato = localFont({
  src: [
    { path: "../styles/fonts/lato/Lato-Regular.woff2", weight: "400", style: "normal" },
    { path: "../styles/fonts/lato/Lato-Medium.woff2", weight: "500", style: "normal" },
    { path: "../styles/fonts/lato/Lato-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../styles/fonts/lato/Lato-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SambaNova Cloud",
    template: "%s · SambaNova Cloud",
  },
  description: "Build AI applications faster with SambaNova. Blazing fast inference.",
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme is set by the theme-init script before paint, so the server
    // markup and the client DOM differ on purpose.
    <html lang="en" className={`${lato.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        {/* Applies the saved theme synchronously, before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
