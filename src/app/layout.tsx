import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/host-grotesk/400.css";
import "@fontsource/host-grotesk/500.css";
import "@fontsource/host-grotesk/700.css";
import { SessionProvider } from "@/app/sis/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://syncanatech.com"),
  title: {
    default: "Syncana Technologies",
    template: "%s | Syncana Technologies",
  },
  description:
    "Innovative, scalable IT solutions for growing businesses in Mozambique.",
  applicationName: "Syncana Technologies",
  keywords: [
    "Managed IT Services",
    "Cybersecurity",
    "Microsoft 365",
    "Maputo",
    "Mozambique",
    "MSP",
    "Business Continuity",
  ],
  openGraph: {
    type: "website",
    url: "https://syncanatech.com",
    siteName: "Syncana Technologies",
    title: "Syncana Technologies",
    description:
      "Innovative, scalable IT solutions for growing businesses in Mozambique.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syncana Technologies",
    description:
      "Innovative, scalable IT solutions for growing businesses in Mozambique.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/site-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
