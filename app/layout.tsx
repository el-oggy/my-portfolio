import type { Metadata, Viewport } from "next";
import "@/components/itom/src/styles/main.scss";
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

/** Schema.org Person — helps search engines associate the portfolio with
 *  its author and cross-link GitHub / LinkedIn profiles. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Adarsh Swarup Maharana",
  jobTitle: "Embedded Systems · IoT · Electronics Engineer",
  url: SITE_URL,
  email: "mailto:adarshswarupmaharana@gmail.com",
  sameAs: [
    "https://github.com/el-oggy",
    "https://www.linkedin.com/in/adarsh-swarup-maharana-4839763b8/",
  ],
  knowsAbout: [
    "Embedded Systems",
    "IoT",
    "PCB Design",
    "STM32",
    "ESP32",
    "Firmware",
    "Drones",
    "Verilog",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Berhampur",
    addressRegion: "Odisha",
    addressCountry: "IN",
  },
};

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
      <body>
        {/* Keyboard/screen-reader escape hatch out of the immersive canvas */}
        <a
          href="#projects"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:rounded-md focus:border-2 focus:border-[var(--ink)] focus:bg-white focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-[var(--ink)]"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
