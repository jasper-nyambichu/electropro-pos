import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
// @ts-ignore: Next.js handles CSS imports for global styles
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ElectroPro POS",
  description: "Point of sale system for electronics retail",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#b32200",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sourceSans.variable}>
      <body className="bg-background text-on-background font-body-reg">
        {children}
      </body>
    </html>
  );
}