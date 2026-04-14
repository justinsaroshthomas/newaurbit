import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ClerkProvider } from "@clerk/nextjs";
import { AppConfigProvider } from "@/context/AppConfigContext";
import "./globals.css";


export const metadata: Metadata = {
  title: "Aurbit — Your Social Orbit",
  description: "Connect, share, and explore your social universe with Aurbit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >

        <body suppressHydrationWarning>

          <AppConfigProvider>
            {children}
          </AppConfigProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

