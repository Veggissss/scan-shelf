import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "./components/Header";
import { server } from "./../mocks/server";
import { MSWProvider } from "./components/msw-provider";
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

const isPageConfig = process.env.NEXT_PUBLIC_DEPLOY_ENVIRONMENT === 'pages';
const isDevOrTestEnv = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
if (isPageConfig || isDevOrTestEnv) {
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
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
