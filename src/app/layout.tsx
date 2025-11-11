import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Provider } from "jotai";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "N8N - Workflow Automation Clone",
  description: "N8N - Workflow Automation Clone",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} antialiased`}>
        <TRPCReactProvider>
          <NuqsAdapter>
            <Provider>
              {children} <Toaster />
            </Provider>
          </NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
