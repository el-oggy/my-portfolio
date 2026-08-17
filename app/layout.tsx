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
    default: "Adarsh Swarup Maharana — Embedded Systems · IoT · Electronics",
    template: "%s — Adarsh Swarup Maharana",
  },
  description:
    "Immersive portfolio of Adarsh Swarup Maharana — embedded systems, IoT, and electronics engineer: microcontrollers, sensors, wireless systems, drones, and the firmware that brings them to life.",
  keywords: [
    "Embedded Systems",
    "IoT",
    "Electronics",
    "STM32",
    "ESP32",
    "Arduino",
    "Drones",
    "Robotics",
    "Firmware",
    "Adarsh Swarup Maharana",
  ],
  authors: [{ name: "Adarsh Swarup Maharana" }],
  creator: "Adarsh Swarup Maharana",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Adarsh Swarup Maharana — Embedded Portfolio",
    title: "Adarsh Swarup Maharana — Embedded Systems · IoT · Electronics",
    description:
      "An interactive electronics world: microcontrollers, sensors, wireless systems, drones, and firmware.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adarsh Swarup Maharana — Embedded Systems · IoT",
    description: "An interactive electronics world: from breadboard to flying drone.",
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fbf9f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Gloria+Hallelujah&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
