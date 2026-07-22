import type { Metadata } from "next";
import { headers } from "next/headers";
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

const baseMetadata = {
  title: {
    default: "FAULTLINE — Decision Observability",
    template: "%s · FAULTLINE",
  },
  description:
    "Detect strategic contradictions, stress-test decisions, and calibrate organizational judgment before reality collects the cost.",
  applicationName: "FAULTLINE",
  keywords: ["decision intelligence", "decision observability", "RAG", "scenario simulation", "organizational calibration"],
  openGraph: {
    title: "FAULTLINE — Find the fault line before the company breaks.",
    description: "Decision observability for teams operating under uncertainty.",
    type: "website",
    siteName: "FAULTLINE",
    images: [{ url: "/og.png", width: 1792, height: 939, alt: "FAULTLINE decision observability" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAULTLINE — Decision Observability",
    description: "Find the contradiction before it becomes an expensive failure.",
    images: ["/og.png"],
  },
} satisfies Metadata;

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(host ? `${protocol}://${host}` : "https://faultline-decision-os.openai.site");
  return { ...baseMetadata, metadataBase };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
