import type { Metadata, Viewport } from "next";
import { Domine, Inter } from "next/font/google";
import "./globals.css";

const domine = Domine({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-domine",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute base for canonical and social URLs; without it Next cannot build
  // absolute links, which link previews need.
  metadataBase: new URL("https://neelkirpalani.com"),
  title: "Neel Kirpalani",
  description:
    "Senior at Hong Kong International School. I build systems that take a messy real-world signal and turn it into something a person can act on.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Neel Kirpalani",
    description:
      "Systems that take a messy real-world signal and turn it into something a person can act on.",
    url: "https://neelkirpalani.com",
    siteName: "Neel Kirpalani",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the page paint under the notch; env(safe-area-inset-*) then pads it
  // back out. Without this those values are all 0px.
  viewportFit: "cover",
  // The software keyboard shrinks the layout viewport instead of overlaying it.
  interactiveWidget: "resizes-content",
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${domine.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
