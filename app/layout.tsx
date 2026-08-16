import type { Metadata, Viewport } from "next";
import "./globals.css";

/*
 * Typography (§35).
 *
 * NOTE ON FONTS: the build/dev environment blocks the Google Fonts CDN, so
 * we deliberately do NOT use next/font/google here (it fetches woff2 at build
 * time). Instead globals.css defines premium system-font stacks behind the
 * variables the components already reference (--font-ui / --font-mono /
 * --font-display). To upgrade to self-hosted Inter / JetBrains Mono / Fraunces
 * later, drop the woff2 files into app/fonts/ and add @font-face rules in
 * globals.css that redefine --font-inter / --font-jetbrains / --font-fraunces
 * — no downstream code changes required.
 */

const SITE_URL = "https://adarsh-vlsi.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Adarsh Swarup Maharana — VLSI · ASIC · Physical Design · RTL · FPGA",
    template: "%s — Adarsh Swarup Maharana",
  },
  description:
    "Immersive portfolio of Adarsh Swarup Maharana — VLSI / ASIC / Physical Design / RTL / FPGA engineer, with embedded systems work. From RTL toward silicon, an interactive engineering world.",
  keywords: [
    "VLSI",
    "ASIC",
    "Physical Design",
    "RTL",
    "FPGA",
    "Verilog",
    "Embedded Systems",
    "Adarsh Swarup Maharana",
  ],
  authors: [{ name: "Adarsh Swarup Maharana" }],
  creator: "Adarsh Swarup Maharana",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Adarsh Swarup Maharana — VLSI Portfolio",
    title: "Adarsh Swarup Maharana — VLSI · ASIC · Physical Design · RTL · FPGA",
    description:
      "An interactive engineering world: from RTL toward silicon. VLSI / ASIC / Physical Design / RTL / FPGA, with embedded systems.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adarsh Swarup Maharana — VLSI · ASIC · Physical Design",
    description:
      "An interactive engineering world: from RTL toward silicon.",
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#06070a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
