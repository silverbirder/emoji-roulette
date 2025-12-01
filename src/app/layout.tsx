import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";

const baseUrl = process.env.BASE_URL ?? "https://emoji-roulette.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  robots: {
    index: true,
  },
  title: "Emoji Roulette",
  description: "Spin the wheel of emojis!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: ["Emoji", "Roulette"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full`}>
      <head>
        <link
          rel="apple-touch-icon"
          type="image/png"
          href="/apple-touch-icon.png"
        ></link>
        <link rel="icon" type="image/png" href="/icon-192x192.png"></link>
      </head>
      <body className="flex min-h-screen flex-col items-center justify-center">
        <main className="flex w-full max-w-2xl flex-grow items-center justify-center px-4">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </main>
        <Toaster />
        <Footer />
        {process.env.GA_ID && <GoogleAnalytics gaId={process.env.GA_ID} />}
      </body>
    </html>
  );
}
