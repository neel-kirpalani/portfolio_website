import type { Metadata, Viewport } from "next";
import { Domine, Inter } from "next/font/google";
import { about } from "@/content/projects";
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

/**
 * Structured data. This is how a search engine learns that this domain, the
 * LinkedIn profile, the Instagram account and the GitHub account are one
 * person rather than four unrelated pages.
 */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Neel Kirpalani",
  url: "https://neelkirpalani.com",
  image: "https://neelkirpalani.com/neel.jpg",
  jobTitle: "Student",
  description:
    "Senior at Hong Kong International School. Builds systems that turn a messy real-world signal into something a person can act on.",
  alumniOf: {
    "@type": "HighSchool",
    name: "Hong Kong International School",
  },
  founderOf: {
    "@type": "Organization",
    name: "REMAKE",
    url: "https://remake.beauty/",
  },
  knowsAbout: [
    "Machine learning",
    "Computer vision",
    "Robotics",
    "Embedded systems",
    "Mobile development",
  ],
  sameAs: [
    about.links.linkedin,
    about.links.instagram,
    about.links.github,
  ],
};

const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Neel Kirpalani",
  url: "https://neelkirpalani.com",
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
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personSchema, siteSchema]),
          }}
        />
        {children}
      </body>
    </html>
  );
}
