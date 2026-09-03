import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riina's Collections — Kasoa, Ghana",
  description: "Cottage skirts, joggers, dresses, and everyday basics — from Kasoa, sent nationwide.",
  icons: {
    icon: "/Riinas_Collections_Logo_Combined.svg",
    apple: "/Riinas_Collections_Logo_Combined.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/Riinas_Collections_Logo_Combined.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,500&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
