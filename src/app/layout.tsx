import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hermelínové peklo",
  description: "oficiální blog Michala Bureše",
  authors: [{ name: "Michal Bureš" }],
  keywords: ["blog", "programování", "technologie", "Michal Bureš"],
  openGraph: {
    title: "Hermelínové peklo",
    description: "oficiální blog Michala Bureše",
    type: "website",
    locale: "cs_CZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
