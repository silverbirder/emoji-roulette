import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Emoji Roulette",
  description: "Spin the wheel of emojis!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex flex-col">
        <main>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </main>
        <Footer />
        <Toaster />
        {process.env.GA_ID && <GoogleAnalytics gaId={process.env.GA_ID} />}
      </body>
    </html>
  );
}
