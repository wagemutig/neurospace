import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (SIL Open Font License): loads with the app, no request to Google at build time.
const display = localFont({
  src: "./fonts/BricolageGrotesque-Latin.woff2",
  weight: "700 800",
  variable: "--font-bricolage",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/DMSans-Latin.woff2",
  weight: "400 700",
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "neurospace",
  description: "Sensomotorisches Heimtraining, neurologisch begleitet.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#121a16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de-CH" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
