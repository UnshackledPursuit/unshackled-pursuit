import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://unshackledpursuit.com'),
  title: "Unshackled Pursuit | Software Development",
  description: "Building software that matters. Custom applications, web development, and visionOS experiences.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fleeting",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Unshackled Pursuit | Software Development",
    description: "Building software that matters. Custom applications, web development, and visionOS experiences.",
    images: ["/screenshot-orbs-beach.png"],
    siteName: "Unshackled Pursuit",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unshackled Pursuit | Software Development",
    description: "Building software that matters. Custom applications, web development, and visionOS experiences.",
    images: ["/screenshot-orbs-beach.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Unshackled Pursuit",
              url: "https://unshackledpursuit.com",
              description:
                "Building software that matters. Custom applications, web development, and visionOS experiences.",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
