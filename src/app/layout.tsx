import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "./components/Header";
import { server } from "./../mocks/server";
import { MSWProvider } from "./components/msw-provider";
import { isPagesConfig, isDevOrTestEnv, basePath } from "./env.config";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Scan Shelf",
  description: "An EPUB OCR reader app",
};

if (isPagesConfig || isDevOrTestEnv) {
  server.listen();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href={`${basePath}/manifest.webmanifest`} />
        <link rel="apple-touch-icon" href={`${basePath}/icons/icon-192x192.png`} />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <MSWProvider>{children}</MSWProvider>
      </body>
    </html>
  );
}
